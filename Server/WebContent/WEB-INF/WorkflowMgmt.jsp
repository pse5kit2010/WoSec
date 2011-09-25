<%-- 
    Document   : WorkflowMgmt
    Created on : 22.08.2011, 05:42:56
    Author     : murat
--%>
<%@page import="wosec.server.controllers.WorkflowManagementController"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Set"%>
<%@page import="wosec.server.model.Workflow"%>
<%@page language="java" pageEncoding="UTF-8" %> 

<jsp:useBean id="user" class="wosec.server.model.User" scope="session"/>

<%
System.out.println(user.getDisplayName());
    if (!user.isBPMNDesigner()) {
        request.getRequestDispatcher("/WEB-INF/Error.jsp").forward(request, response);
    }
%>
<jsp:include page="/WEB-INF/templates/header.jsp">
    <jsp:param name="title" value="Workflow Management" />
    <jsp:param name="page" value="workflowMgmt" />
    <jsp:param name="usr" value="<%=user.getDisplayName()%>" />
    <jsp:param name="additional" value="" />
</jsp:include>

</head>
<body>
    <div id="header">
        <h1>Workflow Management</h1>

        <div id="topbar">
            <div id="userinfo">
                <span>Angemeldet als <jsp:getProperty name="user" property="displayName" /></span>
                <a id="logoutButton" href="UserController?action=logout">Logout</a>
            </div>
            <div id="topbar_links">
                <a href="AllInstances.jsp">Zurück zur Instanz-Übersicht</a>
            </div>
        </div>
    </div>
    <jsp:include page="/WEB-INF/templates/workflowMgmt/${page}.jsp" />

</body>
</html>