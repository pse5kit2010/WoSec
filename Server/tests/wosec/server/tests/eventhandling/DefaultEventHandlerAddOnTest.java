package wosec.server.tests.eventhandling;

import static org.junit.Assert.assertEquals;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.Test;

import wosec.server.controllers.eventhandling.DefaultEventHandler;
import wosec.server.tests.NullHttpServletRequest;

public class DefaultEventHandlerAddOnTest {

	/**
	 * Test ob bei keiner oder falscher InstanceID ein Event gespeichert wird
	 * 
	 * @throws RuntimeException
	 */
	@Test
	public void testHandleInstanceWrong() throws RuntimeException {
		DefaultEventHandler deh = new DefaultEventHandler(null);

		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("eventType", "humanActivityExecuted");

		// Es wird keine InstanceID übergeben
		long size = getEventAmount();
		deh.handleOrRelay(req);
		long newSize = getEventAmount();

		assertEquals(size, newSize);

		// Es wird eine in der DB nicht vorhandene InstanceID (mit
		// Sonderzeichen) übergeben
		req.setParameter("instanceID", "!Sonderzeichen§");
		deh.handleOrRelay(req);

		assertEquals(newSize, getEventAmount());

	}

	/**
	 * Es wird die Anzahl der gespeicherten Events in der Datenbank
	 * zurückgegeben
	 * 
	 * @return Anzahl an Events
	 */
	private long getEventAmount() {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		long size = (Long) session.createQuery("select count(*) from Event e").uniqueResult();

		session.getTransaction().commit();
		return size;
	}
}
