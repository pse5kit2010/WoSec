
/**
 * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).
 * Empfangene Eventdaten werden an die EventChain weitergegeben.
 */
WoSec.ajaxUpdater = (function() {
	const DELAY_BETWEEN_POLLS = 5000
	,	  POLL_URL = "UpdateController?type=Event";
	
	var $ = jQuery;
    var eventChain = WoSec.eventChain;
	var workflow = WoSec.workflow;
	
    return {
		/**
		 * Startet den Abfrageprozess.
		 */
        init: function (lastVisitedTimestamp) {
			var times = 0;
            lastVisitedTimestamp = lastVisitedTimestamp || 0;
			function ajax(callback) {
				$.getJSON(POLL_URL, {since: eventChain.last().getTimestamp() + 1, instance: workflow.getInstanceID()}, callback);
			}
			ajax(function(data) { 
				if (data.length != 0) {
					eventChain.add(data).seek(function(eventCommand) {
						return eventCommand.getTimestamp() <= lastVisitedTimestamp && eventCommand.execute(); // seek forward until the timestamp is newer than the lastVisited
					}).play();
				}
			});
			var playAndAddLoop = function(data) {
				if (data.length != 0) {
					eventChain.add(data).play();
				}
				setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
			}
			setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
            $("body").ajaxError(function(){
                times++;
                if (times >= 3) {
                    alert("Verbindung zum Server verloren!");
                } else {
                    setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
                }
            });
		}
    };
}());
