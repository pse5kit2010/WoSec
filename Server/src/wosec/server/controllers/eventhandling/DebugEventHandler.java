package wosec.server.controllers.eventhandling;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import org.hibernate.HibernateUtil;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Instance;


/**
 * Einfacher EventHandler für Debugging-Zwecke. Kann (bisher) nur das Event
 * "resetInstance" verarbeiten, womit alle Events der angegebenen Instanz bis
 * auf das createInstance-Event gelöscht werden.
 * 
 * @author david
 */
public class DebugEventHandler extends EventHandler {
	private final static Logger log = Logger.getLogger(DebugEventHandler.class.getName());

	public DebugEventHandler(EventHandler nextHandler) {
		super(nextHandler, new String[] { "resetInstance" });
	}

	@Override
	protected void handle(String eventType, HttpServletRequest req) {
		try {
			String instanceID = req.getParameter("instanceID");
			if (instanceID == null){
				throw new Exception("resetInstance need a instanceID!");
			}
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
			Transaction tx = session.beginTransaction();
			if(session.get(Instance.class, instanceID) == null){
				throw new Exception("Instance doesn't exist!");
			}
			Query query = session.createQuery("delete Event where instanceID = ? and type != ?")
					.setString(0, instanceID).setString(1, "createInstance");
			query.executeUpdate();
			tx.commit();
			log.info(String.format("Instance %s was successfully reset", instanceID));
		} catch (Exception e) {
			log.log(Level.SEVERE, e.getMessage());
		}
	}
}
