
(function() {

var workflow = WoSec.workflow;

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
 * Führt die Animation des Befehls aus.
 * @return {EventCommand}
 */
EventCommand.prototype.animate = function() {
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


// weiß nicht so recht hier... gibt verschiedene Möglichkeiten das umzusetzen. Ich denke mal das der klassische Ansatz der einfachste ist...
// WoSec.inherit ermöglicht jedenfalls die Nutzung des instanceof Operators

/**
 * Abstrakte Klasse. Abstrahiert HighlightingEvent und MarkFinishedEvent,
 * die beide eine Statusänderung eines Tasks darstellen.
 * @augments EventCommand
 */
function StateChangingEvent() {}
WoSec.inherit(StateChangingEvent, EventCommand);

/**
 * Beim Starten einer Aktivität delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben, an den zugehörigen Task.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Integer} timestamp Zeitstempel
 */
function HighlightingEvent(task, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
}
WoSec.inherit(HighlightingEvent, StateChangingEvent);
HighlightingEvent.prototype.classname = "HighlightingEvent";
/**
 * @see EventCommand.execute
 */
HighlightingEvent.prototype.execute = function() {
    this.task.markActive();
	this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markActive();
	return this;
};
HighlightingEvent.prototype.unwind = function() {
	this.task.reset();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().reset();
	return this;
}
/**
 * @see EventCommand.animate
 */
HighlightingEvent.prototype.animate = function() {
    this.task.highlight();
	this.task.getCorrespondingTask() && this.task.getCorrespondingTask().highlight();
	return this;
};
/**
 * Factory Methode zur Erstellung eines HighlightingEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 */
HighlightingEvent.create = function(event) {
	return new HighlightingEvent(workflow.getTaskByID(event.activityID), event.timestamp);
};

/**
 * Beim Beenden einer Aktivität delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 *  sich als beendet zu markieren.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function MarkFinishedEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
}
WoSec.inherit(MarkFinishedEvent, StateChangingEvent);
MarkFinishedEvent.prototype.classname = "MarkFinishedEvent";
/**
 * @see EventCommand.execute
 */
MarkFinishedEvent.prototype.execute = function() {
    this.task.markFinished();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markFinished();
	this.task.setInformation(this.information);
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setInformation(this.information);
	return this;
};
MarkFinishedEvent.prototype.unwind = function() {
	this.task.markActive();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markActive();
	return this;
}
//MarkFinishedEvent.prototype.animate = function() {}; // NOP
/**
 * Factory Methode zur Erstellung eines MarkFinishedEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
MarkFinishedEvent.create = function(event) {
	return new MarkFinishedEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
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
}
WoSec.inherit(TransferingDataEvent, EventCommand);
TransferingDataEvent.prototype.classname = "TransferingDataEvent";
/**
 * @see EventCommand.execute
 */
TransferingDataEvent.prototype.execute = function() {
    this.task.setInformation(this.information);
	return this;
};
// TransferingDataEvent.prototype.unwind = function() {} // NOP
/**
 * @see EventCommand.animate
 */
TransferingDataEvent.prototype.animate = function() {
    this.task.animateData();
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
}
WoSec.inherit(SpecifyingParticipantEvent, EventCommand);
SpecifyingParticipantEvent.prototype.classname = "SpecifyingParticipantEvent";
/**
 * @see EventCommand.execute
 */
SpecifyingParticipantEvent.prototype.execute = function() {
    this.taskLane.setInformation(this.information);
	return this;
};
// SpecifyingParticipantEvent.prototype.unwind = function() {} // NOP
/**
 * @see EventCommand.animate
 */
SpecifyingParticipantEvent.prototype.animate = function() {
    this.taskLane.highlight();
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
EventCommand.EventCommand = EventCommand;
EventCommand.StateChanging = StateChangingEvent;
EventCommand.Highlighting = HighlightingEvent;
EventCommand.MarkFinished = MarkFinishedEvent;
EventCommand.TransferingData = TransferingDataEvent;
EventCommand.SpecifyingParticipant = SpecifyingParticipantEvent;

WoSec.EventCommand = EventCommand;

}());
