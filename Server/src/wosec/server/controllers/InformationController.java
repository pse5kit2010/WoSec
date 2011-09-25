package wosec.server.controllers;

import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import wosec.server.model.ActivityInformation;
import wosec.server.view.JsonView;

public class InformationController extends SessionServlet {

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // TODO überprüfen ob der Benutzer das überhaupt sehen darf!
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        String activityId = req.getParameter("activityId");
        String workflowId = req.getParameter("workflowId");
        HashMap<String, String> map = new HashMap<String, String>(3);
        map.put("activityId", activityId);
        map.put("workflowId", workflowId);
        if (activityId != null && workflowId != null) {
            Transaction tx = session.beginTransaction();
            ActivityInformation aI = (ActivityInformation) session.createQuery("from ActivityInformation ai where ai.id.activityId = ? and ai.id.workflowId = ?")
                    .setString(0, activityId)
                    .setString(1, workflowId).uniqueResult();
            tx.commit();
            if (aI != null) {
                map.put("name", aI.getName());
                map.put("description", aI.getInformation());
            }

        }
        JsonView.createJSONInformation(resp, map);
    }
}
