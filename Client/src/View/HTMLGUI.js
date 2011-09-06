
(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

/**
 * Singleton (UtilityKlasse),
 * das Funktionalität zur Verwaltung von HTML-Elementen bereitstellt; erstellt Infoboxen.
 */
WoSec.HTMLGUI = function HTMLGUI() {
    
    var svg = new SVG();
    
    var lastKnownTaskID;
    var lastKnownTaskLaneID;
 
    return {
        /**
         * Aktualisiere-Methode des Beobachter Musters
         * @param {Workflow} workflow beobachteter Workflow
         */
        refresh: function(workflow) {
            var taskIDs = workflow.getTaskRepositoryEntries();
            var taskID;
            for (var i = taskIDs.length-1; i >= 0; i--) {
                taskID = taskIDs[i]
                if (lastKnownTaskID == taskID) {
                    break;
                }
                var task = workflow.getTaskByID(taskID);
                var svgRectangle = svg.newTaskRectangle(taskID);
                task.registerObserver(svgRectangle);
                task.registerObserver(svg.newDataAnimation(taskID, svgRectangle.getPosition().getCenter(), 
                    svg.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter()));
                task.registerObserver(this.newInfobox(svgRectangle.getPosition()));
                
            }
            lastKnownTaskID = taskID;
            
            var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
            var taskLaneID;
            for (var i = taskLaneIDs.length-1; i >= 0; i--) {
                taskID = taskLaneIDs[i]
                if (lastKnownTaskLaneID == taskLaneID) {
                    break;
                }
                workflow.getTaskLaneByID(taskLaneID).registerObserver(svg.newTaskLaneRectangle(taskLaneID));
            }
            lastKnownTaskLaneID = taskLaneID;
            return this;
        }
    };
};

})();
