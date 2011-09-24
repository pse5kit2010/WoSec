
(function() {

var MixinObservable = WoSec.MixinObservable;

var states = ["Reset", "Starting", "Started", "Finished", "TransferingData"];
/**
 * Ein Task-Objekt ist assoziiert mit einer Aktivität des BPMN SVG Diagramms.
 * Es verwaltet die zugehörige Infobox und das SVGRectangle,
 * an die Anweisungen zur Darstellung delegiert werden.
 * @param {String} id ID des Tasks
 * @param {String} correspondingActivityID ID des korrespondierenden Tasks
 * @param {Workflow} workflow zugehöriger Workflow
 * @return {Task} neues Task-Objekt
 */
WoSec.newTask = function Task(id, correspondingActivityID, workflow) {
    var that = Object.create(WoSec.baseObject);
    MixinObservable.call(that);
	var state = "Reset";
	var information = [];
	
	that.constructor = Task;
	
	/**
	 * Gibt die ID des Tasks zurück
	 */
	that.getID = function() {
		return id;
	};
	
	/**
	 * Gibt den zugehörigen Workflow zurück
	 * @return {Workflow}
	 */
	that.getWorkflow = function() {
	    return workflow;
	};
	
	/**
	 * Gibt den korrespondierenden Task zurück
	 * @return {Task} korrespondierender Task
	 */
	that.getCorrespondingTask = function() {
        return (typeof(correspondingActivityID) == "string" && correspondingActivityID != "")
        	? workflow.getTaskByID(correspondingActivityID)
        	: null;
    };
    
    /**
     * Gibt den Zustand des Tasks zurück
     * @return {String} Zustand
     */
    that.getState = function() {
    	return state;
    };
    
    /**
     * Gibt die gespeicherten Informationen zurück
     * @return {Object} Informationen
     */
    that.getInformation = function() {
        return information;
    }
    
	/**
	 * Fügt dem Task Informationen hinzu
	 * @param {Object} i Informationen
	 */
    that.addInformation = function(i) {
    	information.push(i);
        this.notifyObservers(this);
    	return this;
    };
    
	/**
	 * Setzt den Zustand des Tasks
	 * @param {String} newState neuer Zustand
	 */
	that.setState = function(newState) {
		if (states.indexOf(newState) == -1) {
			throw new Error("Unknown state [" + newState + "] given");
		}
		state = newState;
		this.notifyObservers(this);
		return this;
	};
	
	that.getMemento = function() {
	    return {
	        state: state,
	        information: information
	    };
	}
	
	that.setMemento = function(m) {
	    this.setState(m.state);
	    information = m.information;
	    this.notifyObservers(this);
	    return this;
	}
	
	
	return that;
}

}());