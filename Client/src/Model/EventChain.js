
(function() {

var eventCommands = WoSec.eventCommands
,   EventCommand = eventCommands.EventCommand
,	MixinObservable = WoSec.MixinObservable;


const PLAY_TIME_BETWEEN_EVENTS_MS = 750;

/**
 * Klasse zur Verwaltung einer Liste von EventCommands
 * und eines Zeigers zur momentanen (zeitlichen) Position der Events
 * @constructor
 * @param {Workflow} workflow zugehöriger Workflow
 */
WoSec.newEventChain = function EventChain(workflow) {
    
	var events = [];
	var currentPosition = 0;
	var locked = false;

    var that = Object.create(WoSec.baseObject)
    MixinObservable.call(that);
    return WoSec.extend(that, {
        constructor: EventChain,
        /**
         * Gibt den zugehörigen Workflow zurück
         * @return {Workflow}
         */
        getWorkflow: function() {
        	return workflow;
        },
		/**
		 * Gibt die momentane Position in der EventChain zurück
		 * @return {Integer} momentane Position
		 */
		getCurrentPosition: function() {
			return currentPosition;
		},
		/**
		 * Gibt das EventCommand Objekt an der gegeben Position zurück
		 * @param {Number} position
		 * @return {EventCommand}
		 */
		getEventCommand: function(position) {
			return events[position];
		},
		/**
		 * Gibt die Länge der EventChain, also die Anzahl der enthaltenen EventCommands zurück
		 * @return {Number}
		 */
		getLength: function() {
			return events.length;
		},
		/**
		 * Sperrt die EventChain, verhindert abspielen
		 * @return {EventChain} self
		 */
		lock: function() {
			locked = true;
			return this;
		},
		/**
		 * Entsperrt die EventChain, verhindert erlaubt abspielen
		 * @return {EventChain} self
		 */
		unlock: function() {
			locked = false;
			return this;
		},
		/**
		 * Gibt true zurück wenn die EventChain gesperrt ist
		 * @returm {Boolean}
		 */
		isLocked: function() {
			return locked;
		},
		/**
		 * Verarbeitet JSON Daten, erstellt neue EventCommands und fügt sie dem Repository hinzu.
		 * @memberOf EventChain
		 * @param {Array} data JSON daten
		 * @return {EventChain} self
		 */
        add: function(data) {
			data = data || [];
            data.forEach(function(event) {
				if (!eventCommands[event.eventCommand]) {
					throw new Error("Unknown EventCommand: " + event.eventCommand);
				}
				events.push(eventCommands.usingWorkflow(workflow)[event.eventCommand].create(event)); // factory method
			});
			this.notifyObservers(this);
			return this;
        },
		/**
		 * Iteriert über Events und übergibt das jeweilige EventCommand an die übergebene Strategie.
		 * Hält an wenn die Strategie false zurückgibt
		 * Informiert die Beobachter
		 * @memberOf EventChain
		 * @param {Function} strategy Strategie zur Iteration
		 * @param {Boolean} [backwards] true um die Kette rückwärts zu durchlaufen
		 * @return {EventChain} self
		 */
        seek: function(strategy, backwards) {
            var direction = backwards ? -1 : 1;
			var i = currentPosition;
			if (i == events.length) { // in case we are at the end of the chain
				i--;
			}
            while (0 <= i && i < events.length) {
				currentPosition = i;
				if (strategy(events[i], i) === false) {
					break;
				}
				i += direction
			}
			this.notifyObservers(this);
			return this;
        },
		/**
		 * Iteriert über alle Events
		 * @see Array.prototype.forEach
		 */
		forEach: events.forEach.bind(events),
		/**
		 * Iteriert über Events in einer angenehmen Geschwindigkeit und führt die EventCommands aus.
		 * @memberOf EventChain
		 * @return {EventChain} self
		 */
        play: function() {
			if (locked) {
				return this;
			}
			var after = 0;
			this.seek(function(eventCommand){
				eventCommand.later(after, "execute")
							.later(after, "animate");
				after += PLAY_TIME_BETWEEN_EVENTS_MS;
			});
			setTimeout(function(){
				currentPosition = events.length;
			}, after);
			return this;
        },
		/**
		 * Gibt das letzte EventCommand in der Kette zurück,
		 * falls die Kette leer ist, wird ein EventCommand mit Zeitstempel 0 zurückgegeben
		 * @memberOf EventChain
		 * @return {EventCommand} das letzte EventCommand in der Kette
		 */
		last: function() {
			if (events[events.length - 1]) { // if last event exists return it
				return events[events.length - 1];
			} else {
				return new EventCommand(0); // else mock an event with timestamp zero for the ajaxUpdater
			}
		}
    });
};

}());