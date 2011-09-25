package wosec.server.view;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletResponse;

import wosec.server.model.Event;
import wosec.server.model.Instance;
import flexjson.JSONSerializer;
import java.util.Iterator;
import wosec.server.model.EventAttachment;

public class JsonView {

    private final static String highlighting = "startActivityExecution";
    private final static String[] markFinished = {"humanActivityExecuted", "eventActivityExecuted",
        "WSActivityExecuted"};
    private final static String[] specifyingParticipant = {"HumanTaskExecutorSelected", "WSProviderSelected",};
    private final static String[] transferingData = {"DataTransferredToWS", "DataTransferredFromWS",
        "DataTransferredToHuman", "DataTransferredFromHuman"};

    public static void createJSONInformation(HttpServletResponse response, HashMap<String, String> map) {
        JSONSerializer serializer = new JSONSerializer();
        try {
            response.getWriter().print(serializer.serialize(map));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Diese Methode ist verantwortlich für die JSON-Ausgabe der Instanzen, d.h.
     * es wird im JSON-Format die Instanz-ID, der Workflowname das Datum des
     * letzten und ersten Events so wie der Typ des letzten Events ausgegeben.
     * 
     * @param response
     *            HttpServletResponse
     * @param list
     *            enthält jeweils eine Instanz und zwei Events
     */
    public static void createJSONInstances(HttpServletResponse response, List<Object[]> list) {
        JSONSerializer serializer = new JSONSerializer();

        Map<String, Object>[] result = new HashMap[list.size()];
        int i = 0;
        for (Object[] ob : list) {

            Instance in = (Instance) ob[0];
            Event first = (Event) ob[1];
            Event last = (Event) ob[2];
            result[i] = new HashMap<String, Object>(5);

            result[i].put("id", in.getInstanceId());
            result[i].put("workflowName", in.getWorkflow().getName());
            result[i].put("create", first.getEventInformation().getEventTime().getTime() / 1000L);
            result[i].put("finished", last.getEventInformation().getEventTime().getTime() / 1000L);
            result[i].put("lastEvent", last.getActivityTypesString());

            i++;
        }

        try {
            response.getWriter().print(serializer.serialize(result));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Diese Methode ist für die JSON-Ausgabe der Events verantwortlich, d.h. es
     * werden alle wichtigen Daten zu den Events im JSON-Format übergeben.
     * 
     * @param response
     *            HttpServletResponse
     * @param liste
     *            von Events
     */
    public static void createJSONEvents(HttpServletResponse response, List<Event> liste) {
        JSONSerializer serializer = new JSONSerializer();
        Map<String, Object>[] result = new HashMap[liste.size()];
        int i = 0;
        for (Event e : liste) {

            result[i] = new HashMap<String, Object>(8);
            Map<String, Object> information = new HashMap<String, Object>(5);
            String type = e.getActivityTypesString();

            //result[i].put("eventType", type);
            result[i].put("eventCommand", changeType(type));
            result[i].put("timestamp", e.getEventInformation().getEventTime().getTime() / 1000L);
            if (e.getEventInformation().getActivity() != null) {
                if (e.getEventInformation().getActivity().getIsGroup() == 0) {
                    result[i].put("activityID", e.getEventInformation().getActivity().getId().getActivityId());
                    result[i].put("workflowID", e.getEventInformation().getActivity().getWorkflow().getWorkflowId());
                    if (e.getEventInformation().getFromActivity() != null) {
                        information.put("fromTask", e.getEventInformation().getFromActivity().getId().getActivityId());
                        information.put("fromWorkflow", e.getEventInformation().getFromActivity().getWorkflow().getWorkflowId());
                    }
                } else {
                    result[i].put("activityGroupID", e.getEventInformation().getActivity().getId().getActivityId());
                    result[i].put("workflowID", e.getEventInformation().getActivity().getWorkflow().getWorkflowId());
                }
            }
            //if (e.getEventData().getGroup() != null)
            //	result[i].put("activityGroupID", e.getGroup().getReferenceID());
            //TODO particpant löschen! participants ist neu!
            //DEPRACED participant löschen
            if (e.getEventInformation().getDataProvider() != null) {
                information.put("participant", e.getEventInformation().getDataProvider().getName());
            } else if (e.getEventInformation().getEvokingUser() != null) {
                information.put("participant", e.getEventInformation().getEvokingUser().getDisplayName());
            }
            if (e.getEventInformation().getEvokingUser() != null || e.getEventInformation().getExecutingUser() != null || e.getEventInformation().getDataProvider() != null) {
                HashMap<String, String> participants = new HashMap<String, String>();
                if (e.getEventInformation().getEvokingUser() != null) {
                    participants.put("evokUser", e.getEventInformation().getEvokingUser().getDisplayName());
                }
                if (e.getEventInformation().getExecutingUser() != null) {
                    participants.put("execUser", e.getEventInformation().getExecutingUser().getDisplayName());
                }
                if (e.getEventInformation().getDataProvider() != null) {
                    participants.put("provider", e.getEventInformation().getDataProvider().getName());
                }
                information.put("participants", participants);
            }
            if (e.getEventInformation().getEventData() != null) {
                if (e.getEventInformation().getEventData().getDataUsed() != null) {
                    information.put("data", e.getEventInformation().getEventData().getDataUsed());
                }
                if (e.getEventInformation().getEventData().getUsageReason() != null) {
                    information.put("usageReason", e.getEventInformation().getEventData().getUsageReason());
                }
                if (e.getEventInformation().getEventData().getEventAttachments().size() > 0) {
                    Map<String, Object> attachments = new HashMap<String, Object>(e.getEventInformation().getEventData().getEventAttachments().size());
                    for (Iterator<EventAttachment> it = e.getEventInformation().getEventData().getEventAttachments().iterator(); it.hasNext();) {
                        EventAttachment at = it.next();
                        //attachments.put(at.getName(), at.getAttachmentId());
                        attachments.put("link", at.getAttachmentId());
                        attachments.put("name", at.getName());
                        attachments.put("type", at.getAttachmentType());
                    }
                    information.put("attachments", attachments);
                }

            }

            /*if (e.getEventInformation().getEventData() != null && e.getEventInformation().getEventData().getDataUsed() != null) {
            information.put("data", e.getEventInformation().getEventData().getDataUsed());
            }*/
            result[i].put("information", information);

            i++;
        }

        try {
            System.out.println(serializer.serialize(result));
            response.getWriter().print(serializer.serialize(result));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String changeType(String type) {
        if (Arrays.asList(highlighting).contains(type)) {
            return "StartingTask";
        } else if (Arrays.asList(markFinished).contains(type)) {
            return "FinishingTask";
        } else if (Arrays.asList(specifyingParticipant).contains(type)) {
            return "SpecifyingParticipant";
        } else if (Arrays.asList(transferingData).contains(type)) {
            return "TransferingData";
        } else {
            return "EventCommand";
        }
    }

    public static void createJSONSearchResults(HttpServletResponse resp, List<Event> events) {
        resp.setContentType("text/x-json;charset=UTF-8");
        JSONSerializer serializer = new JSONSerializer();
        Set<String> uniqueInstanceIDs = new HashSet<String>(events.size());
        for (Event ev : events) {
            uniqueInstanceIDs.add(ev.getInstance().getInstanceId());
        }
        try {
            // Serialisiere zu JSON:
            resp.getWriter().print(serializer.serialize(uniqueInstanceIDs));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
