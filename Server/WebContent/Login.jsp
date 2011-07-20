<%@ page language="java" pageEncoding="UTF-8" %> 

<jsp:include page="/WEB-INF/templates/header.jsp">
	<jsp:param name="title" value="Login | WoSec" />
</jsp:include>

</head>
<body>
	<div id="header">
		<h1>Login</h1>
	</div>
	
	<!--[if IE ]>
  		<p>Sie verwenden einen Browser, der von WoSec nicht unterstützt wird. Bitte rufen Sie diese Seite mit Firefox, Opera oder Google Chrome erneut auf. Vielen Dank für Ihr Verständnis.</p>
	<![endif]-->
	
	<% String err = (String)request.getAttribute("error");
	   if (err != null && err != "") { %>
		<p id="loginerr"><%= err %></p>
	<% } %>
	<div id="login">
		<form id="loginForm" name="form1" method="post" action="UserController">
			<input type="hidden" name="action" value="login" />
			<table>
				<tr>
			    	<td><label>Name</label></td>
			    	<td><input name="username" type="text" /></td>
			    </tr>
			    <tr>
			    	<td><label>Passwort</label></td>
			    	<td><input name="password" type="password" />
			    </tr>
			</table>
			<input type="submit" name="button" id="button" value="Anmelden" />
		</form>
	</div>
	<div id="biglogo"></div>
</body>
</html>