package wosec.server.controllers;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.view.JsonView;

/**
 * Diese Klasse nimmt alle AJAX-Anfragen entgegen. Je nach Anfrage werden
 * entweder alle Events seit einem Zeitpunkt oder alle Instanzen an die View
 * "JsonView" weitergeleitet.
 */
public class UpdateController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Diese Methode holt zu einer Instanz alle Events seit einem übergebenen
     * Zeitpunkt aus der Datenbank und übergibt diese Events an die
     * JsonView-Klasse
     * 
     * @param request
     *            HttpServletRequest
     * @param response
     *            HttpServletResponse
     */
    private void getEvents(HttpServletRequest request, HttpServletResponse response, Session session)
            throws RuntimeException {

        String since = request.getParameter("since");
        Long time = (since != null) ? Long.parseLong(since) : new Long(Long.MAX_VALUE);

        String inString = request.getParameter("instance");
        Instance instance = (inString != null) ? (Instance) session.get(Instance.class, inString) : new Instance();

        HttpSession httpSession = request.getSession(true);
        User user = (httpSession.getAttribute("user") != null) ? (User) httpSession.getAttribute("user") : null;
        System.out.println("anfrage..");
        //TODO unchecked?
        //@SuppressWarnings("unchecked")
        List<Event> list;
        if (user != null) {
            list = session.createQuery(
                "from Event as e "
                + "where e.instance.user = ? AND e.instance = ? AND e.eventInformation.eventTime > ? order by e.eventInformation.eventTime").setEntity(0, user).setEntity(1, instance).setTimestamp(2, new Date(time * 1000)).list();            
        } else {
            list = session.createQuery(
                "from Event as e "
                + "where e.instance = ? AND e.eventInformation.eventTime > ? order by e.eventInformation.eventTime").setEntity(0, instance).setTimestamp(1, new Date(time * 1000)).list();
        }

        if (list != null && list.size() > 0) {
            //instance.setLastVisited(list.get(list.size() - 1).getTime());
            instance.setLastVisited(list.get(list.size() - 1).getEventInformation().getEventTime());
            session.update(instance);
        }
        System.out.println("anfrage ende..");
        /*
         * for (int i = list.size() - 1; i >= 0; i--) { Event event =
         * list.get(i); if (event.getTime() == null || event.getTime().getTime()
         * / 1000L <= time) { list.remove(i); } }
         */
        JsonView.createJSONEvents(response, list);

    }

    /**
     * Diese Methode holt zu einem User alle Instanzen seit einem übergebenen
     * Zeitpunkt aus der Datenbank und übergibt diese Instanzen der
     * JsonView-Klasse
     * 
     * @param request
     *            HttpServletRequest
     * @param response
     *            HttpServletResponse
     */
    private void getInstances(HttpServletRequest request, HttpServletResponse response, Session session)
            throws RuntimeException {

        HttpSession httpSession = request.getSession(false);
        if (httpSession.getAttribute("user") != null) {
            User user = (User) httpSession.getAttribute("user");

            @SuppressWarnings("unchecked")
            List<Object[]> list = session.createQuery(
                    "select i, e, e2 "
                    + "from Event e left join e.instance as i, Event e2 left join e2.instance as i2 "
                    //+ "where i.user = ? AND i2 = i AND e2.time = (select max(time) from Event e3 where i = e3.instance) "
                    + "where i.user = ? AND i2 = i AND e2.eventInformation.eventTime = (select max(eventInformation.eventTime) from Event e3 where i = e3.instance) "
                    + "AND exists (from e.activityTypes at where at.name = 'createInstance')").setEntity(0, user).list();

            JsonView.createJSONInstances(response, list);
        }
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String type = req.getParameter("type");
        if (type != null) {
            Transaction tx = null;
            Session session = HibernateUtil.getSessionFactory().getCurrentSession();
            try {
                tx = session.beginTransaction();

                resp.setContentType("text/x-json;charset=UTF-8");
                if (type.equals("Event")) {
                    getEvents(req, resp, session);
                } else if (type.equals("Instance")) {
                    getInstances(req, resp, session);
                }
                tx.commit();
            } catch (RuntimeException e2) {
                if (tx != null && tx.isActive()) {
                    try {
                        // Second try catch as the rollback could fail as well
                        tx.rollback();
                    } catch (HibernateException e3) {
                        // logger.debug("Error rolling back transaction");
                    }
                    // throw again the first exception
                    throw e2;
                }
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }
}
