
(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

var CSS_CLASS_INFOBOXES = "infoboxes"
,   CSS_CLASS_SVG = "svg"
,   CSS_CLASS_WORKFLOW_LINK = "workflow-link"
,   CSS_CLASS_CURRENT_WORKFLOW = "current-workflow";
var DELAY_WORKFLOW_SWITCH = 2000;


/**
 * Kontrolliert das Interface
 */
WoSec.HTMLGUI = function HTMLGUI(eventChains) {
    
    var that = this;
    
    var svgs = {};
    var svgElements = {};
    
    var knownTaskIDs = {};
    var knownTaskLaneIDs = {};
    
    var timeSlider = {};
    
    var workflowIDs = [];
    
    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Workflow} workflow beobachteter Workflow
     */
    this.refresh = function(workflow) {
        refreshTasks(workflow);
        refreshTaskLanes(workflow);
        return this;
    }
    
    eventChains.forEach(function(e) {
        var w = e.getWorkflow()
        var wID = w.getID();
        workflowIDs.push(wID);
        //timeSlider[wID] = that.newTimeSlider(that, e);
        //e.registerObserver(timeSlider[wID]);
        w.registerObserver(that);
    });
    
    $("." + CSS_CLASS_SVG).each(function() {
        var id = $(this).attr("id");
        if (workflowIDs.indexOf(id) === -1) {
            throw new Error("Unknown workflowID[" + id +"]");
        }
        svgs[id] = new SVG(id);
        svgElements[id] = [];
        knownTaskIDs[id] = [];
        knownTaskLaneIDs[id] = [];
    });
    
    var mapWorkflowsTabs = {};
    $("." + CSS_CLASS_WORKFLOW_LINK).each(function() {
        var workflowID = $(this).attr("href").substr(1);
        mapWorkflowsTabs[workflowID] = $(this);
        if (workflowIDs.indexOf(workflowID) === -1) {
             throw new Error("Unknown workflowID[" + workflowID +"]");
        }
        $(this).click(function() {
             switchWorkflow($(this).attr("href"));
        });
    });
    function switchWorkflow(id) {
        $("." + CSS_CLASS_SVG).each(function() {
             $(this).hide();
        });
        $("." + CSS_CLASS_WORKFLOW_LINK).each(function() {
            $(this).removeClass(CSS_CLASS_CURRENT_WORKFLOW);
            if ($(this).attr("href").substr(1) === id) {
                $(this).addClass(CSS_CLASS_CURRENT_WORKFLOW);
            }
        });
        $("#" + id).show();
        mapWorkflowsTabs[id].addClass(CSS_CLASS_CURRENT_WORKFLOW);
        eventChains.forEach(function(e) {
            if (e.getWorkflow().getID() !== id) {
                e.lock();
            }
        });
    }
    switchWorkflow(eventChains[0].getWorkflow().getID()); // select first as active
    
    function refreshTasks(workflow) {
        var workflowID = workflow.getID();
        var taskIDs = workflow.getTaskRepositoryEntries();
        var taskID;
        for(var i = taskIDs.length - 1; i >= 0; i--) {
            taskID = taskIDs[i];
            if(knownTaskIDs[workflowID].indexOf(taskID) > -1) {
                continue;
            }
            var task = workflow.getTaskByID(taskID);
            var svgTaskRectangle = svgs[workflowID].newTaskRectangle(taskID);
            task.registerObserver(svgTaskRectangle);
            
            var otherWorkflowID = svgTaskRectangle.getOtherWorkflowID();
            if (otherWorkflowID) {
                task.registerObserver((function(wID){
                    return {
                        refresh: function(task) {
                            if (task.getState() === "TransferingData") {
                                setTimeout(function() {
                                    switchWorkflow(wID);
                                }, DELAY_WORKFLOW_SWITCH);
                            }
                        }
                    };
                    })(otherWorkflowID) // bind this workflowID
                )
            }
            
            
            var svgDataAnimation;
            if(task.getCorrespondingTask()) {
                svgDataAnimation = svgs[workflowID].newDataAnimation(taskID, svgTaskRectangle.getPosition().getCenter(), svgs[workflowID].getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter());
                task.registerObserver(svgDataAnimation);
            }
            var infobox = that.newInfobox(svgTaskRectangle.getPosition())
            task.registerObserver(infobox);
            svgTaskRectangle.registerOnHover(infobox.show);
            infobox.appendTo($("#" + workflowID).find("." + CSS_CLASS_INFOBOXES));
                        
            svgElements[workflowID].push(svgTaskRectangle);
            if (svgDataAnimation) {
                svgElements[workflowID].push(svgDataAnimation);
            }
        }
        knownTaskIDs[workflowID] = taskIDs;
    }
    
    function refreshTaskLanes(workflow) {
        var workflowID = workflow.getID();
        var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
        var taskLaneID;
        for(var i = taskLaneIDs.length - 1; i >= 0; i--) {
            taskLaneID = taskLaneIDs[i]
            if(knownTaskLaneIDs[workflowID].indexOf(taskLaneID) > -1) {
                continue;
            }
            var svgTaskLaneRectangle = svgs[workflowID].newTaskLaneRectangle(taskLaneID);
            workflow.getTaskLaneByID(taskLaneID).registerObserver(svgTaskLaneRectangle);
            svgElements[workflowID].push(svgTaskLaneRectangle);
        }
        knownTaskLaneIDs[workflowID] = taskLaneIDs;
    }
    
    /**
     * Deaktiviert Animationen
     */
    this.disableAnimations = function(eventChain) {
        svgElements[eventChain.getWorkflow().getID()].forEach(function(svgElement) {
            svgElement.disableAnimations();
        });
        return this;
    };
    /**
     * Aktiviert Animationen
     */
    this.enableAnimations = function(eventChain) {
        svgElements[eventChain.getWorkflow().getID()].forEach(function(svgElement) {
            svgElement.enableAnimations();
        });
        return this;
    };
 
    
    $('.' + CSS_CLASS_SVG).dragscrollable({
         dragSelector: '.dragger:first',
         acceptPropagatedEvent: true
    });
    
    
};

})();
