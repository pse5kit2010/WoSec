
(function() {

// var workflow = WoSec.workflow; need late initializiation because of cross dependency

/**
 * Ein Tasklane-Objekt ist assoziiert mit einer ActivityGroup des BPMN SVG Diagramms.
 * Es verwaltet das zugehörige SVGRectangle, an das Anweisungen zur Darstellung delegiert werden.
 * @param {SVGRectangle} rectangle
 * @param {Array} activityIDs
 * @return {TaskLane}
 */
function newTaskLane(rectangle, activityIDs) {
	var that = Object.create(WoSec.baseObject);
	var getTasks = function() {
		var tasks = [];
		activityIDs.forEach(function(activityID, index) { 
            tasks[index] = WoSec.workflow.getTaskByID(activityID);
        });
		return tasks;
	};
	
	/**
	 * @see SVGRectangle.highlight
	 * @return {TaskLane} self
	 */
	that.highlight = rectangle.highlight;
	/**
	 * Setzt Informationen für alle Task in der Lane
	 * @param {Object} information
	 * @return {TaskLane} self
	 */
	that.setInformation = function(information) {
		getTasks().forEach(function(task) {
			task.setInformation(information);
		});
		return this;
	};
	return that;
}

WoSec.newTaskLane = newTaskLane;

}());
