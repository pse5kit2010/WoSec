
/**
 * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).
 * Empfangene Eventdaten werden an die EventChain weitergegeben.
 */
WoSec.ajaxUpdater = (function() {
	var DELAY_BETWEEN_POLLS = 5000;
	var POLL_URL = "UpdateController?type=Event";
	
	//var $ = jQuery;
	var $ = {
	    getJSON: function(mock, it, callback) {
		callback([
			    { // 2.
			       "eventCommand": "FinishingTask",
			       "activityID": "__fX4gedbEd-f6JWMxJDGcQ",
			       "timestamp": 1290076190,
				   "information": {
				   	"participant": "Alice"
				   }
			    },
			    { // 3.
			       "eventCommand": "FinishingTask",
			       "activityID": "_ggEwYYBxEd-3VeNHLWdQXA",
			       "timestamp": 1290076195,
				   "information": {
				   	"participant": "Alice"
				   }
			    },
			    { // 4.
			       "eventCommand": "SpecifyingParticipant",
			       "activityGroupID": "_7kTKEOdbEd-f6JWMxJDGcQ",
			       "timestamp": 1290076210,
				   "information": {
				   	"participant": "Alice"
				   }
			    },
			    { // 5.
			       "eventCommand": "SpecifyingParticipant",
			       "activityGroupID": "_1UFV4ItpEd-U-Z7QjvIBEA",
			       "timestamp": 1290076220,
				   "information": {
				   	"participant": "DB01"
				   }
			    },
			    { // 6.
			       "eventCommand": "StartingTask",
			       "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA",
			       "timestamp": 1290076230
			    },
			    { // 7.
			       "eventCommand": "TransferingData",
			       "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA",
			       "timestamp": 1290076260,
				   "information": {
				   	"data": "UserID: _sDfw47sd33saeF"
				   }
			    },
			    { // 8.
			       "eventCommand": "TransferingData",
			       "activityID": "_mJVSMNq2Ed-AhcDaNoYiNA",
			       "timestamp": 1290076290,
				   "information": {
				   	"data": ""
				   }
			    }
			    // ...
			]);
	    }
	};//*/
	
    return {
		/**
		 * Startet den Abfrageprozess.
		 */
        init: function loop(eventChain) {
		$.getJSON(POLL_URL, {since: eventChain.last().getTimestamp(), instance: eventChain.getWorkflow().getInstanceID()}, function(data) {
			eventChain.add(data).play();
		});
		//setTimeout(loop, DELAY_BETWEEN_POLLS);
	}
    };
}());
