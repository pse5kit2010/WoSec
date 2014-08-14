
(function() {

var eventCommands = WoSec.eventCommands
,   EventCommand = eventCommands.EventCommand
,	MixinObservable = WoSec.MixinObservable;


var PLAY_TIME_BETWEEN_EVENTS_MS = 1000;

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
	var playing = false;

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
			/*events.sort(function(e, next) { // potenziell gefährlich
			    e.timestamp - next.timestamp;
			});*/
			this.notifyObservers(this, "add");
			if (!this.isLocked() && currentPosition > 0) {
			    currentPosition++;
			    this.notifyObservers(this, "position");
			}
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
            while (0 <= i && i < events.length) {
				currentPosition = i;
				if (strategy(events[i], i) === false) {
					break;
				}
			    this.notifyObservers(this, "position");
				i += direction;
			}
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
            if (playing) {
                return this;
            }
			if (locked) {
				return this;
			}
			playing = true;
			var after = 0;
			this.seek(function(eventCommand) {
				eventCommand.later(after, "execute");
				after += PLAY_TIME_BETWEEN_EVENTS_MS;
			});
			setTimeout(function() {
			    playing = false;
			}, after);
			// try playing again in case new events came in while it was playing
			this.later(after, "play"); 
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