package wosec.server.tests.eventhandling;

import static org.junit.Assert.assertTrue;

import java.util.Date;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import wosec.server.controllers.eventhandling.DebugEventHandler;
import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.server.tests.NullHttpServletRequest;

public class DebugEventHandlerTest {
	private DebugEventHandler deh = new DebugEventHandler(null);
	private Instance in;
	private User user;
	private Workflow wf;
	private Event create;
	private Event second;

	@Before
	public void setUp() throws Exception {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		wf = new Workflow();
		wf.setId("!testWorkflow!");
		wf.setName("!testWorkflow!");
		session.save(wf);

		user = new User();
		user.setDisplayname("!testUser!");
		user.setIdentifier("!testUser!");
		session.save(user);

		in = new Instance();
		in.setId("!testInstanceID!");
		in.setUser(user);
		in.setWorkflow(wf);
		session.save(in);

		create = new Event();
		create.setInstance(in);
		create.setType("createInstance");
		create.setTime(new Date(2000));
		session.save(create);

		second = new Event();
		second.setInstance(in);
		second.setType("testEventType");
		second.setTime(new Date(40000));
		session.save(second);

		session.getTransaction().commit();
	}

	@After
	public void tearDown() throws Exception {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		session.delete(second);
		session.delete(create);
		session.flush();
		session.delete(in);
		session.flush();
		session.delete(user);
		session.delete(wf);

		session.getTransaction().commit();
	}

	@Test
	public void testWithWrongInstanceID() {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("eventType", "resetInstance");
		long size = getEventAmount(null, false);
		// Test ohne InstanceID
		deh.handleOrRelay(req);
		assertTrue(size == getEventAmount(null, false));
		// Events zählen

		// Test mit falscher InstanceID
		String wrongInstanceID = "!$falscheInstanceID$%";
		req.setParameter("instanceID", wrongInstanceID);
		deh.handleOrRelay(req);
		assertTrue(size == getEventAmount(wrongInstanceID, false));
	}

	@Test
	public void testDeleteEventsFromOneInstance() {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("eventType", "resetInstance");
		req.setParameter("instanceID", in.getId());

		assertTrue(1 != getEventAmount(in.getId(), true));
		deh.handleOrRelay(req);
		assertTrue(1 == getEventAmount(in.getId(), true));

		// Da second beim Abbauen des Tests(@After) wieder gelöscht wird, muss
		// es hier wieder hinzugefügt werden
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();
		session.save(second);
		session.getTransaction().commit();
	}

	private Long getEventAmount(String instanceID, boolean correct) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		long size;
		if (correct)
			size = (Long) session.createQuery("select count(*) from Event where instanceID = ?")
					.setString(0, instanceID).uniqueResult();
		else
			size = (Long) session.createQuery("select count(*) from Event").uniqueResult();

		session.getTransaction().commit();

		return size;

	}
}
