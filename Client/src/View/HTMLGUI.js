
(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

/**
 * Kontrolliert das Interface
 */
WoSec.HTMLGUI = function HTMLGUI() {
    
    var svg = new SVG("instancesvg");
    
    var knownTaskIDs = [];
    var knownTaskLaneIDs = [];
 
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
            var svgRectangle = svg.newTaskRectangle(taskID);
            task.registerObserver(svgRectangle);
            if(task.getCorrespondingTask()) {
                task.registerObserver(svg.newDataAnimation(taskID, svgRectangle.getPosition().getCenter(), svg.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter()));
            }
            task.registerObserver(this.newInfobox(svgRectangle.getPosition()));
        }
        knownTaskIDs = taskIDs;

        var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
        var taskLaneID;
        for(var i = taskLaneIDs.length - 1; i >= 0; i--) {
            taskLaneID = taskLaneIDs[i]
            if(knownTaskLaneIDs.indexOf(taskLaneID) > -1) {
                continue;
            }
            workflow.getTaskLaneByID(taskLaneID).registerObserver(svg.newTaskLaneRectangle(taskLaneID));
        }
        knownTaskLaneIDs = taskLaneIDs;
        return this;
    }
};

})();
