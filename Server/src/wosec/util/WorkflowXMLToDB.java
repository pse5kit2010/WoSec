package wosec.util;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.Node;
import org.hibernate.Session;

import wosec.server.model.Activity;
import wosec.server.model.ActivityId;
import wosec.server.model.ActivityInformation;
import wosec.server.model.Workflow;
import wosec.server.model.WorkflowLanguage;
import wosec.server.model.WorkflowLanguageId;
/**
 *
 * @author murat
 */
public final class WorkflowXMLToDB {
    
    private final static Logger log = Logger.getLogger(WorkflowXMLToDB.class.getName());

    public static boolean importXMLToDB(Session session, Document xmlDoc) throws DocumentException {
        Node rootNode = xmlDoc.selectSingleNode("/workflow");
        List<Node> activityGroups = rootNode.selectNodes("activity_group");
        List<Node> languageNodes = rootNode.selectNodes("language");
        List<Node> activities = rootNode.selectNodes("activity");

        HashMap<String, Activity> groupMapping = new HashMap<String, Activity>(activityGroups.size());

        Workflow wf = new Workflow();
        Element e = (Element) rootNode;
        String workflowID = e.attributeValue("workflow-id");
        wf.setWorkflowId(e.attributeValue("workflow-id"));
        wf.setName(e.attributeValue("workflow-name"));
        
        //Sprachen
        if (languageNodes.isEmpty()) {
            // Keine Sprache, Standardsprache nehmen, falls nicht spezifiziert: deutsch
            String language = e.attributeValue("language");
            if (language == null) {
                language = "de";
            }
            final WorkflowLanguage wL = new WorkflowLanguage(new WorkflowLanguageId(workflowID, language), wf, (byte)1);
            wf.setWorkflowLanguages((new HashSet<WorkflowLanguage>(){{add(wL);}}));
            
        } else {
            List<WorkflowLanguage> languages = new LinkedList<WorkflowLanguage>();
            String defaultLanguage = e.attributeValue("language");
            byte isDefaultLanguage = 0;
            for (Node languageNode : languageNodes) {
                Element language = ((Element) languageNode);
                if (defaultLanguage == null || defaultLanguage.equals(language.attributeValue("code"))) {
                    isDefaultLanguage = 1;
                    defaultLanguage = language.attributeValue("code");
                }
                languages.add(new WorkflowLanguage(new WorkflowLanguageId(workflowID, language.attributeValue("code")), wf, isDefaultLanguage));
            }
            wf.setWorkflowLanguages(new HashSet<WorkflowLanguage>(languages));
        }
        
        session.save(wf);

        for (Node activityGroup : activityGroups) {
            // workflowID kann Hibernate nicht aus Mapping auslesen, muss
            // manuell spezifiziert werden:
            //((Element) activityGroup).addAttribute("workflowID", workflowID);
            //System.out.println(activityGroup.getText());

            Activity ag = new Activity();
            ag.setId(new ActivityId(((Element) activityGroup).attributeValue("group-id"), workflowID));
            ag.setIsGroup((byte) 1);
            ActivityInformation ai = new ActivityInformation(ag, ((Element) activityGroup).attributeValue("name"), (activityGroup.getText().isEmpty()) ? null : activityGroup.getText());
            ai.setId(ag.getId());
            ag.setActivityInformation(ai);
            session.save(ag);
            //session.save(ai);

            groupMapping.put(ag.getId().getActivityId(), ag);
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
            ac.setActivityInformation(new ActivityInformation(ac, activityElem.attributeValue("name"), (activityElem.getText().isEmpty()) ? null : activityElem.getText()));
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
            //System.out.println(ac.getId().getActivityId() + " == " + ac.getGroupActivity().getId().getActivityId());
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
        return true;
    }
}
