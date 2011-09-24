
(function() {

var WorkflowClass = WoSec.newWorkflow;


var workflow;
/**
 * Ein kleiner Workaround um die Workflowobjektabhängigkeit
 * Die Factories benötigen jeweils einen Workflow dem das zu erstellende Event zugeordnet wird.
 * Muss immer vor der Benutzung einer Factory aufgerufen werden.
 * @param {Workflow} w der zu verwendende Workflow
 */
function usingWorkflow(w) {
	if (!w instanceof WorkflowClass) {
		throw new TypeError("Given argument is not a workflow [" + w + "]");
	}
	workflow = w;
	return this; // allows method chaining
};

/**
 * Basisklasse für Events unterschiedlichen Typs, bietet Ausführen- und Animiere-Methoden.
 * Speichert einen zugehörigen Zeitstempel.
 * Entwurfsmuster Befehl (Command)
 * Namespace für alle EventCommands
 * @param {Integer} timestamp Zeitstempel
 */
function EventCommand(timestamp) {// interface (and abstract class)
	if (typeof(timestamp) != "number") {
		throw new Error("Timestamp [" + timestamp + "] is not a number");
	}
	this.timestamp = timestamp;
} 
EventCommand.prototype = Object.create(WoSec.baseObject);
EventCommand.prototype.classname = "EventCommand";
/**
 * Gibt den Namen der Klasse zurück.
 * Verwendet für CSS Abhängigkeiten
 * @return {String}
 */
EventCommand.prototype.getClass = function() {
	return this.classname;
}
/**
 * Führt den Befehl aus.
 * @return {EventCommand}
 */
EventCommand.prototype.execute = function() {
	return this;
};
/**
 * Macht den Befehl rückgängig
 */
EventCommand.prototype.unwind = function() {
	return this;
}
/**
 * Gibt den Zeitstempel des Events zurück
 * @return {Integer}
 */
EventCommand.prototype.getTimestamp = function() {
	return this.timestamp;
}
/**
 * Factory Methode zur erstellung eines EventCommands
 * @param {Object} event
 */
EventCommand.create = function(event) {
	return new EventCommand(event.timestamp);
}



/**
 * Beim Starten einer Aktivität delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben, an den zugehörigen Task.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Integer} timestamp Zeitstempel
 */
function StartingTaskEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
    this.information = information;
    this.information.timestamp = timestamp;
}
WoSec.inherit(StartingTaskEvent, EventCommand);
StartingTaskEvent.prototype.classname = "StartingTaskEvent";
/**
 * @see EventCommand.execute
 */
StartingTaskEvent.prototype.execute = function() {
    this.task.setState("Started");
    this.taskMemento = this.task.getMemento();
	this.task.addInformation(this.information);
    var cTask = this.task.getCorrespondingTask();
    if (cTask) {
        this.correspondingTaskMemento = cTask.getMemento();
	    cTask.setState("Started");
	    this.task.getCorrespondingTask().addInformation(this.information);
	}
	return this;
};
/**
 * @see EventCommand.unwind
 */
StartingTaskEvent.prototype.unwind = function() {
    this.task.setMemento(this.taskMemento);
    var cTask = this.task.getCorrespondingTask();
    if (cTask) {
        cTask.setMemento(this.correspondingTaskMemento);
    }
    return this;
}
/**
 * Factory Methode zur Erstellung eines StartingTaskEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 */
StartingTaskEvent.create = function(event) {
	return new StartingTaskEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
};

/**
 * Beim Beenden einer Aktivität delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 *  sich als beendet zu markieren.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function FinishingTaskEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
	this.information.timestamp = timestamp;
}
WoSec.inherit(FinishingTaskEvent, EventCommand);
FinishingTaskEvent.prototype.classname = "FinishingTaskEvent";
/**
 * @see EventCommand.execute
 */
FinishingTaskEvent.prototype.execute = function() {
    this.task.setState("Finished");
    this.taskMemento = this.task.getMemento();
    this.task.addInformation(this.information);
    var cTask = this.task.getCorrespondingTask();
    if (cTask) {
        this.correspondingTaskMemento = cTask.getMemento();
        cTask.setState("Finished");
        this.task.getCorrespondingTask().addInformation(this.information);
    }
    return this;
};
/**
 * @see EventCommand.unwind
 */
FinishingTaskEvent.prototype.unwind = function() {
	this.task.setMemento(this.taskMemento);
	var cTask = this.task.getCorrespondingTask();
	if (cTask) {
	    cTask.setMemento(this.correspondingTaskMemento);
	}
    return this;
}
//FinishingTaskEvent.prototype.fastExecute = function() {}; // NOP
/**
 * Factory Methode zur Erstellung eines FinishingTaskEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
FinishingTaskEvent.create = function(event) {
	return new FinishingTaskEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
}


/**
 * Bei einem Datentransfer delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 * eine Animation zum korrespondierenden Task darzustellen.
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function TransferingDataEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
    this.information.timestamp = timestamp;
}
WoSec.inherit(TransferingDataEvent, EventCommand);
TransferingDataEvent.prototype.classname = "TransferingDataEvent";
/**
 * @see EventCommand.execute
 */
TransferingDataEvent.prototype.execute = function() {
    this.task.setState("TransferingData");
    this.taskMemento = this.task.getMemento();
    this.task.addInformation(this.information);
    var cTask = this.task.getCorrespondingTask();
    if (cTask) {
        this.correspondingTaskMemento = cTask.getMemento();
        this.task.getCorrespondingTask().addInformation(this.information);
    }
    return this;
};
TransferingDataEvent.prototype.unwind = function() {
    this.task.setMemento(this.taskMemento);
    var cTask = this.task.getCorrespondingTask();
    if (cTask) {
        cTask.setMemento(this.correspondingTaskMemento);
    }
    return this;
};
/**
 * Factory Methode zur Erstellung eines TransferingDataEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
TransferingDataEvent.create = function(event) {
	return new TransferingDataEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
}


/**
 * Bei der Festlegung des zugewiesenen Users bzw. Providers delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben und den Participant festzulegen, an die zugehörige TaskLane sich hervorzuheben.
 * @param {TaskLane} taskLane Zugehörige TaskLane
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function SpecifyingParticipantEvent(taskLane, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.taskLane = taskLane;
    this.information = information || {};
    this.information.timestamp = timestamp;
}
WoSec.inherit(SpecifyingParticipantEvent, EventCommand);
SpecifyingParticipantEvent.prototype.classname = "SpecifyingParticipantEvent";
/**
 * @see EventCommand.execute
 */
SpecifyingParticipantEvent.prototype.execute = function() {
    this.taskMementos = this.taskLane.getTasks().map(function(task) {
        return task.getMemento();
    });
    this.taskLane.addInformation(this.information);
	return this;
};
SpecifyingParticipantEvent.prototype.unwind = function() {
    this.taskLane.getTasks().forEach(function(task, i) {
        task.setMemento(this.taskMementos[i]);
    });
    return this;
};

/**
 * Factory Methode zur Erstellung eines SpecifyingParticipantEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityGroupID AktivitätsGruppen ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * @param {Object} event.information.participant ausgewählter Provider oder User
 */
SpecifyingParticipantEvent.create = function(event) {
	return new SpecifyingParticipantEvent(workflow.getTaskLaneByID(event.activityGroupID), event.information, event.timestamp);
}


// exports
WoSec.eventCommands = {
	usingWorkflow: usingWorkflow,
	EventCommand: EventCommand,
	StartingTask: StartingTaskEvent,
	FinishingTask: FinishingTaskEvent,
	TransferingData: TransferingDataEvent,
	SpecifyingParticipant: SpecifyingParticipantEvent
};

}());
