/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package wosec.server.controllers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.text.ParseException;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.tomcat.util.http.fileupload.FileItem;
import org.apache.tomcat.util.http.fileupload.FileItemFactory;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.apache.tomcat.util.http.fileupload.disk.DiskFileItemFactory;
import org.apache.tomcat.util.http.fileupload.servlet.ServletFileUpload;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import wosec.server.controllers.eventhandling.NewInstanceEventHandler;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.server.model.WorkflowLanguage;
import wosec.util.Configuration;
import wosec.util.WorkflowXMLToDB;

/**
 *
 * @author murat
 */
public class WorkflowManagementController extends SessionServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if (req.getParameter("page") == null) {
            req.getRequestDispatcher("/WEB-INF/Error.jsp").forward(req, resp);
        }
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        // TODO uuuuuunbedingt auslagern!
        if (req.getParameter("page").equals("upload")) {
            boolean isMultipart = ServletFileUpload.isMultipartContent(req);
            System.out.println(isMultipart);
            // Create a factory for disk-based file items
            FileItemFactory factory = new DiskFileItemFactory();
            // Create a new file upload handler
            ServletFileUpload upload = new ServletFileUpload(factory);
            // Parse the request
            List<FileItem> /* FileItem */ items;
            List<File> rollbackFiles = new LinkedList<File>();
            try {
                items = upload.parseRequest(req);
                System.out.println(items.size());
                System.out.println(items);
                if (items.size() > 1) {
                    FileItem fItem = items.get(0);
                    System.out.println(fItem.getContentType());

                    if (!fItem.getContentType().equals("application/zip") && !fItem.getContentType().equals("application/x-zip-compressed")) {
                        throw new IllegalArgumentException("not a zip file");
                    }

                    //System.out.println(fItem.getName());
                    //System.out.println(fItem.getContentType());
                    ZipInputStream zIn = new ZipInputStream(fItem.getInputStream());
                    String outputDir = Configuration.getProperties().getProperty("SVGDirectory");


                    // zu erst die svg-dateien kopieren, danach in einer extra while-Schleife
                    // die XML-Datei schließen. Grund: SAXReader schließt den Stream
                    while (true) {
                        ZipEntry entry = zIn.getNextEntry();
                        if (entry == null) {
                            break;
                        }
                        //System.out.println(entry.getName());

                        if (entry.getName().split("\\.", -1)[1].equals("svg")) {
                            // EINE SVG-Datei...Kopieren!
                            File f = new File(outputDir + entry.getName());
                            if (f.exists()) {
                                throw new FileAlreadyExistsException("file already exists!");
                            }
                            //FileOutputStream fos = new FileOutputStream(outputDir + entry.getName());
                            FileOutputStream fos = new FileOutputStream(f);
                            int data = 0;
                            while ((data = zIn.read()) != -1) {
                                fos.write(data);
                            }
                            fos.close();
                            rollbackFiles.add(f);
                        } /*else if (entry.getName().split("\\.", -1)[1].equals("xml")) {
                            //Daten...einlesen!
                            session.beginTransaction();
                            WorkflowXMLToDB.importXMLToDB(session, (new SAXReader()).read(zIn));
                            session.getTransaction().commit();
                            // die XML-Datei ist die letzte Datei im Archiv, daher beenden.
                            //break;
                        } else {
                            // nichts von all dem...fehler!
                        }*/

                        //if (entry.getName())
                        //System.out.println(entry.getName());
                    }

                    zIn = new ZipInputStream(items.get(0).getInputStream());
                    while (true) {
                        ZipEntry entry = zIn.getNextEntry();
                        if (entry == null) {
                            rollBackFileCopy(rollbackFiles);
                            break;
                        }

                        if (entry.getName().split("\\.", -1)[1].equals("xml")) {
                            //Daten...einlesen!
                            session.beginTransaction();
                            WorkflowXMLToDB.importXMLToDB(session, (new SAXReader()).read(zIn));
                            session.getTransaction().commit();
                            // die XML-Datei ist die letzte Datei im Archiv, daher beenden.
                            break;
                        }
                    }


                }

                resp.sendRedirect(resp.encodeRedirectURL("WorkflowMgmt"));

                // ZIP-Datei entpacken
                //ZipFile zipFile = new ZipFile(items.get(0).)
                //System.out.println(items.get(0).isInMemory());
                //System.out.println(items.get(0));
            } catch (FileUploadException ex) {
                Logger.getLogger(WorkflowManagementController.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IOException ex) {
                ex.printStackTrace();
                rollBackFileCopy(rollbackFiles);
            } catch (IllegalArgumentException ex) {
                ex.printStackTrace();
            } catch (DocumentException ex) {
                ex.printStackTrace();
                rollBackFileCopy(rollbackFiles);
            }
        } else if (req.getParameter("page").equals("instances") && !"".equals(req.getParameter("workflow")) && "new".equals(req.getParameter("action"))) {
            try {
                Transaction tx = session.beginTransaction();
                //session.flush();
                Workflow wf = (Workflow) session.get(Workflow.class, (String) req.getParameter("workflow"));
                //System.out.println(req.getParameter("user"));
                User user = (User) session.createQuery("from User where userId = ?").setString(0, req.getParameter("user")).uniqueResult();
                //tx.begin();
                //NewInstanceEventHandler.createInstance(wf, session, "newInstance", req);
                NewInstanceEventHandler.createInstance(wf, user, null, session, "createInstance");
                tx.commit();
                resp.sendRedirect(resp.encodeRedirectURL("WorkflowMgmt?page=instances&workflow=" + wf.getWorkflowId()));
            } catch (ParseException ex) {
                ex.printStackTrace();
                Logger.getLogger(WorkflowManagementController.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

    private void rollBackFileCopy(List<File> fileList) {
        for (File f : fileList) {
            f.delete();
        }
    }

    private boolean instancePage(Session session, HttpServletRequest req, HttpServletResponse resp) {
        Workflow wf = (Workflow) session.get(Workflow.class, (String) req.getParameter("workflow"));
        boolean redirectCommited = false;
        req.setAttribute("page", "instances");
        String action = req.getParameter("action");
        if (req.getParameter("instance") != null && action != null) {
            //TODO sicherheitsabfrage einbauen
            String instanceId = req.getParameter("instance");


            if (action.equals("delete")) {
                session.beginTransaction();
                session.createQuery("delete from Instance where instanceId = ?").setString(0, instanceId).executeUpdate();
                session.getTransaction().commit();
                try {
                    resp.sendRedirect(resp.encodeRedirectURL("WorkflowMgmt?page=instances&workflow=" + wf.getWorkflowId()));
                    redirectCommited = true;
                } catch (IOException ex) {
                    Logger.getLogger(WorkflowManagementController.class.getName()).log(Level.SEVERE, null, ex);
                }
            } else if (action.equals("reset")) {
                //exists (from e.activityTypes at where at.name = 'createInstance')
                session.beginTransaction();
                session.createQuery("delete from Event e where e.instance = ? and exists (from e.activityTypes at where at.name <> ?)").setString(0, instanceId).setString(1, "createInstance").executeUpdate();
                session.getTransaction().commit();
                try {
                    resp.sendRedirect(resp.encodeRedirectURL("WorkflowMgmt?page=instances&workflow=" + wf.getWorkflowId()));
                    redirectCommited = true;
                } catch (IOException ex) {
                    Logger.getLogger(WorkflowManagementController.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        } else if (action != null && action.equals("new")) {
            req.setAttribute("page", "instance_new");
        }

        req.setAttribute("workflow", wf);

        return redirectCommited;
    }

    private boolean deleteWorkflow(Session session, HttpServletRequest req, HttpServletResponse resp) {
        Workflow wf = (Workflow) session.get(Workflow.class, (String) req.getParameter("workflow"));

        Set<WorkflowLanguage> wfLanguages = wf.getWorkflowLanguages();
        String outputDir = Configuration.getProperties().getProperty("SVGDirectory");

        for (WorkflowLanguage wfL : wfLanguages) {
            File f = new File(outputDir + wfL.getId().getWorkflowId() + "_" + wfL.getId().getLanguage() + ".svg");
            if (f.exists()) {
                f.delete();
            }
        }
        File f = new File(outputDir + wf.getWorkflowId() + ".svg");
        if (f.exists()) {
            f.delete();
        }


        session.beginTransaction();
        session.delete(wf);
        session.getTransaction().commit();

        try {
            resp.sendRedirect(resp.encodeRedirectURL("WorkflowMgmt"));
        } catch (IOException ex) {
            Logger.getLogger(WorkflowManagementController.class.getName()).log(Level.SEVERE, null, ex);
        }

        return true;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("im get");
        HttpSession session = req.getSession(true);
        User usr = (User) session.getAttribute("user");
        //Hibernate.initialize(usr);
        Session hibSession = HibernateUtil.getSessionFactory().openSession();
        //Session hibSession = HibernateUtil.getSessionFactory().getCurrentSession();
        //Hibernate.initialize(usr);
        //Transaction tx = hibSession.beginTransaction();
        User user = (User) hibSession.load(User.class, usr.getUserId());
        //tx.commit();
        //req.setAttribute("user", user);
        //req.setAttribute("user", user);
        session.setAttribute("user", user);

        boolean redirectCommited = false;
        req.setAttribute("page", "overview");
        //String page = "overview";
        if (req.getParameter("page") != null) {
            String reqPage = req.getParameter("page");
            if (reqPage.equals("instances")) {
                //req.setAttribute("page", "instances");
                redirectCommited = instancePage(hibSession, req, resp);
                //page = (String)req.getAttribute("page");
            } else if (reqPage.equals("upload")) {
                //page = "newWorkflow";
                req.setAttribute("page", "newWorkflow");
            }
        } else if (req.getParameter("action") != null && req.getParameter("action").equals("del") && req.getParameter("workflow") != null) {
            redirectCommited = deleteWorkflow(hibSession, req, resp);
        }

        /*System.out.println(user.getDisplayName());
        System.out.println(user.getWorkflows().size());
        System.out.println(req);
        System.out.println("resp:");
        System.out.println(resp);*/
        if (!redirectCommited) {
            req.getRequestDispatcher("WEB-INF/WorkflowMgmt.jsp").forward(req, resp);
        }
    }
}
