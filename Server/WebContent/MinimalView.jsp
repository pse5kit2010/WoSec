<%-- 
    Document   : MinimalView
    Created on : 22.08.2011, 02:41:44
    Author     : murat
--%>

<%@ page language="java" pageEncoding="UTF-8" import="wosec.server.model.Activity, java.util.List, java.util.Iterator, java.sql.Timestamp" %> 
<jsp:useBean id="instance" class="wosec.server.model.Instance" scope="request"/>
<jsp:useBean id="workflow" class="wosec.server.model.Workflow" scope="request"/>
<%@ page contentType="application/xhtml+xml; charset=utf-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
        <title>Minimal-Ansicht WoSec</title>
        <!-- <link type="text/css" rel="stylesheet" href="media/styles/default.css" /> -->
        <script type="text/javascript" src="jslib/jquery-1.6.4.js"></script>
    <script type="text/javascript" src="jslib/jquery-ui-1.8.16.custom.js"></script>
        <!--[if IE ]>
                <link type="text/css" rel="stylesheet" href="media/styles/ie.css" />
        <![endif]-->
        <link type="text/css" rel="stylesheet" href="media/styles/minimalview.css" />

        <script type="text/javascript" src="jslib/dragscrollable.js"></script>
    <script type="text/javascript" src="jslib/jquery.svg.js"></script>
    <script type="text/javascript" src="jslib/jquery.svganim.js"></script>
    <!--<script type="text/javascript" src="jslib/WoSec.min.js"></script> -->
    <!-- <script type="text/javascript" src="jslib/WoSec.js"></script>-->
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
                        if (!tmpWfid.equals(activity.getGroupActivity().getId().getActivityId())) {
                            System.out.println("1. while: if genommen");
                            //New ActivityGroup begins

                            if (!tmpWfid.equals("")) {
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

                        if (activity.getRefActivity() != null) {
                            System.out.println("2. while: if genommen");
                            corresponding += "\"" + activity.getId().getActivityId() + "\" : \"" + activity.getRefActivity().getId().getActivityId() + "\",\n";
                            corresponding += "\"" + activity.getRefActivity().getId().getActivityId() + "\" : \"" + activity.getId().getActivityId() + "\",\n";
                        }
                    }

                    System.out.println("2. while: Ende");
                    System.out.println("corresponding: " + corresponding);
                    corresponding = corresponding.substring(0, corresponding.length() - 2);
                    System.out.println("2. while: nach Ende und nach 'corresponding'");
                } catch (Exception e) {
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
                        var workflow = WoSec.newWorkflow("<jsp:getProperty name="workflow" property="workflowId" />", correspondingTasks, tasksInALane);
                        var eventChain = WoSec.newEventChain(workflow);
                        var gui = new WoSec.HTMLGUI([eventChain]);
                        new WoSec.AJAXUpdater(eventChain, <%=timestamp%>, "<jsp:getProperty name="instance" property="instanceId" />");
                        $(window).bind('hashchange', function() {
                          // do new request..
                         $.getJSON("UpdateController?type=Event", {
                                since : eventChain.last().getTimestamp() + 1,
                                instance : "<jsp:getProperty name="instance" property="instanceId" />"
                            }, function(data) {
                                if(data.length != 0) {
                                    eventChain.add(data).play();
                                }
                            });
                        });
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
         <div id="tabs">
                <ul>
                    <li><a class="workflow-link" href="#<jsp:getProperty name="workflow" property="workflowId" />"><jsp:getProperty name="workflow" property="workflowId" /></a></li>
                </ul>
            </div>
	 <div id="headerright">
 	    <div id="timeslider-play-button">
                <div id="timeslider-play-button-overlay"></div>
            </div>
            <div id="slider">
                <div id="timeslider"></div>
            </div>
 	</div>
    </div>
	<div class="container">
            <div id="<jsp:getProperty name="workflow" property="workflowId" />" class="svg">
                <div class="infoboxes"></div>
                <div class="dragger">
                    ${svginline}
                </div>
            </div>
        </div>

    </body>
</html>