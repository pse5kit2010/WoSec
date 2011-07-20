package wosec.server.controllers.eventhandling;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Activity;
import wosec.server.model.ActivityGroup;
import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.Provider;
import wosec.server.model.User;

public class DefaultEventHandler extends EventHandler {
	private final static Logger log = Logger.getLogger(DefaultEventHandler.class.getName());

	public DefaultEventHandler(EventHandler nextHandler) {
		super(nextHandler, new String[] { "humanActivityExecuted", "eventActivityExecuted",
				"HumanTaskExecutorSelected", "WSProviderSelected", "startActivityExecution", "DataTransferredToWS",
				"DataTransferredFromWS", "WSActivityExecuted", "startActivityExecution", "DataTransferredToHuman",
				"DataTransferredFromHuman", "terminateInstance" });
	}

	protected void handle(String eventType, HttpServletRequest req) {

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		try {
			session.beginTransaction();

			Event event = setEventProperties(req, session);
			event.setType(eventType);

			session.save(event);
			session.getTransaction().commit();
			log.info(String.format("Added Event with Instance-ID: \"%s\"", event.getInstance().getId()));

		} catch (ParseException e) {
			log.log(Level.SEVERE, "Timestamp must have the format \"yyyy-MM-ddTHH:mm:ssZ\"");
			log.log(Level.SEVERE, "Rolling back transaction");
			doRollback(session.getTransaction());
		} catch (Exception e1) {
			log.log(Level.SEVERE, e1.getMessage());
			log.log(Level.SEVERE, "Rolling back transaction");
			doRollback(session.getTransaction());
		}
	}

	protected void doRollback(Transaction tx) {
		if (tx.isActive()) {
			try {
				tx.rollback();
				System.out.println("tx rolled back");
			} catch (HibernateException e1) {
				System.out.println("rollback failed: " + e1.getMessage());
			}
		}
	}

	private Event setEventProperties(HttpServletRequest req, Session session) throws ParseException, RuntimeException,
			Exception {
		Event ev = new Event();
		Instance instance;
		String parameter;
		Object object;

		if ((parameter = req.getParameter("instanceID")) != null) {
			if ((instance = (Instance) session.get(Instance.class, parameter)) != null)
				ev.setInstance(instance);
			else
				throw new Exception(String.format("The Instance \"%s\" doesn't exist!", parameter));
		} else
			throw new Exception("No given instanceID!");

		// Zeitstempel speichern
		// MySQL: Spalte 'time' muss vom Typ TIMESTAMP sein
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
		Date time = format.parse(req.getParameter("timestamp").replace(' ', '+'));
		ev.setTime(time);

		// Test ob ActivityID, GroupID oder SourceAcrivityID übermittelt
		// wurde
		if ((parameter = req.getParameter("activityID")) != null) {
			if ((object = session.get(Activity.class, parameter)) != null)
				ev.setActivity((Activity) object);
			else
				throw new Exception(String.format("The activityID \"%s\" is wrong!", parameter));
		} else if ((parameter = req.getParameter("groupID")) != null) {
			if ((object = session.createQuery("from ActivityGroup a where a.referenceID = ? and a.workflow = ?")
					.setString(0, parameter).setEntity(1, instance.getWorkflow()).uniqueResult()) != null) {
				ev.setGroup((ActivityGroup) object);
			} else
				throw new Exception(String.format("The groupID \"%s\" is wrong!", parameter));

		} else if ((parameter = req.getParameter("sourceActivityID")) != null) {
			if ((object = session.get(Activity.class, parameter)) != null) {
				ev.setActivity((Activity) object);
				ev.setDestActivity((Activity) session.load(Activity.class, req.getParameter("targetActivityID")));
			} else
				throw new Exception(String.format("The soureActivityID \"%s\" is wrong!", parameter));
		}

		// Test ob providerID oder userId übermittelt wurde
		if ((parameter = req.getParameter("providerID")) != null) {
			Provider p = (Provider) session.get(Provider.class, parameter);
			if (p == null) {
				// Provider noch nicht in Datenbank -> einfügen
				p = new Provider();
				p.setId(parameter);
				p.setName(req.getParameter("providerName"));
				p.setWorkflow(instance.getWorkflow());
				session.save(p);
			}
			ev.setProvider(p);
		} else if ((parameter = req.getParameter("userID")) != null) {
			User user = (User) session.createQuery("from User u where u.identifier = ?").setString(0, parameter)
					.uniqueResult();
			if (user == null) {
				user = new User();
				user.setIdentifier(parameter);
				user.setDisplayname(req.getParameter("userName"));
				session.save(user);
			}
			ev.setUser(user);
		}

		// Test ob dataDescription übermittelt wurde
		if ((parameter = req.getParameter("dataDescription")) != null)
			ev.setDescription(parameter);

		return ev;

	}
}