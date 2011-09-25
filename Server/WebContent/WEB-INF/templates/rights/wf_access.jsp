<%@page import="org.hibernate.HibernateUtil"%>
<%@page import="org.hibernate.Session"%>
<%@page import="wosec.server.model.User"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Set"%>
<%@page import="wosec.server.model.Workflow"%>
<%@ page pageEncoding="UTF-8" %>

<div id="links">
    <ul>
        <li><a href="Rights?page=wf_access&amp;action=new_user&amp;workflow=<%=request.getParameter("workflow") %>">einem weiteren Benutzer Zugriff geben</a></li>
    </ul>
</div>

Folgende Benutzer haben explizit Zugriff auf das Workflow:

<table id="instancestable">
    <tr id="headrow">
        <th>Login</th>
        <th>Anzeigename</th>
        <th>Rolle</th>
        <th>Aktion</th>
    </tr>
    <%
    Workflow wf = (Workflow)request.getAttribute("workflow");
    Set<User> users = wf.getUsers();
    for (Iterator<User> it = users.iterator(); it.hasNext(); ) {
        User user = it.next();
    %>
    <tr>
        <td><%=user.getIdentifier() %></td>
        <td><%=user.getDisplayName()%></td>
        <td><%=user.getUserRole().getName()%></td>
        <td><a href="Rights?page=wf_access&amp;action=delete&amp;workflow=<%=request.getParameter("workflow") %>&amp;user=<%=user.getUserId() %>">Zugriff entziehen und alle Instanzen löschen</a>
        </td>
    </tr>
    <%
        }
    %>
</table>