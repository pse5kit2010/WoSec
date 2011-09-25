package wosec.server.controllers.eventhandling;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;
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

import wosec.server.model.Activity;
import wosec.server.model.ActivityId;
import wosec.server.model.ActivityInformation;
import wosec.server.model.ActivityType;
import wosec.server.model.Event;
import wosec.server.model.EventData;
import wosec.server.model.EventId;
import wosec.server.model.EventInformation;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.Workflow;
import wosec.util.Configuration;
import wosec.util.HashGenerator;

public class NewInstanceEventHandler extends EventHandler {
    // private final static String staticXMLWorkflowDataDirectory =
    // "/home/david/Eclipse workspace/WoSecServer/WebContent/WorkflowData/";

    private final static Logger log = Logger.getLogger(NewInstanceEventHandler.class.getName());

    public NewInstanceEventHandler(EventHandler nextHandler) {
        super(nextHandler, new String[]{"createInstance"});
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
            log.info("Importing workflow " + workflowID);
            System.out.println("Importing workflow " + workflowID);
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
        //HashMap<String, Integer> idMapping = new HashMap<String, Integer>(activityGroups.size());
        //HashMap<String, String> idMapping = new HashMap<String, String>(activityGroups.size());
        HashMap<String, Activity> groupMapping = new HashMap<String, Activity>(activityGroups.size());

        // Persistiere XML in Datenbank:
        Session dom4jSession = session.getSession(EntityMode.DOM4J);
        Workflow wf = new Workflow();
        Element e = (Element) rootNode;
        wf.setWorkflowId(e.attributeValue("workflow-id"));
        wf.setName(e.attributeValue("workflow-name"));
        session.save(wf);

        //dom4jSession.save("wosec.server.model.Workflow", rootNode);
        for (Node activityGroup : activityGroups) {
            // workflowID kann Hibernate nicht aus Mapping auslesen, muss
            // manuell spezifiziert werden:
            ((Element) activityGroup).addAttribute("workflowID", workflowID);

            Activity ag = new Activity();
            ag.setId(new ActivityId(((Element) activityGroup).attributeValue("group-id"), workflowID));
            ag.setIsGroup((byte) 1);
            //ag.setsetName(((Element) activityGroup).attributeValue("name"));
            ActivityInformation ai = new ActivityInformation(ag, ((Element) activityGroup).attributeValue("name"), "ACTIVITY_INFO_HILF_BOX");
            ai.setId(ag.getId());
            ag.setActivityInformation(ai);
            session.save(ag);
            //session.save(ai);

            groupMapping.put(ag.getId().getActivityId(), ag);


            //int id = (Integer) dom4jSession.save("wosec.server.model.ActivityGroup", activityGroup);
            // Speichere Mapping von ReferenzID auf ID in HashMap:
            //idMapping.put(((Element) activityGroup).attributeValue("group-id"), id);
            //idMapping.put(((Element) activityGroup).attributeValue("group-id"), ((Element) activityGroup).attributeValue("group-id"));
        }

        for (Node activity : activities) {
            Element activityElem = ((Element) activity);
            //String inWorkflowPool = activityElem.attributeValue("lane") == "workflow" ? "true" : "false";
            //activityElem.addAttribute("inWorkflowPool", inWorkflowPool);

            // Lese die ReferenzID der ActivityGroup aus, zu der diese Activity
            // gehört
            // und füge dem XML-Knoten die dazugehörige numerische GruppenID an
            // (benötigt als Fremdschlüssel in der Datenbank).

            Activity ac = new Activity();
            ac.setIsGroup((byte) 0);
            ac.setId(new ActivityId(activityElem.attributeValue("activity-id"), workflowID));
            //ActivityInformation ai = new ActivityInformation(ac, workflowID, "");
            ac.setActivityInformation(new ActivityInformation(ac, activityElem.attributeValue("name"), "ne info"));
            ac.getActivityInformation().setId(ac.getId());
            ac.getActivityInformation().setActivity(ac);
            //ac.setActivityId(activityElem.attributeValue("activity-id"));
            //TODO optimieren! activiry_group ist schon in idmapping vorhanden
            /*Activity group = (Activity) session.createQuery("from Activity where activity_id = ? AND workflow_id = ? AND is_group = ?")
            .setString(0, activityElem.attributeValue("activity_group"))
            .setString(1, workflowID)
            .setByte(2, (byte)1)
            .uniqueResult();
            System.out.println(group);
            /*ac.setGroupActivity((Activity) session.createQuery("from Activity where activity_id = ? AND workflow_id = ? AND is_group = ?")
            .setString(0, activityElem.attributeValue("activity_group"))
            .setString(1, workflowID)
            .setByte(2, (byte)1)
            .uniqueResult()
            );*/
            ac.setGroupActivity(groupMapping.get(activityElem.attributeValue("activity_group")));
            //System.out.println(ac.getId().getActivityId());
            //ac.setActivityName("delete ME!");
            session.save(ac);
            System.out.println(ac.getId().getActivityId() + " == " + ac.getGroupActivity().getId().getActivityId());
            //session.save(ac.getActivityInformation());
            //ac.setActivityName(activityElem.attributeValue("name"));

            //String groupReferenceID = activityElem.attributeValue("activity_group");
            //activityElem.addAttribute("groupID", String.valueOf(idMapping.get(groupReferenceID)));

            //dom4jSession.save("Activity", activity);
        }
        for (Node activity : activities) {
            Element activityElem = ((Element) activity);
            if (activityElem.attributeValue("corresponding_activity") != null) {
                Activity ac = (Activity) session.createQuery("from Activity where id.activityId = ? AND workflow_id = ?").setString(0, activityElem.attributeValue("activity-id")).setString(1, workflowID).uniqueResult();
                Activity refAc = (Activity) session.createQuery("from Activity where id.activityId = ? AND workflow_id = ?").setString(0, activityElem.attributeValue("corresponding_activity")).setString(1, workflowID).uniqueResult();
                ac.setRefActivity(refAc);
                session.update(ac);
            }
        }
        log.info(String.format("Transferred %d activities and %d activityGroups from workflow XML %s to database",
                activities.size(), activityGroups.size(), workflowID));
    }

