package wosec.server.controllers.eventhandling;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.hibernate.EntityMode;
import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Event;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.util.Configuration;

public class NewInstanceEventHandler extends EventHandler {
	// private final static String staticXMLWorkflowDataDirectory =
	// "/home/david/Eclipse workspace/WoSecServer/WebContent/WorkflowData/";
	private final static Logger log = Logger.getLogger(NewInstanceEventHandler.class.getName());

	public NewInstanceEventHandler(EventHandler nextHandler) {
		super(nextHandler, new String[] { "createInstance" });
	}

	protected void doRollback(Transaction tx) {
		if (tx != null && tx.isActive()) {
			try {
				tx.rollback();
				System.out.println("tx rolled back");
			} catch (HibernateException e1) {
				System.out.println("rollback failed: " + e1.getMessage());
			}
		}
	}

	/**
	 * Lädt unter Verwendung von importXMLToDB() die zur angegebenen WorkflowID
	 * gehörende XML-Datei in die Datenbank, falls das Modell nocht nicht
	 * importiert wurde.
	 * 
	 * @param workflowID
	 *            ID des Workflows
	 * @param session
	 *            Offene Hibernate-Session
	 * @throws DocumentException
	 */
	protected void createWorkflow(String workflowID, Session session) throws DocumentException {
		// Versuche, Workflow aus Datenbank zu laden:
		Workflow workflow = (Workflow) session.get(Workflow.class, workflowID);
		if (workflow != null) {
			log.info("Workflow " + workflowID + " already in database, nothing to do.");
		} else {
			// XML laden und parsen:
			String xmlFile = Configuration.getProperties().getProperty("staticXMLWorkflowDataDirectory") + workflowID
					+ ".xml";

			importXMLToDB(workflowID, session, (new SAXReader()).read(new File(xmlFile)));
		}
	}

	/**
	 * Lade und parse das übergebene XML und übertrage die darin enthaltenen
	 * statischen Workflow-Daten in die Datenbank.
	 * 
	 * @param workflowID
	 *            ID des Workflow-Modells
	 * @param session
	 *            Hibernate-Session für Datenbank
	 * @param xmlDoc
	 *            zu parsendes XML
	 * @throws DocumentException
	 */
	protected void importXMLToDB(String workflowID, Session session, Document xmlDoc) throws DocumentException {
		Node rootNode = xmlDoc.selectSingleNode("/workflow");
		List<Node> activityGroups = rootNode.selectNodes("activity_group");
		List<Node> activities = rootNode.selectNodes("activity");
		// Dient der Umsetzung von der ActivityGroupIDs von alphanumerischer
		// ReferenzID auf numerische ID
		HashMap<String, Integer> idMapping = new HashMap<String, Integer>(activityGroups.size());

		// Persistiere XML in Datenbank:
		Session dom4jSession = session.getSession(EntityMode.DOM4J);
		dom4jSession.save("Workflow", rootNode);
		for (Node activityGroup : activityGroups) {
			// workflowID kann Hibernate nicht aus Mapping auslesen, muss
			// manuell spezifiziert werden:
			((Element) activityGroup).addAttribute("workflowID", workflowID);

			int id = (Integer) dom4jSession.save("ActivityGroup", activityGroup);
			// Speichere Mapping von ReferenzID auf ID in HashMap:
			idMapping.put(((Element) activityGroup).attributeValue("group-id"), id);
		}

		for (Node activity : activities) {
			Element activityElem = ((Element) activity);
			String inWorkflowPool = activityElem.attributeValue("lane") == "workflow" ? "true" : "false";
			activityElem.addAttribute("inWorkflowPool", inWorkflowPool);

			// Lese die ReferenzID der ActivityGroup aus, zu der diese Activity
			// gehört
			// und füge dem XML-Knoten die dazugehörige numerische GruppenID an
			// (benötigt als Fremdschlüssel in der Datenbank).
			String groupReferenceID = activityElem.attributeValue("activity_group");
			activityElem.addAttribute("groupID", String.valueOf(idMapping.get(groupReferenceID)));

			dom4jSession.save("Activity", activity);
		}
		log.info(String.format("Transferred %d activities and %d activityGroups from workflow XML %s to database",
				activities.size(), activityGroups.size(), workflowID));
	}

	protected void createInstance(String workflowID, Session session, String newInstanceEventType,
			HttpServletRequest req) throws Exception {
		// Lade Benutzer und Workflow für neue Instanz aus Datenbank
		User user = (User) session.createQuery("from User where identifier = ?")
				.setString(0, req.getParameter("identifier")).uniqueResult();
		Workflow workflow = (Workflow) session.load(Workflow.class, workflowID);
		// Prüfe, ob Instanz schon vorhanden:
		if (session.get(Instance.class, req.getParameter("instanceID")) != null)
			throw new Exception("Instance already in database!");

		// Erzeuge neue Instanz
		Instance newInstance = new Instance();
		newInstance.setId(req.getParameter("instanceID"));
		newInstance.setWorkflow(workflow);
		newInstance.setUser(user);

		// Erzeuge createInstance-Event
		Event newInstanceEvent = new Event();
		newInstanceEvent.setType(newInstanceEventType);
		newInstanceEvent.setInstance(newInstance);

		// MySQL: Spalte 'time' muss vom Typ TIMESTAMP sein, dann wird das Datum
		// gespeichert
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
		Date time = format.parse(req.getParameter("timestamp"));
		newInstanceEvent.setTime(time);

		// Speichere neue Instanz und dazugehöriges Event in der Datenbank
		session.save(newInstance);
		session.save(newInstanceEvent);
	}

	/***
	 * Handelt es sich um ein createInstance-Event und bezieht sich dieses auf
	 * einen Workflow, der noch nicht in der Datenbank gespeichert ist, werden
	 * die im XML-Format vorliegenden statischen Daten zu diesem Workflow
	 * mittels Hibernate in die Datenbank geschrieben und somit dem System
	 * bekannt gemacht. Anschließend wird das createInstance-Event in die
	 * Events-Tabelle der Datenbank gespeichert.
	 */
	protected void handle(String eventType, HttpServletRequest req) {
		String workflowID = req.getParameter("modelID");
		if (workflowID == null) {
			log.info("No modelID given, nothing to do");
			return;
		}

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		Transaction tx = session.beginTransaction();
		log.info("Started transaction for new workflow");
		try {
			createWorkflow(workflowID, session);
			tx.commit();
			log.info("Transaction committed");

			session = HibernateUtil.getSessionFactory().getCurrentSession();
			tx = session.beginTransaction();
			log.info("Started transaction for new instance");
			createInstance(workflowID, session, eventType, req);
			tx.commit();
			log.info("Transaction committed");
		} catch (Exception e) {
			log.log(Level.SEVERE, e.getMessage());
			log.log(Level.SEVERE, "Rolling back transaction");
			doRollback(tx);
		}
	}
}