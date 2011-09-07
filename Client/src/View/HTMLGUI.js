
(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

/**
 * Kontrolliert das Interface
 */
WoSec.HTMLGUI = function HTMLGUI() {
    
    var svg = new SVG("instancesvg");
    
    var lastKnownTaskID;
    var lastKnownTaskLaneID;
 
    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Workflow} workflow beobachteter Workflow
     */
    this.refresh = function(workflow) {
        var taskIDs = workflow.getTaskRepositoryEntries();
        var taskID;
        for(var i = taskIDs.length - 1; i >= 0; i--) {
            taskID = taskIDs[i]
            if(lastKnownTaskID == taskID) {
                break;
            }
            var task = workflow.getTaskByID(taskID);
            var svgRectangle = svg.newTaskRectangle(taskID);
            task.registerObserver(svgRectangle);
            if(task.getCorrespondingTask()) {
                task.registerObserver(svg.newDataAnimation(taskID, svgRectangle.getPosition().getCenter(), svg.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter()));
            }
            task.registerObserver(this.newInfobox(svgRectangle.getPosition()));
        }
        lastKnownTaskID = taskID;

        var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
        var taskLaneID;
        for(var i = taskLaneIDs.length - 1; i >= 0; i--) {
            taskID = taskLaneIDs[i]
            if(lastKnownTaskLaneID == taskLaneID) {
                break;
            }
            workflow.getTaskLaneByID(taskLaneID).registerObserver(svg.newTaskLaneRectangle(taskLaneID));
        }
        lastKnownTaskLaneID = taskLaneID;
        return this;
    }
};

})();
