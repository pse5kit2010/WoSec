
(function() {

/**
 * Das Mixin Observable kapselt die Grundfunktionalität
 * für das Beobachter-Muster.
 * Beobachter können registriert und benachrichtigt werden.
 */
WoSec.newObservable = function Observable() {
	var observers = [];
	
	return {
		constructor: Observable,
		/**
		 * Registriert einen Beobachter
		 * @param {Object} observer zu registrierender Beobachter
		 */
		registerObserver: function(observer) {
			if (typeof observer.notify !== "function") {
				throw new Error("Observer has to support notify()-Method");
			}
			observers.push(observer);
			return this;
		},
		/**
		 * Informiert alle Beobachter
		 */
		notifyObservers: function() {
			observers.forEach(function(observer) {
				observer.notify();
			});
			return this;
		}
	};
}

})();
