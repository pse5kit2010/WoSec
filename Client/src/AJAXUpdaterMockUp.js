
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
		callback([{
    "timestamp": 1314317905,
    "eventCommand": "EventCommand",
    "information": {},
    "eventType": "createInstance"
}, {
    "timestamp": 1314373858,
    "eventCommand": "FinishingTask",
    "information": {},
    "eventType": "humanActivityExecuted",
    "activityID": "__fX4gedbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1314373863,
    "eventCommand": "FinishingTask",
    "information": {},
    "eventType": "eventActivityExecuted",
    "activityID": "_ggEwYYBxEd-3VeNHLWdQXA"
}, {
    "timestamp": 1314373864,
    "eventCommand": "SpecifyingParticipant",
    "information": {},
    "eventType": "HumanTaskExecutorSelected",
    "activityGroupID": "_7kTKEOdbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1314373864,
    "eventCommand": "SpecifyingParticipant",
    "information": {
        "participants": {
            "provider": "DB01"
        }
    },
    "eventType": "WSProviderSelected",
    "activityGroupID": "_1UFV4ItpEd-U-Z7QjvIBEA"
}, {
    "timestamp": 1314373865,
    "eventCommand": "TransferingData",
    "information": {
        "data": "UserID: _sDfw47sd33saeF",
        "participants": {
            "provider": "DB01"
        },
        "usageReason": ""
    },
    "eventType": "DataTransferredToWS",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373865,
    "eventCommand": "StartingTask",
    "information": {},
    "eventType": "startActivityExecution",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373866,
    "eventCommand": "TransferingData",
    "information": {
        "data": "",
        "participants": {
            "provider": "DB01"
        },
        "usageReason": "an die Datenbank geschickt, weil deshalb",
        "attachments": [
            {
                "link": "http://blabla",
                "name": "Anschreiben",
                "type": "Word-Dokument"
            }, {
                "link": "http://blablub",
                "name": "Ausschreibung",
                "type": "PDF-Datei"
            }
        ]
    },
    "eventType": "DataTransferredFromWS",
    "activityID": "_mJVSMNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373867,
    "eventCommand": "FinishingTask",
    "information": {
        "participants": {
            "provider": "DB01"
        }
    },
    "eventType": "WSActivityExecuted",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}]);
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
