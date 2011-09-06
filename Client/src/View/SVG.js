
(function() {
	
var $ = jQuery;






/**
 * SVG beobachtet einen Workflow und erstellt zu jedem Task(Lane)
 * korrespondierende SVG Elemente.
 */
WoSec.SVG = function SVG(id) {
	
    var $svg = $("#" + id);
    var lastKnownTaskID;
    var lastKnownTaskLaneID;
    
    var taskRectangleRepository = {};
    
    return {
        /**
         * Benachrichtige-Methode des Beobachter Musters
         * @param {Workflow} workflow beobachteter Workflow
         */
        notify: function(workflow) {
            var taskIDs = workflow.getTaskRepositoryEntries();
            var taskID;
            for (var i = taskIDs.length-1; i >= 0; i--) {
                taskID = taskIDs[i]
                if (lastKnownTaskID == taskID) {
                    break;
                }
                var task = workflow.getTaskByID(taskID);
                var rectangle = this.newTaskRectangle(taskID);
                task.registerObserver(rectangle);
                task.registerObserver(thistory.newDataAnimation(taskID, rectangle.getPosition().getCenter(), 
                    this.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter()));
                
            }
            lastKnownTaskID = taskID;
            
            var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
            var taskLaneID;
            for (var i = taskLaneIDs.length-1; i >= 0; i--) {
                taskID = taskLaneIDs[i]
                if (lastKnownTaskLaneID == taskLaneID) {
                    break;
                }
                workflow.getTaskLaneByID(taskLaneID).registerObserver(this.newTaskLaneRectangle(taskLaneID));
            }
            lastKnownTaskLaneID = taskLaneID;
            return this;
        },
		
        
		
		
    };

}

}());