    // TODO überlegen ob man das hier auslagern sollte!
    public static String createInstance(Workflow workflow, User user, String timestamp, Session session, String newInstanceEventType) throws ParseException {
        // Lade Benutzer und Workflow für neue Instanz aus Datenbank
        //User user = (User) session.createQuery("from User where identifier = ?").setString(0, req.getParameter("identifier")).uniqueResult();
        //Workflow workflow = (Workflow) session.load(Workflow.class, workflowID);
        // Prüfe, ob Instanz schon vorhanden:
        /*if (session.get(Instance.class, req.getParameter("instanceID")) != null) {
        throw new Exception("Instance already in database!");
        }*/

        //Neue Instanz erstellen
        String instanceId = UUID.randomUUID().toString();
        // Erzeuge neue Instanz
        Instance newInstance = new Instance();
        newInstance.setInstanceId(instanceId);
        newInstance.setWorkflow(workflow);
        newInstance.setUser(user);

        // Erzeuge createInstance-Event
        Event newInstanceEvent = new Event(EventId.generateKey(newInstance.getInstanceId()), newInstance);
        {
            EventInformation evI = new EventInformation();
            evI.setId(newInstanceEvent.getId());
            evI.setEvent(newInstanceEvent);
            newInstanceEvent.setEventInformation(evI);
            ActivityType type = (ActivityType) session.createQuery("from ActivityType a where a.name = ?").setString(0, newInstanceEventType).uniqueResult();
            Set<ActivityType> typesSet = new HashSet<ActivityType>(1);
            typesSet.add(type);
            newInstanceEvent.setActivityTypes(typesSet);
        }
        //newInstanceEvent.setType(newInstanceEventType);
        //newInstanceEvent.setInstance(newInstance);

        // MySQL: Spalte 'time' muss vom Typ TIMESTAMP sein, dann wird das Datum
        // gespeichert
        Date time;
        if (timestamp == null) {
            time = new Date();
        } else {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
            time = format.parse(timestamp);
        }
        newInstanceEvent.getEventInformation().setEventTime(time);

        // Speichere neue Instanz und dazugehöriges Event in der Datenbank
        session.save(newInstance);
        session.save(newInstanceEvent);
        return newInstance.getInstanceId();
        //session.save(newInstanceEvent.getEventInformation());
    }

