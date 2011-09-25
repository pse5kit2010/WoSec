<%@ page language="java" pageEncoding="UTF-8" import="wosec.server.model.Activity, java.util.List, java.util.Iterator, java.sql.Timestamp" %> 
	<jsp:useBean id="instance" class="wosec.server.model.Instance" scope="request"/>
        <jsp:useBean id="workflow" class="wosec.server.model.Workflow" scope="request"/>
        <jsp:useBean id="user" class="wosec.server.model.User" scope="session" />
	<jsp:include page="/WEB-INF/templates/header.jsp">
		<jsp:param name="title" value="Einzelansicht | WoSec" />
                <jsp:param name="page" value="workflow" />
                <jsp:param name="usr" value="<%=user.getDisplayName()%>" />
                <jsp:param name="additional" value="_${instance.instanceId}_${workflow.workflowId}" />
	</jsp:include>
	
	<%@ page contentType="application/xhtml+xml; charset=utf-8" %>

	<link type="text/css" rel="stylesheet" href="media/styles/singleview.css" />
	<link type="text/css" href="media/jquery-ui-1.8.7.custom.css" rel="stylesheet" />
    
	<script type="text/javascript" src="jslib/dragscrollable.js"></script>
    <script type="text/javascript" src="jslib/jquery.svg.js"></script>
    <script type="text/javascript" src="jslib/jquery.svganim.js"></script>
    <!-- <script type="text/javascript" src="jslib/WoSec.min.js"></script> -->
    <script type="text/javascript" src="jslib/WoSec.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/SVG.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/SVGTaskRectangle.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/SVGTaskLaneRectangle.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/SVGDataAnimation.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/HTMLGUI.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/Infobox.js"></script>
    <script type="text/javascript" src="jslib/wosec/View/TimeSlider.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/MixinObservable.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/Task.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/TaskLane.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/Workflow.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/EventCommands.js"></script>
    <script type="text/javascript" src="jslib/wosec/Model/EventChain.js"></script>
    <script type="text/javascript" src="jslib/wosec/AJAXUpdater.js"></script>
	
	<script>
		$(function() {
					<%
						@SuppressWarnings("unchecked")						
						List<Activity> activities = (List<Activity>) request.getAttribute("activities");						
						System.out.println("SingleInstance.jsp aufgerufen");
						Activity activity;
						String tmpWfid = "";
						String laneTasks = "";
						String corresponding = "";
						
						try {							
							Iterator<Activity> it = activities.iterator();						
                                                        System.out.println("im try..");
		
							while (it.hasNext()) {
								activity = it.next();
								
                                                                //TODO TEST
								//if(!tmpWfid.equals(activity.getActivityGroup().getReferenceID())) {
                                                                //System.out.println(activity.getActivityGroup());
                                                                System.out.println(activity.getGroupActivity());
                                                                //if(!tmpWfid.equals(activity.getActivityGroup().getName())) {
                                                                //if(!tmpWfid.equals(activity.getActivityGroup().getId().getGroupId())) {
                                                                if(!tmpWfid.equals(activity.getGroupActivity().getId().getActivityId())) {
									System.out.println("1. while: if genommen");
									//New ActivityGroup begins
									
									if(!tmpWfid.equals("")) {
										//Is not the first Group
										laneTasks += "],\n";
									}
									
                                                                        //TEST!
									//tmpWfid = activity.getActivityGroup().getReferenceID();
                                                                        //tmpWfid = activity.getActivityGroup().getName();
                                                                        tmpWfid = activity.getGroupActivity().getId().getActivityId();
									laneTasks += "\"" + tmpWfid + "\" : [";
									
								} else {
									//TaskId is not the first in the Group
									laneTasks += ", ";
								}
                                                                System.out.println("nach dem if");
								
								laneTasks += "\"" + activity.getId().getActivityId() + "\"";
							}
                                                        System.out.println("nach der while");
							laneTasks += "]";
							System.out.println("1. while: Ende");
							
	
							it = activities.iterator();
							while (it.hasNext()) {
								System.out.println("2. while genommen");
								activity = it.next();
								
								if(activity.getRefActivity() != null) {
									System.out.println("2. while: if genommen");
									corresponding += "\""+activity.getId().getActivityId()+"\" : \""+activity.getRefActivity().getId().getActivityId()+"\",\n";
									corresponding += "\""+activity.getRefActivity().getId().getActivityId()+"\" : \""+activity.getId().getActivityId()+"\",\n";
								}
							}
							
							System.out.println("2. while: Ende");
							System.out.println("corresponding: " + corresponding);
                                                        if (corresponding.length() > 2) {
                                                            corresponding = corresponding.substring(0, corresponding.length()-2);
                                                        }
							System.out.println("2. while: nach Ende und nach 'corresponding'");
						}
						catch (Exception e) {
							e.printStackTrace();
							throw e;
						}
						

				%>

	            var correspondingTasks = {
					<%=corresponding%>
	            };
				var tasksInALane = {
					<%=laneTasks%>
            	};
			
			/*WoSec.workflow.init("<jsp:getProperty name="instance" property="instanceId" />", correspondingTasks, tasksInALane);
			WoSec.htmlRenderer.timeSlider.init();
			<%
				System.out.println("foo");
				
				java.util.Date lastVisited = (java.util.Date)instance.getLastVisited();
				System.out.println(lastVisited); 
				long timestamp = 0;
				if (lastVisited != null)
					timestamp = lastVisited.getTime() / 1000L; 
			%>
			WoSec.ajaxUpdater.init(<%=timestamp%>);*/
                        var workflow = WoSec.newWorkflow("<jsp:getProperty name="instance" property="instanceId" />", correspondingTasks, tasksInALane);
                        var eventChain = WoSec.newEventChain(workflow);
                        var gui = new WoSec.HTMLGUI([eventChain]);
                        new WoSec.AJAXUpdater(eventChain, 0);
		});

        /*$(function(){
        
            // Set drag scroll on first descendant of class dragger on both selected elements
            /*$('#instancesvg, #inner').dragscrollable({
                dragSelector: '.dragger:first',
                acceptPropagatedEvent: true
            });* /
        });*/

	</script>
</head>
<body>
  
    <div id="color-store"><!--just for css storage outsource--><span id="rect-obtrusive"></span><span id="rect-unobtrusive"></span><span id="rect-reset"></span></div>

    <div id="header">
         <h1><jsp:getProperty name="workflow" property="name" /></h1>
         <div id="tabs">
                <ul>
                    <li><a class="workflow-link" href="#<jsp:getProperty name="instance" property="instanceId" />"><jsp:getProperty name="instance" property="instanceId" /></a></li>
                </ul>
            </div>
	 <div id="headerright">
 	        <div id="userinfo">
                    <span>Angemeldet als <%=user.getDisplayName()%></span>
 	            <a href="UserController?action=logout" id="logoutLink">Logout</a>
 	        </div>
 	    <div id="timeslider-play-button">
                <div id="timeslider-play-button-overlay"></div>
            </div>
            <div id="slider">
                <div id="timeslider"></div>
            </div>
 	</div>
    </div>

	<div class="container">
            <div id="<jsp:getProperty name="instance" property="instanceId" />" class="svg">
                <div class="dragger">
                    <div class="infoboxes"></div>
                    ${svginline}
                </div>
            </div>
        </div>

</body>
</html>