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

public class JsonView {
	private final static String highlighting = "startActivityExecution";
	private final static String[] markFinished = { "humanActivityExecuted", "eventActivityExecuted",
			"WSActivityExecuted" };
	private final static String[] specifyingParticipant = { "HumanTaskExecutorSelected", "WSProviderSelected", };
	private final static String[] transferingData = { "DataTransferredToWS", "DataTransferredFromWS",
			"DataTransferredToHuman", "DataTransferredFromHuman" };

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

			result[i].put("id", in.getId());
			result[i].put("workflowName", in.getWorkflow().getName());
			result[i].put("create", first.getTime().getTime() / 1000L);
			result[i].put("finished", last.getTime().getTime() / 1000L);
			result[i].put("lastEvent", last.getType());

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
			Map<String, Object> information = new HashMap<String, Object>(3);
			String type = e.getType();

			result[i].put("eventType", type);
			result[i].put("eventCommand", changeType(type));
			result[i].put("timestamp", e.getTime().getTime() / 1000L);
			if (e.getActivity() != null)
				result[i].put("activityID", e.getActivity().getId());
			if (e.getGroup() != null)
				result[i].put("activityGroupID", e.getGroup().getReferenceID());
			if (e.getProvider() != null)
				information.put("participant", e.getProvider().getName());
			else if (e.getUser() != null)
				information.put("participant", e.getUser().getDisplayname());
			if (e.getDescription() != null)
				information.put("data", e.getDescription());
			result[i].put("information", information);

			i++;
		}

		try {
			response.getWriter().print(serializer.serialize(result));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private static String changeType(String type) {
		if (Arrays.asList(highlighting).contains(type))
			return "Highlighting";
		else if (Arrays.asList(markFinished).contains(type))
			return "MarkFinished";
		else if (Arrays.asList(specifyingParticipant).contains(type))
			return "SpecifyingParticipant";
		else if (Arrays.asList(transferingData).contains(type))
			return "TransferingData";
		else
			return "EventCommand";
	}

	public static void createJSONSearchResults(HttpServletResponse resp, List<Event> events) {
		resp.setContentType("text/x-json;charset=UTF-8");
		JSONSerializer serializer = new JSONSerializer();
		Set<String> uniqueInstanceIDs = new HashSet<String>(events.size());
		for (Event ev: events) {
			uniqueInstanceIDs.add(ev.getInstance().getId());
		}
		try {
			// Serialisiere zu JSON:
			resp.getWriter().print(serializer.serialize(uniqueInstanceIDs));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
