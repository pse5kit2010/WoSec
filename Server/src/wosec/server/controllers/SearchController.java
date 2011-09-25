package wosec.server.controllers;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Event;
import wosec.server.model.User;
import wosec.server.view.JsonView;

/**
 * SearchController ist für die Verarbeitung der Suchanfragen zuständig.
 */
public class SearchController extends SessionServlet {

    private static final long serialVersionUID = 1L;

    /**
     * veranlasst eine Volltextsuche über die Instanzen des Benutzers und leitet
     * die Ergebnisse der Suche an die View SearchResults weiter
     * 
     * @param request
     *            HttpServletRequest
     * @param response
     *            HttpServletResponse
     */
    private void search(HttpServletRequest request, HttpServletResponse response) {
        String q = request.getParameter("q");
        if (q == null || q.length() < 2) {
            return;
        }
        q = "%" + q + "%";

        // XXX wieder zurückändern
        //Session session = HibernateUtil.getSessionFactory().openSession();
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        Transaction tx = session.getTransaction();
        tx.begin();

        HttpSession httpSession = request.getSession(false);
        User user = (User) httpSession.getAttribute("user");

        List<Event> events = session //.createQuery("select distinct e from Event e where e.instance.user = :loginUser and (e.description like :q or e.instance.workflow.name like :q)")
                .createQuery("select distinct e from Event e where e.instance.user = :loginUser and e.instance.workflow.name like :q")
                .setEntity("loginUser", user).setParameter("q", q).list();

        tx.commit();
        JsonView.createJSONSearchResults(response, events);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        search(request, response);
    }
}
