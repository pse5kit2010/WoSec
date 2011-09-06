
(function() {

var MixinObservable = WoSec.MixinObservable;

/**
 * Ein Tasklane-Objekt ist assoziiert mit einer ActivityGroup des BPMN SVG Diagramms.
 * Es verwaltet das zugehörige SVGRectangle, an das Anweisungen zur Darstellung delegiert werden.
 * @param {SVGRectangle} rectangle
 * @param {Array} activityIDs
 * @return {TaskLane}
 */
WoSec.newTaskLane = function TaskLane(activityIDs, workflow) {
	var that = Object.create(WoSec.baseObject);
	var getTasks = function() {
		var tasks = [];
		activityIDs.forEach(function(activityID, index) { 
            tasks[index] = WoSec.workflow.getTaskByID(activityID);
        });
		return tasks;
	};
	
	that.constructor = TaskLane;
	/**
	 * Fügt allen Tasks in der Lane Informationen hinzu
	 * @param {Object} information
	 * @return {TaskLane} self
	 */
	that.addInformation = function(information) {
		getTasks().forEach(function(task) {
			task.addInformation(information);
		});
		this.notifyObservers();
		return this;
	};
	return MixinObservable.call(that);
}

}());