    /***
     * Handelt es sich um ein createInstance-Event und bezieht sich dieses auf
     * einen Workflow, der noch nicht in der Datenbank gespeichert ist, werden
     * die im XML-Format vorliegenden statischen Daten zu diesem Workflow
     * mittels Hibernate in die Datenbank geschrieben und somit dem System
     * bekannt gemacht. Anschließend wird das createInstance-Event in die
     * Events-Tabelle der Datenbank gespeichert.
     */
    @Override
    protected void handle(String eventType, HttpServletRequest req, HttpServletResponse resp) {
        String workflowID = req.getParameter("modelID");
        if (workflowID == null) {
            log.info("No modelID given, nothing to do");
            return;
        }

        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        Transaction tx = session.beginTransaction();
        System.out.println(session.toString());
        //Transaction tx;
        log.info("Started transaction for new workflow");
        try {
            //Workflows müssen nun über die Weboberfläche erstellt werden!
            //createWorkflow(workflowID, session);
            Workflow wf = (Workflow) session.get(Workflow.class, workflowID);
            // tx.commit();
            if (wf != null) {
                //User usr = (User) req.getAttribute("user");
                User usr = User.loadFromId((Integer) req.getAttribute("userId"));System.out.println(session.toString());
//                session = HibernateUtil.getSessionFactory().getCurrentSession();
//                tx = session.beginTransaction();
                /*System.out.println(usr.getWorkflows().size());
//                                tx.commit();
                boolean contains = false;
                for(Iterator<Workflow> it = usr.getWorkflows().iterator(); it.hasNext() && !contains; ) {
                Workflow uWf = it.next();
                // TODO testen, ob das nicht doch mit contains geht...
                contains = uWf.equals(wf);
                //log.info(uWf.getWorkflowId());
                //log.info("wf: " + wf.getWorkflowId());
                /*System.out.println(uWf);
                System.out.println(wf);
                System.out.println(wf.getName());* /
                System.out.println(uWf.equals(wf));
                }*/
                if (usr.getWorkflows().contains(wf)) {
//                    tx.commit();
                    //session.close();
//                    session = HibernateUtil.getSessionFactory().openSession();
//                    tx = session.beginTransaction();
                    //tx.commit();
                    //tx = HibernateUtil.getSessionFactory().openSession().beginTransaction();System.out.println(session.toString());
//                    log.info("Started transaction for new instance");
//                    //session = HibernateUtil.getSessionFactory().getCurrentSession();
//                    //tx = session.beginTransaction();
//                    String instanceId = createInstance(wf, session, eventType, req);
                    User user = (User) session.createQuery("select u from User u where identifier = ?").setString(0, req.getParameter("identifier")).uniqueResult();
                    //System.out.println(session.toString());
                    String instanceId = createInstance(wf, user, req.getParameter("timestamp"), session, eventType);
//                    tx.commit(); q
                    log.info("Transaction committed");
                    req.setAttribute("response", instanceId);
                    req.getRequestDispatcher("/WEB-INF/EventHandlerResponse.jsp").forward(req, resp);
                    //session.flush();
                } else {
                    log.info("new instance creation not permitted!");
                }
                
                tx.commit();
            } else {
                System.out.println("NOT GOING IN!");
            }
            //log.info("Transaction committed");

        } catch (HibernateException ex) {
            log.log(Level.SEVERE, ex.getMessage());
            log.log(Level.SEVERE, "Rolling back transaction");
            doRollback(tx);
        } catch (IOException ex) {
        log.log(Level.SEVERE, ex.getMessage());
        log.log(Level.SEVERE, "Rolling back transaction");
        doRollback(tx);
        } catch (ServletException ex) {
        log.log(Level.SEVERE, ex.getMessage());
        log.log(Level.SEVERE, "Rolling back transaction");
        doRollback(tx);
        } catch (ParseException ex) {
        log.log(Level.SEVERE, ex.getMessage());
        log.log(Level.SEVERE, "Rolling back transaction");
        doRollback(tx);
        }/*
        catch (Exception e) {
        log.log(Level.SEVERE, e.getMessage());
        log.log(Level.SEVERE, "Rolling back transaction");
        doRollback(tx);
        }*/
        System.out.println("erst jetzt weiterleiten...");
    }
}