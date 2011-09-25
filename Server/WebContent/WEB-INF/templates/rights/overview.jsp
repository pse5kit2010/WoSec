<%-- any content can be specified here e.g.: --%>
<%@page import="java.util.List"%>
<%@page import="java.util.Iterator"%>
<%@page import="wosec.server.model.Workflow"%>
<%@page import="java.util.Set"%>
<%@ page pageEncoding="UTF-8" %>
<jsp:useBean id="user" class="wosec.server.model.User" scope="session"/>

<%
    if (!user.isAdmin()) {
        request.getRequestDispatcher("/WEB-INF/Error.jsp").forward(request, response);
    }
%>


<table id="instancestable">
    <tr id="headrow">
        <th>ID</th>
        <th>Workflow-Name</th>
        <th>Sicherheitsstatus</th>
        <th>Aktion</th>
    </tr>
    <%
        List<Workflow> workflows = (List<Workflow>) request.getAttribute("workflowList");
        for (Workflow wf : workflows) {
    %>
    <tr>
        <td><%=wf.getWorkflowId()%></td>
        <td><%=wf.getName()%></td>
        <td><%=wf.getSecurityLevel()%></td>
        <td><a href="Rights?page=wf_access&amp;workflow=<%=wf.getWorkflowId()%>">Workflow-Zugriffe bearbeiten</a> |
            <a href="Rights?page=security&amp;workflow=<%=wf.getWorkflowId()%>">Sicherheitsstatus bearbeiten</a>
        </td>
    </tr>
    <%
        }
    %>
</table>