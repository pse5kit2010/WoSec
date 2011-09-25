
/**
 * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).
 * Empfangene Eventdaten werden an die EventChain weitergegeben.
 */
WoSec.AJAXUpdater = function AJAXUpdater(eventChain) {
	var DELAY_BETWEEN_POLLS = 5000;
	var POLL_URL = "UpdateController?type=Event";
	
	//var $ = jQuery;
	var $ = {
	    getJSON: function(mock, it, callback) {
		callback(
[{
    "timestamp": 1316877284,
    "eventCommand": "EventCommand",
    "information": {}
}, {
    "timestamp": 1316877470,
    "eventCommand": "FinishingTask",
    "information": {},
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "__fX4gedbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1316877497,
    "eventCommand": "FinishingTask",
    "information": {},
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_ggEwYYBxEd-3VeNHLWdQXA"
}, {
    "timestamp": 1316877502,
    "eventCommand": "SpecifyingParticipant",
    "information": {},
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityGroupID": "_7kTKEOdbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1316877509,
    "eventCommand": "SpecifyingParticipant",
    "information": {
        "participant": "DB01",
        "participants": {
            "provider": "DB01"
        }
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityGroupID": "_1UFV4ItpEd-U-Z7QjvIBEA"
}, {
    "timestamp": 1316877514,
    "eventCommand": "StartingTask",
    "information": {},
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1316878340,
    "eventCommand": "TransferingData",
    "information": {
        "data": "UserID: _sDfw47sd33saeF",
        "participant": "DB01",
        "participants": {
            "provider": "DB01"
        },
        "usageReason": ""
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1316878356,
    "eventCommand": "TransferingData",
    "information": {
        "data": "",
        "participant": "DB01",
        "participants": {
            "provider": "DB01"
        },
        "usageReason": ""
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_mJVSMNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1316878365,
    "eventCommand": "FinishingTask",
    "information": {
        "participant": "DB01",
        "participants": {
            "provider": "DB01"
        }
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1316878367,
    "eventCommand": "StartingTask",
    "information": {},
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_WwJSsMpEEd-l67V0iNGzSg"
}, {
    "timestamp": 1316878377,
    "eventCommand": "TransferingData",
    "information": {
        "data": "",
        "usageReason": ""
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_WwJSsMpEEd-l67V0iNGzSg"
}, {
    "timestamp": 1316878402,
    "eventCommand": "TransferingData",
    "information": {
        "data": "Registrierungsdaten: murat",
        "usageReason": ""
    },
    "workflowID": "_BCoSEIBxEd-3VeNHLWdQXA",
    "activityID": "_EdDTcOdcEd-f6JWMxJDGcQ"
}]);
	    }
	};//*/
	
    
		$.getJSON(POLL_URL, {since: eventChain.last().getTimestamp(), instance: eventChain.getWorkflow().getID()}, function(data) {
			eventChain.add(data).play();
		});
		//setTimeout(loop, DELAY_BETWEEN_POLLS);
	
};
