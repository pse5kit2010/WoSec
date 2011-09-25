<%-- any content can be specified here e.g.: --%>
<%@page import="java.util.Iterator"%>
<%@page import="wosec.server.model.Workflow"%>
<%@page import="java.util.Set"%>
<%@ page pageEncoding="UTF-8" %>
<jsp:useBean id="user" class="wosec.server.model.User" scope="session"/>

<%
    if (!user.isBPMNDesigner()) {
        request.getRequestDispatcher("/WEB-INF/Error.jsp").forward(request, response);
    }
%>
<div id="links">
    <ul>
        <li><a href="WorkflowMgmt?page=upload">Neues Workflow</a></li>
    </ul>
</div>

<table id="instancestable">
    <tr id="headrow">
        <th>ID</th>
        <th>Workflow-Name</th>
        <th>Anzahl Instanzen</th>
        <th>Aktion</th>
    </tr>
    <%
        Set<Workflow> workflows = user.getWorkflows(true);
        for (Iterator<Workflow> it = workflows.iterator(); it.hasNext();) {
            Workflow wf = it.next();
    %>
    <tr>
        <td><%=wf.getWorkflowId()%></td>
        <td><%=wf.getName()%></td>
        <td><%=wf.getInstances().size()%></td>
        <td><a href="WorkflowMgmt?workflow=<%=wf.getWorkflowId()%>&amp;action=del">Löschen</a> | 
            <a href="WorkflowMgmt?page=instances&workflow=<%=wf.getWorkflowId()%>">Instanzen bearbeiten</a> |
            <a href="WorkflowMgmt?page=instances&workflow=<%=wf.getWorkflowId()%>&amp;action=new">neue Instanz</a>
        </td>
    </tr>
    <%
        }
    %>
</table>