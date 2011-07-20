<%@ page language="java" pageEncoding="UTF-8" import="wosec.server.model.Activity,  wosec.server.model.ActivityGroup, java.util.List, java.util.Iterator, java.sql.Timestamp" %> 
	<jsp:useBean id="instance" class="wosec.server.model.Instance" scope="request"/>
	<jsp:include page="/WEB-INF/templates/header.jsp">
		<jsp:param name="title" value="Einzelansicht | WoSec" />
	</jsp:include>
	
	<%@ page contentType="application/xhtml+xml; charset=utf-8" %>

	<link type="text/css" rel="stylesheet" href="media/styles/singleview.css" />
	<link type="text/css" href="media/jquery-ui-1.8.7.custom.css" rel="stylesheet" />
    
    <script type="text/javascript" src="jslib/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="jslib/dragscrollable.js"></script>
    <script type="text/javascript" src="jslib/jquery.svg.js"></script>
    <script type="text/javascript" src="jslib/jquery.svganim.js"></script>
    <script type="text/javascript" src="jslib/WoSec.min.js"></script>
	
	<script>
		$(function() {
					<%
						@SuppressWarnings("unchecked")
						List<Activity> activities = (List<Activity>) request.getAttribute("activities");
						Activity activity;
						String tmpWfid = "";
						String laneTasks = "";
						String corresponding = "";
						
						Iterator<Activity> it = activities.iterator();
	
						while (it.hasNext()) {
							activity = it.next();
							
							if(!tmpWfid.equals(activity.getActivityGroup().getReferenceID())) {
								//New ActivityGroup begins
								
								if(!tmpWfid.equals("")) {
									//Is not the first Group
									laneTasks += "],\n";
								}
								
								tmpWfid = activity.getActivityGroup().getReferenceID();
								laneTasks += "\"" + tmpWfid + "\" : [";
								
							} else {
								//TaskId is not the first in the Group
								laneTasks += ", ";
							}
							
							laneTasks += "\"" + activity.getId() + "\"";
						}
						laneTasks += "]";
						

						it = activities.iterator();
						while (it.hasNext()) {
							activity = it.next();
							
							if(activity.getCorrespondingActivity() != null) {
								corresponding += "\""+activity.getId()+"\" : \""+activity.getCorrespondingActivity().getId()+"\",\n";
								corresponding += "\""+activity.getCorrespondingActivity().getId()+"\" : \""+activity.getId()+"\",\n";
							}
						}
								
						corresponding = corresponding.substring(0, corresponding.length()-2);

				%>

	            var correspondingTasks = {
					<%=corresponding%>
	            };
				var tasksInALane = {
					<%=laneTasks%>
            	};
			
			WoSec.workflow.init("<jsp:getProperty name="instance" property="id" />", correspondingTasks, tasksInALane);
			WoSec.htmlRenderer.timeSlider.init();
			<%
				System.out.println("foo");
			
				java.util.Date lastVisited = (java.util.Date)instance.getLastVisited();
				System.out.println(lastVisited); 
				long timestamp = 0;
				if (lastVisited != null)
					timestamp = lastVisited.getTime() / 1000L; 
			%>
			WoSec.ajaxUpdater.init(<%=timestamp%>);
		});

        $(function(){
        
            // Set drag scroll on first descendant of class dragger on both selected elements
            $('#instancesvg, #inner').dragscrollable({
                dragSelector: '.dragger:first',
                acceptPropagatedEvent: true
            });
        });

	</script>
</head>
<body>
    
		
        <jsp:useBean id="workflow" class="wosec.server.model.Workflow" scope="request"/>
        <jsp:useBean id="user" class="wosec.server.model.User" scope="session" />
  
        <div id="color-store"><!--just for css storage--><span id="rect-obtrusive"></span><span id="rect-unobtrusive"></span><span id="rect-reset"></span></div>

    <div id="header">
         <h1><jsp:getProperty name="workflow" property="name" /></h1>
	 <div id="headerright">
 	        <div id="userinfo">
 	            <span>Angemeldet als <jsp:getProperty name="user" property="displayname" /></span>
 	            <a href="UserController?action=logout" id="logoutLink">Logout</a>
 	        </div>
 	    <div id="timeslider-play-button"><div id="timeslider-play-button-overlay"></div></div>
		<div id="slider">
   		    <div id="timeslider"></div>
		</div>
 	</div>
    </div>

	<div id="container">
	
	<div id="databox">
		<div id="databox-hover"></div>
    </div>
		
	<div id="instancesvg">
		<div id="base" class="dragger">
    	<div id="infoboxes"></div>
        ${svginline}
</div></div></div>

</body>
</html>