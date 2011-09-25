/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package wosec.server.controllers;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import wosec.server.model.User;
import wosec.server.model.UserRole;
import wosec.server.model.Workflow;

/**
 *
 * @author murat
 */
public class RightsManagementController extends SessionServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        Workflow wf = (Workflow) session.get(Workflow.class, (String) req.getParameter("workflow"));
        User u = (User) session.get(User.class, new Integer(req.getParameter("user")));
        u.getWorkflows().add(wf);
        /*Set<Workflow> wfSet = u.getWorkflows();
        wfSet.add(wf);
        u.setWorkflows(wfSet);*/
        //wf.getUsers().add(u);
        session.update(u);
        //session.update(wf);
        session.getTransaction().commit();

        resp.sendRedirect(resp.encodeRedirectURL("Rights?page=wf_access&workflow=" + wf.getWorkflowId()));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String pageParam = req.getParameter("page");
        req.setAttribute("page", "overview");
        boolean responseModified = false;

        Session session = HibernateUtil.getSessionFactory().openSession();
        // XXX wieder zurückändern
        //Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        Transaction tx = session.beginTransaction();
        if ("wf_access".equals(pageParam)) {
            Workflow wf = (Workflow) session.get(Workflow.class, (String) req.getParameter("workflow"));
            req.setAttribute("workflow", wf);
            String action = req.getParameter("action");
            if ("new_user".equals(action)) {
//                List<User> userList = (List<User>) session.createQuery("select u from User u ").list();
                List<User> userList = (List<User>) session.createQuery("select u from User u "
                        + "left join u.workflows w "
                        + "where not exists (from w wf where wf.workflowId = ? and u in (from w.users))").setEntity(0, wf).list();
                req.setAttribute("user_list", userList);
                req.setAttribute("page", "new_user");
            } else if ("delete".equals(action)) {
                User u = (User) session.get(User.class, new Integer(req.getParameter("user")));
//                Set<Workflow> wSet = u.getWorkflows();
//                boolean remove = wSet.remove(wf);
//                System.out.println(remove);
                //u.setWorkflows(wSet);
                u.getWorkflows().remove(wf);
                session.createQuery("delete from Instance i where i.user = ? and i.workflow = ?").setEntity(0, u).setEntity(1, wf).executeUpdate();
                wf.getUsers().remove(u);
                session.update(u);
                session.update(wf);

                resp.sendRedirect(resp.encodeRedirectURL("Rights?page=wf_access&workflow=" + wf.getWorkflowId()));
                responseModified = true;
            } else {
                //req.setAttribute("workflow", wf);
                req.setAttribute("page", "wf_access");
            }
        } else {
            List<Workflow> workflows = (List<Workflow>) session.createQuery("from Workflow").list();
            req.setAttribute("workflowList", workflows);
        }
        tx.commit();
//        session.flush();
//        session.getTransaction().commit();

        if (!responseModified) {
            req.getRequestDispatcher("WEB-INF/Rights.jsp").forward(req, resp);
        }
    }
}
