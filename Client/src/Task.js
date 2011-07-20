
(function() {
    
// var workflow = WoSec.workflow; need late initializiation because of cross dependency

/**
 * Ein Task-Objekt ist assoziiert mit einer Aktivität des BPMN SVG Diagramms.
 * Es verwaltet die zugehörige Infobox und das SVGRectangle,
 * an die Anweisungen zur Darstellung delegiert werden.
 * @param {Infobox} infobox
 * @param {SVGRectangle} rectangle
 * @param {String} correspondingActivityID
 * @return {Task} neues Task-Objekt
 */
function newTask(infobox, rectangle, correspondingActivityID) {
    var that = Object.create(WoSec.baseObject);
	infobox.bindToSVGRectangle(rectangle);
	
	/**
	 * @see Infobox.show
	 * @return {Task} self
	 */
    that.showInfobox = infobox.show;
	/**
	 * @see Infobox.hide
	 * @return {Task} self
	 */
    that.hideInfobox = infobox.hide;
	/**
	 * Gibt den korrespondierenden Task zurück
	 * @return {Task} korrespondierender Task
	 */
	that.getCorrespondingTask = function() {
        return typeof(correspondingActivityID) == "string" && correspondingActivityID != "" && WoSec.workflow.getTaskByID(correspondingActivityID); // lazy load
    };
	/**
	 * @see SVGRectangle.highlight
	 * @return {Task} self
	 */
    that.highlight = rectangle.highlight;
	/**
	 * @see Infobox.setContent
	 * @return {Task} self
	 */
    that.setInformation = infobox.setContent;
	
	/**
	 * @see SVGRectangle.getPosition
	 */
	that.getPosition = rectangle.getPosition;
	
	/**
	 * @see SVGRectangle.showAnimation
	 * @return {Task} self
	 */
	that.animateData = function(){
		this.getCorrespondingTask() && rectangle.showAnimation(this.getCorrespondingTask());
		return this;
	}
	/**
	 * @see SVGRectangle.markObtrusive
	 * @return {Task} self
	 */
    that.markActive = rectangle.markObtrusive;
	/**
	 * @see SVGRectangle.markUnobtrusive
	 * @return {Task} self
	 */
    that.markFinished = rectangle.markUnobtrusive;
	
	/**
	 * @see SVGRectangle.reset
	 * @return {Task} self
	 */
	that.reset = rectangle.reset;
	
	return that;
}

WoSec.newTask = newTask;

}());


/*
 * Another version of Task without powerConstructor
 */
/*(function() {

// import
var workflow = WoSec.workflow;

function Task(htmlInfobox, svgRectangle, correspondingActivityID) {
    this.infobox = htmlInfobox;
    this.rectangle = svgRectangle;
    this.correspondingActivityID = correspondingActivityID;
}
Task.prototype.highlight = function() {
    this.rectangle.highlight();
};
Task.prototype.getInfobox = function() {
    return this.infobox;
};
Task.prototype.setParticipant = function(participant) {
    this.infobox.setParticipant(participant);
};
Task.prototype.getCorrespondingTask = function() {
    return workflow.getTaskByID(this.correspondingActivityID); // lazy load
};
Task.prototype.markActive = function() {
    this.rectangle.markObtrusive();
};

Task.prototype.markFinished = function() {
    this.rectangle.markUnobtrusive();
};



// export
WoSec.Task = Task;

}());*/
