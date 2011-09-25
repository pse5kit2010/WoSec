package wosec.server.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Activity;
import wosec.server.model.Instance;
import wosec.server.model.Workflow;
import wosec.util.Configuration;

/**
 * SingleInstanceController bereitet alle Daten auf, die für das Anzeigen der
 * Einzelansicht einer Workflow-Instanz nötig sind, ohne sich um die dazu
 * zugehörigen Events zu kümmern.
 */
public class MinimalViewController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Übernimmt die Vorbereitung der für die Einzelansicht benötigten Daten
     * anhand des get-Parameters instance unter Überprüfung des Zugriffsrechts
     * des angemeldeten Users. getInstance() leitet die Anfrage an die View
     * SingleInstance weiter
     * 
     * @param request
     *            HttpServletRequest
     * @param response
     *            HttpServletResponse
     * @throws ServletException
     *             wird gegebenenfalls bei der Weiterleitung an die View
     *             geworfen
     * @throws IOException
     *             wird gegebenenfalls bei der Weiterleitung an die View
     *             geworfen
     */
    private void getInstance(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {

        System.out.println("entering Minimalview.getInstance");

        if (request.getParameter("instance") == null) {
            System.err.println("'instance' parameter = null");
            return;
        }

        Instance instance = null;
        String svgdata = "";
        String svginline = "";

        Transaction tx = null;
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        try {

            tx = session.beginTransaction();
            tx.begin();
            instance = (Instance) session.load(Instance.class, request.getParameter("instance"));

            // Reading svg and deleting <?xml ... ?> Tag
            String svgFileName = Configuration.getProperties().getProperty("SVGDirectory")
                    + instance.getWorkflow().getWorkflowId() + ".svg";
            File file = new File(svgFileName);
            StringBuffer contents = new StringBuffer();
            BufferedReader reader = null;

            try {
                //reader = new InputStreamReader(new FileInputStream("file"), "UTF-8"));

                reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF-8"));
                String text = null;

                // read all lines
                while ((text = reader.readLine()) != null) {
                    contents.append(text).append(System.getProperty("line.separator"));
                }


            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            svgdata = contents.toString();
            svginline = svgdata.replaceFirst("<\\?xml.*?\\?>", "");
            //svginline = svginline.replaceFirst("height=\"\\S+\"", "height=\"200%\"");
            //svginline = svginline.replaceFirst("width=\"\\S+\"", "width=\"200%\"");

        } catch (RuntimeException e1) {
            e1.printStackTrace();
            if (tx != null && tx.isActive()) {
                try {
                    // Second try catch as the rollback could fail as well
                    tx.rollback();
                } catch (HibernateException e2) {
                    // logger.debug("Error rolling back transaction");
                }
                // throw again the first exception
                throw e1;
            }
        }


        if (instance != null) {
            Workflow workflow = instance.getWorkflow();
            System.out.println("WF-Model: " + workflow);
            System.out.println("WF-Instanz: " + instance);
            request.setAttribute("workflow", workflow);
            request.setAttribute("instance", instance);

            /*//@SuppressWarnings("unchecked")
            List<Activity> activityList = session.createQuery(
                    "select a from Activity as a left join a.activityGroup as ag where ag.workflow = ?").setEntity(0, workflow).list();*/
            List<Activity> activityList = session.createQuery(
                    "select a from Activity as a left join a.groupActivity as ag where ag.workflow = ? order by a.groupActivity").setEntity(0, workflow).list();


            System.out.println("activityList - Size: " + activityList.size());
            System.out.println("activityList - Content: " + activityList.toString());
            request.setAttribute("activities", activityList);

        }

        tx.commit();

        request.setAttribute("svginline", svginline);

        System.out.println("Aufruf folgt: MinimalView.jsp");

        request.getRequestDispatcher("MinimalView.jsp").forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        getInstance(req, resp);
    }
}
