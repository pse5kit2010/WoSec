(function() {

/**
 * Das Mixin Observable kapselt die Grundfunktionalität
 * für das Beobachter-Muster.
 * Beobachter können registriert und benachrichtigt werden.
 */
WoSec.MixinObservable = function Observable() {
    var observers = [];

    /**
     * Registriert einen Beobachter
     * @param {Object} observer zu registrierender Beobachter
     */
    this.registerObserver = function(observer) {
        if( typeof observer.refresh !== "function") {
            throw new Error("Observer has to support refresh()-Method");
        }
        observers.push(observer);
        return this;
    };
    /**
     * Informiert alle Beobachter
     * Argumente werden übergeben
     */
    this.notifyObservers = function() {
        var args = Array.prototype.slice.call(arguments);
        observers.forEach(function(observer) {
            observer.refresh.apply(observer, args);
        });
        return this;
    };
};

})();
