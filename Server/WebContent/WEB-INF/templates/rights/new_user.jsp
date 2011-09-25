<%@page import="java.util.List"%>
<%@page import="java.util.Iterator"%>
<%@page import="wosec.server.model.User"%>
<%@page import="java.util.Set"%>
<%@ page pageEncoding="UTF-8" %>
<jsp:useBean id="workflow" class="wosec.server.model.Workflow" scope="request" />
<form action="Rights?<%=request.getQueryString()%>" method="post">
    <table>
        <tr>
            <th>Workflow-ID</th>
            <td><%=workflow.getWorkflowId()%></td>
        </tr>
        <tr>
            <th>Workflow-Name</th>
            <td><%=workflow.getName()%></td>
        </tr>
        <tr>
            <th>Benutzer</th>
            <td><%
                List<User> userList = (List<User>) request.getAttribute("user_list");
                if (userList.isEmpty()) {
                    out.println("Momentan haben alle Benutzer Zugriff auf dieses Workflow");
                } else {
                    out.println("<select name=\"user\">");
                    for (User user : userList) {
                        out.println("<option value=\"" + user.getUserId() + "\">" + user.getIdentifier() + " (" + user.getDisplayName() + ")</option>");
                    }
                    out.println("</select>");
                }
                %></td>
        </tr>
        <tr>
            <td colspan="2"><input type="submit" name="submit" value="Zugriffsberechtigung hinzufügen"<% if (userList.isEmpty()) {
                    out.println("disabled=\"disabled\"");
                }%> /></td>
        </tr>
    </table>
</form>