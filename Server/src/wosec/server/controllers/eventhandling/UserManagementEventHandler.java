package wosec.server.controllers.eventhandling;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.servlet.http.HttpServletRequest;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;

import wosec.server.model.User;
import wosec.util.HashGenerator;

import java.util.logging.*;

/**
 * Ein EventHandler für Operationen wie das Anlegen und Löschen von Benutzers.
 * 
 * @author david
 */
public class UserManagementEventHandler extends EventHandler {
	private final static Logger log = Logger.getLogger(UserManagementEventHandler.class.getName());

	public UserManagementEventHandler(EventHandler nextHandler) {
		super(nextHandler, new String[] { "createUser", "updateUser", "deleteUser" });
	}

	private User getUserByIdentifier(Session session, String identifier) {
		return (User) session.createQuery("from User where identifier = ?").setString(0, identifier).uniqueResult();
	}

	@Override
	public void handle(String eventType, HttpServletRequest req) {
		String identifier = req.getParameter("identifier");
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();

		if (eventType.equalsIgnoreCase("createUser")) {
			try {
				session.beginTransaction();
				// Prüfe, ob Nutzer schon existiert:
				if (getUserByIdentifier(session, identifier) != null) {
					log.warning("createUser: User " + identifier + " already in database");
				} else {
					// Speichere Nutzer in Datenbank:
					User user = new User();
					user.setIdentifier(identifier);
					user.setDisplayname(req.getParameter("displayName"));
					user.setPasswordHash(HashGenerator.SHA256(req.getParameter("password")));
					session.save(user);
					log.info("createUser: Created user " + identifier);
				}
				session.getTransaction().commit();
			} catch (Exception e) {
				log.log(Level.SEVERE, e.getMessage());
			}
		} else if (eventType.equalsIgnoreCase("updateUser")) {
			session.beginTransaction();
			// Zu aktualisierenden User laden:
			User user = getUserByIdentifier(session, identifier);
			if (req.getParameter("newIdentifier") != null)
				user.setIdentifier(req.getParameter("newIdentifier"));
			if (req.getParameter("newDisplayName") != null)
				user.setDisplayname(req.getParameter("newDisplayName"));
			if (req.getParameter("newPassword") != null)
				try {
					user.setPasswordHash(HashGenerator.SHA256(req.getParameter("newPassword")));
				} catch (Exception e) {
					log.log(Level.SEVERE, e.getMessage());
					return;
				}
			session.update(user);
			session.getTransaction().commit();
			log.info("updateUser: Updated user " + identifier);
		} else if (eventType.equalsIgnoreCase("deleteUser")) {
			session.beginTransaction();
			User userToBeRemoved = (User) session.createQuery("from User where identifier = ?")
					.setString(0, identifier).uniqueResult();
			if (userToBeRemoved == null) {
				log.warning("deleteUser: Tried to delete non-existent user with id " + identifier);
				session.getTransaction().commit();
			} else {
				session.delete(userToBeRemoved);
				session.getTransaction().commit();
				log.info("deleteUser: Deleted user " + identifier);
			}
		}
	}
}