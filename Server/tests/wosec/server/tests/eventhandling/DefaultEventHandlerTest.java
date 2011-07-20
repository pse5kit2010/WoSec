package wosec.server.tests.eventhandling;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import wosec.server.controllers.eventhandling.DefaultEventHandler;
import wosec.server.model.Activity;
import wosec.server.model.ActivityGroup;
import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.server.tests.NullHttpServletRequest;

@RunWith(Parameterized.class)
public class DefaultEventHandlerTest {
	private static DefaultEventHandler deh;
	private Hashtable<String, String> requestParameters;

	private static final String userIdentifier = "testUser";
	private static final String groupReference = "testActivityGroupReference";
	private static final String activityId = "testAcitivity";
	private static final String instanceId = "testInstance";

	private static Workflow wf;
	private static User user;
	private static Instance in;
	private static Activity activity;
	private static ActivityGroup group;

	public DefaultEventHandlerTest(Hashtable<String, String> params) {
		this.requestParameters = params;
	}

	@Parameters
	public static Collection<Object[]> data() {

		// Werte die jede Map enthält:
		Hashtable<String, String> standard = new Hashtable<String, String>();
		standard.put("eventType", "humanActivityExecuted");
		standard.put("timestamp", "2011-01-20T20:20:20+0100");
		standard.put("instanceID", instanceId);

		// Teste ungültige/fehlende Werte:
		standard.put("validValues", "false");

		// Invalid ActivityId:
		Hashtable<String, String> map1 = new Hashtable<String, String>(standard);
		map1.put("activityID", "!invalidActivity%");

		// Invalid ActivityGroupId:
		Hashtable<String, String> map2 = new Hashtable<String, String>(standard);
		map2.put("groupID", "!invalidActivityGroup%");

		// Invalid SourceActivityId:
		Hashtable<String, String> map3 = new Hashtable<String, String>(standard);
		map3.put("sourceActivityID", "!invalidSourceActivity%");
		map3.put("targetActivityID", "!invalidTargetActivity%");

		// Invalid Timestamp:
		Hashtable<String, String> map4 = new Hashtable<String, String>(standard);
		map4.put("timestamp", "2011.01.20T20:20:20+0100");
		map4.put("groupID", groupReference);
		map4.put("providerID", "testProvider");
		map4.put("providerName", "testProvider");

		Hashtable<String, String> map5 = new Hashtable<String, String>(map4);
		map5.put("timestamp", "2011-01-20T20,20,20+0100");

		Hashtable<String, String> map6 = new Hashtable<String, String>(map4);
		map6.put("timestamp", "2011-01-20T20:20:20");

		// Teste gültige Werte:
		standard.put("validValues", "true");

		// Valid ActivityId and new User:
		Hashtable<String, String> map7 = new Hashtable<String, String>(standard);
		map7.put("activityID", activityId);
		map7.put("userID", "UserTest");
		map7.put("userName", "testUser");
		map7.put("dataDescription", "");

		// Valid ActivityGroupId and new Provider:
		Hashtable<String, String> map8 = new Hashtable<String, String>(standard);
		map8.put("groupID", groupReference);
		map8.put("providerID", "testProvider");
		map8.put("providerName", "testProvider");
		map8.put("dataDescription", "User: _klmino");

		// Vaild SourceActivityId and "known" User:
		Hashtable<String, String> map9 = new Hashtable<String, String>(standard);
		map9.put("sourceActivityID", activityId);
		map9.put("targetActivityID", activityId);
		map9.put("userID", userIdentifier);
		map9.put("dataDescription", "!§Sonderzeichen%&");

		Object[][] data = new Object[][] { { map1 }, { map2 }, { map3 }, { map4 }, { map5 }, { map6 }, { map7 },
				{ map8 }, { map9 }, { standard } };
		return Arrays.asList(data);
	}

	@BeforeClass
	public static void setUp() throws Exception, RuntimeException {
		deh = new DefaultEventHandler(null);

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		wf = new Workflow();
		wf.setId("testWorkflow");
		wf.setName("testWorkflow");
		session.save(wf);

		user = new User();
		user.setIdentifier(userIdentifier);
		user.setDisplayname(userIdentifier);
		user.setPasswordHash("testPassword");
		session.save(user);

		group = new ActivityGroup();
		group.setReferenceID(groupReference);
		group.setName("testGroup");
		group.setType("human_taks");
		group.setWorkflow(wf);
		session.save(group);

		activity = new Activity();
		activity.setId(activityId);
		activity.setActivityGroup(group);
		activity.setInWorkflowPool(true);
		activity.setName("testActivity");
		activity.setType("activityType");
		session.save(activity);

		in = new Instance();
		in.setId(instanceId);
		in.setUser(user);
		in.setWorkflow(wf);
		session.save(in);

		session.getTransaction().commit();

	}

	@AfterClass
	public static void tearDown() throws Exception, RuntimeException {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		session.delete(in);
		session.delete(activity);
		session.createQuery("delete Provider where id = ?").setString(0, "testProvider").executeUpdate();
		session.createQuery("delete User where identifier = ?").setString(0, "UserTest").executeUpdate();

		session.getTransaction().commit();
		session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		session.delete(group);
		session.delete(user);
		session.delete(wf);

		session.getTransaction().commit();
	}

	/**
	 * Test ob bei falscher Activity auch kein Event gespeichert wird
	 * 
	 * @throws RuntimeException
	 */
	@Test
	public void testDefaultHandlerParameters() throws RuntimeException {

		deh.handleOrRelay(new NullHttpServletRequest(requestParameters));

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		Object eventObject = session.createQuery("from Event e where e.instance = ?").setEntity(0, in).uniqueResult();
		if (requestParameters.get("validValues").equals("false")) {
			// validValues == false -> Es darf kein Event gespeichert worden
			// sein
			assertNull("No Object should saved:", eventObject);
		} else {
			// validValues == true -> Es muss ein Event gespeichert worden sein
			Event event = (Event) eventObject;
			// Es wird überprüft, falls ein Eintrag in der RequestMap vorhanden
			// ist ob dieser auch im Event gespeichert wurde und ob sie
			// identisch sind
			if (requestParameters.containsKey("activityID"))
				assertEquals(event.getActivity().getId(), requestParameters.get("activityID"));
			if (requestParameters.containsKey("groupID"))
				assertEquals(event.getGroup().getReferenceID(), requestParameters.get("groupID"));
			if (requestParameters.containsKey("sourceActivityID")) {
				assertEquals(event.getActivity().getId(), requestParameters.get("sourceActivityID"));
				assertEquals(event.getDestActivity().getId(), requestParameters.get("targetActivityID"));
			}
			if (requestParameters.containsKey("userID"))
				assertEquals(event.getUser().getIdentifier(), requestParameters.get("userID"));
			if (requestParameters.containsKey("providerID"))
				assertEquals(event.getProvider().getId(), requestParameters.get("providerID"));
			if (requestParameters.containsKey("dataDescription"))
				assertEquals(event.getDescription(), requestParameters.get("dataDescription"));

			session.delete(event);
		}

		session.getTransaction().commit();
	}

}
