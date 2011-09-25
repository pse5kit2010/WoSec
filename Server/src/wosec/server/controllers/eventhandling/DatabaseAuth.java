package wosec.server.controllers.eventhandling;

import javax.servlet.http.HttpServletRequest;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import wosec.server.model.User;
import wosec.server.model.UserRole;

/**
 *
 * @author murat
 */
public class DatabaseAuth implements IAuthentication {

    @Override
    public boolean validate(HttpServletRequest req) {
        SessionFactory sessionFactory = HibernateUtil.getSessionFactory();
//        if (sessionFactory.isClosed()) {
//            sessionFactory.openSession();
//        }
        Session session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        User usr = (User) session.createQuery("select u from User u join u.userRole as r where u.identifier = ? and u.passwordHash = ? and u.userRole = r and r.name = ?")
                .setString(0, req.getParameter("login"))
                .setString(1, req.getParameter("key"))
                .setString(2, UserRole.ROLE_APP)
                .uniqueResult();
        session.getTransaction().commit();
        if (usr != null) {
            req.setAttribute("userId", usr.getUserId());
        }
        return usr != null;
        //return req.getParameter("key") != null && req.getParameter("key").equals(KEY);
    }
}
