package wosec.server.tests.eventhandling;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Hashtable;

import junit.framework.Assert;

import org.dom4j.Document;
import org.dom4j.DocumentFactory;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import wosec.server.controllers.eventhandling.NewInstanceEventHandler;
import wosec.server.model.Activity;
import wosec.server.model.ActivityGroup;
import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.server.tests.NullHttpServletRequest;
import wosec.util.Configuration;

public class NewInstanceEventHandlerTest {
	private NewInstanceEventHandler niEventHandler = new NewInstanceEventHandler(null);
	private String xmlPath;

	private final String newWorkflowID = "!§newTestWorkflow$%";
	private final String xmlActivityName = "testActivityId";
	private final String xmlGroupName = "testGroup";

	private Workflow workflow;
	private User user;
	private Instance instance;
	private File file;

	@Before
	public void setUp() throws Exception {
		Configuration config = new Configuration();
		config.init(null);
		xmlPath = config.getProperties().getProperty("staticXMLWorkflowDataDirectory");

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		// Workflow speichern
		workflow = new Workflow();
		workflow.setId("!§testWorkflow$%");
		workflow.setName("!§testWorkflowName$%");
		session.save(workflow);

		// User speichern
		user = new User();
		user.setDisplayname("!§testUser$%");
		user.setIdentifier("!§testUser$%");
		session.save(user);

		// Instance speichern
		instance = new Instance();
		instance.setId("!§testInstanceID$%");
		instance.setUser(user);
		instance.setWorkflow(workflow);
		session.save(instance);

		session.getTransaction().commit();

		// XML-File erstellen
		Document doc = DocumentFactory.getInstance().createDocument();

		// Workflow-Element erstellen
		Element xmlWorkflow = doc.addElement("workflow");
		xmlWorkflow.addAttribute("workflow-id", newWorkflowID);
		xmlWorkflow.addAttribute("workflow-name", "testWorkflowName");

		// Activity-Element erstellen
		Element xmlActvity = xmlWorkflow.addElement("activity");

		xmlActvity.addAttribute("activity-id", xmlActivityName);

		xmlActvity.addAttribute("activity_type", "testType");
		xmlActvity.addAttribute("name", "testActivity");
		xmlActvity.addAttribute("activity_group", xmlGroupName);
		xmlActvity.addAttribute("lane", "workflow");

		// ActivityGroup-Element erstellen
		Element group = xmlWorkflow.addElement("activity_group");

		group.addAttribute("group-id", xmlGroupName);
		group.addAttribute("activity_type", "testGroupType");
		group.addAttribute("name", "testGroupName");

		// XML-File speichern
		file = new File(xmlPath + newWorkflowID + ".xml");
		FileOutputStream fos = new FileOutputStream(file);
		OutputFormat format = OutputFormat.createPrettyPrint();
		XMLWriter writer = new XMLWriter(fos, format);
		writer.write(doc);
		writer.flush();

	}

	@After
	public void tearDown() throws Exception {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		session.delete(instance);
		session.delete(user);
		session.delete(workflow);

		session.getTransaction().commit();

		if (file.exists())
			file.delete();

	}

	@Test
	public void testWithoutOrNoModelID() {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("eventType", "createInstance");

		// Es wird keine ModelID übergeben
		long size = getDbAmout("Workflow");
		niEventHandler.handleOrRelay(req);
		Assert.assertTrue(size == getDbAmout("Workflow"));

		// Es wird eine falsche ModelID übergeben
		req.setParameter("modelID", "!§$wrongWorkflowName%$");
		niEventHandler.handleOrRelay(req);
		Assert.assertTrue(size == getDbAmout("Workflow"));
	}

	@Test
	public void testModelIdAndInstanceAlreadyExist() {
		Hashtable<String, String> map = new Hashtable<String, String>();
		map.put("eventType", "createInstance");
		map.put("modelID", workflow.getId());
		map.put("identifier", user.getIdentifier());
		map.put("instanceID", instance.getId());
		map.put("timestamp", "2011-01-01T20:20:20+0100");

		// Es wird die Anzahl der Einträge der jeweiligen DB-Tabellen
		// gespeichert
		long sizeWorkflow = getDbAmout("Workflow");
		long sizeInstance = getDbAmout("Instance");
		long sizeEvent = getDbAmout("Event");

		// Es wird versucht eine Instance zu erzeugen die bereits existiert
		niEventHandler.handleOrRelay(new NullHttpServletRequest(map));

		// Es wird überprüft ob sich die jeweiligen Tabellen verändert haben
		Assert.assertTrue(sizeWorkflow == getDbAmout("Workflow"));
		Assert.assertTrue(sizeInstance == getDbAmout("Instance"));
		Assert.assertTrue(sizeEvent == getDbAmout("Event"));

	}

	@Test
	public void testModelIdAlreadyExist() {

		// Es wird versucht eine neue Instanz zu einem bekannten Workflow zu
		// erzeugen
		Hashtable<String, String> map = new Hashtable<String, String>();
		map.put("eventType", "createInstance");
		map.put("modelID", workflow.getId());
		map.put("identifier", user.getIdentifier());
		map.put("instanceID", "!§neueTestInstance$%");
		map.put("timestamp", "2011-01-01T20:20:20+0100");

		niEventHandler.handleOrRelay(new NullHttpServletRequest(map));

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		Event event = (Event) session.createQuery("from Event where instanceID = ?")
				.setString(0, map.get("instanceID")).uniqueResult();
		Instance instance = (Instance) session.get(Instance.class, map.get("instanceID"));

		// Es wird geprüft ob, die neu erzeugte Instanz und dessen Event
		// gespeichert wurden
		Assert.assertNotNull(event);
		Assert.assertNotNull(instance);

		// Die neu erzeugte Instanz und dessen Event werden gelöscht
		session.delete(event);
		session.delete(instance);

		session.getTransaction().commit();

	}

	@Test
	public void testNewModel() {
		Hashtable<String, String> map = new Hashtable<String, String>();
		map.put("eventType", "createInstance");
		map.put("modelID", newWorkflowID);
		map.put("identifier", user.getIdentifier());
		map.put("instanceID", "testInstance§$");
		map.put("timestamp", "2011-01-01T20:20:20+0100");

		niEventHandler.handleOrRelay(new NullHttpServletRequest(map));

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		Event event = (Event) session.createQuery("from Event where instanceID = ?")
				.setString(0, map.get("instanceID")).uniqueResult();
		Instance instance = (Instance) session.get(Instance.class, map.get("instanceID"));
		Activity activity = (Activity) session.get(Activity.class, xmlActivityName);
		ActivityGroup group = (ActivityGroup) session.createQuery("from ActivityGroup where referenceID = ?")
				.setString(0, xmlGroupName).uniqueResult();
		Workflow workflow = (Workflow) session.get(Workflow.class, map.get("modelID"));

		Assert.assertNotNull(event);
		Assert.assertNotNull(instance);
		Assert.assertNotNull(activity);
		Assert.assertNotNull(group);
		Assert.assertNotNull(workflow);

		session.delete(event);
		session.delete(instance);
		session.delete(activity);
		session.delete(group);
		session.delete(workflow);

		session.getTransaction().commit();

	}

	private Long getDbAmout(String table) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();
		Long size = (Long) session.createQuery("select count(*) from " + table).uniqueResult();
		session.getTransaction().commit();
		return size;
	}
}
