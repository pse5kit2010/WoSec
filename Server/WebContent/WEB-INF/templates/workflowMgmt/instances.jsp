<%@page import="java.util.Iterator"%>
<%@page import="wosec.server.model.Instance"%>
<%@page import="wosec.server.model.Workflow"%>
<%@page language="java" pageEncoding="UTF-8" %> 
<table id="instancestable">
    <tr id="headrow">
        <th>Instanz:</th>
        <th>Anzahl Events</th>
        <th>Benutzer:</th>
        <th>Aktion</th>
    </tr>
    <%
        Workflow wf = (Workflow)request.getAttribute("workflow");
        for (Iterator<Instance> it = wf.getInstances().iterator(); it.hasNext();) {
            Instance inst = it.next();
    %>
    <tr>
        <td><%=inst.getInstanceId()%></td>
        <td><%=inst.getEvents().size() %></td>
        <td><%=inst.getUser().getDisplayName()%></td>
        <td><a href="WorkflowMgmt?page=instances&amp;workflow=<%=wf.getWorkflowId()%>&amp;instance=<%=inst.getInstanceId()%>&amp;action=delete">Löschen</a> | <a href="WorkflowMgmt?page=instances&amp;workflow=<%=wf.getWorkflowId()%>&amp;instance=<%=inst.getInstanceId()%>&amp;action=reset">Instanz zurücksetzen</a> </td>
    </tr>
    <%
        }
    %>
</table>