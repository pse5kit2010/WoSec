
(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

const CSS_ID_INFOBOXES = "infoboxes";


/**
 * Kontrolliert das Interface
 */
WoSec.HTMLGUI = function HTMLGUI(eventChain) {
    
    var svg = new SVG("instancesvg");
    var svgElements = [];
    
    var knownTaskIDs = [];
    var knownTaskLaneIDs = [];
    
    
    
    /**
     * Deaktiviert Animationen
     */
    this.disableAnimations = function() {
        svgElements.forEach(function(svgElement) {
            svgElement.disableAnimations();
        });
        return this;
    };
    /**
     * Aktiviert Animationen
     */
    this.enableAnimations = function() {
        svgElements.forEach(function(svgElement) {
            svgElement.enableAnimations();
        });
        return this;
    };
 
    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Workflow} workflow beobachteter Workflow
     */
    this.refresh = function(workflow) {
        var taskIDs = workflow.getTaskRepositoryEntries();
        var taskID;
        for(var i = taskIDs.length - 1; i >= 0; i--) {
            var taskID = taskIDs[i];
            if(knownTaskIDs.indexOf(taskID) > -1) {
                continue;
            }
            var task = workflow.getTaskByID(taskID);
            var svgTaskRectangle = svg.newTaskRectangle(taskID);
            task.registerObserver(svgTaskRectangle);
            var svgDataAnimation;
            if(task.getCorrespondingTask()) {
                svgDataAnimation = svg.newDataAnimation(taskID, svgTaskRectangle.getPosition().getCenter(), svg.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter());
                task.registerObserver(svgDataAnimation);
            }
            var infobox = this.newInfobox(svgTaskRectangle.getPosition())
            task.registerObserver(infobox);
            svgTaskRectangle.registerOnHover(infobox.show);
            infobox.registerOnHover(infobox.pin, infobox.unpin);
            infobox.appendTo("#" + CSS_ID_INFOBOXES);
                        
            svgElements.push(svgTaskRectangle);
            if (svgDataAnimation) {
                svgElements.push(svgDataAnimation);
            }
        }
        knownTaskIDs = taskIDs;

        var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
        var taskLaneID;
        for(var i = taskLaneIDs.length - 1; i >= 0; i--) {
            taskLaneID = taskLaneIDs[i]
            if(knownTaskLaneIDs.indexOf(taskLaneID) > -1) {
                continue;
            }
            var svgTaskLaneRectangle = svg.newTaskLaneRectangle(taskLaneID);
            workflow.getTaskLaneByID(taskLaneID).registerObserver(svgTaskLaneRectangle);
            svgElements.push(svgTaskLaneRectangle);
        }
        knownTaskLaneIDs = taskLaneIDs;
        return this;
    }
    
    
    var timeSlider = this.newTimeSlider(this, eventChain);
    eventChain.registerObserver(timeSlider);
    
    eventChain.getWorkflow().registerObserver(this);
};

})();
