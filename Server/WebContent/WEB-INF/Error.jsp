<%@ page language="java" pageEncoding="UTF-8" %> 

<jsp:include page="/WEB-INF/templates/header.jsp">
	<jsp:param name="title" value="Fehler | WoSec" />
        <jsp:param name="page" value="error" />
    <jsp:param name="usr" value="" />
    <jsp:param name="additional" value="" />
</jsp:include>
</head>
<body>
	<div id="errorbox">
		Beim Verarbeiten Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal!
	</div>
	<div id="biglogo"></div>
</body>
</html>