
// verarbeitetes Datenformat:
eventTypes = ["EventCommand", "StartingTask", "FinishingTask", "SpecifyingParticipant", "TransferingData"]
json = [
    {
        "eventCommand": eventTypes[i],
        "timestamp": unixtimestamp,
        "activityID": bpmnTaskID,
        "activityGroupID": bpmnTaskLaneID,
        "information": {
            "data": dataString,
            "participants": {
                "provider": providerName,
                "execUser": ausführenderBenutzerName,
                "evokUser": herbeiführenderBenutzerName
            },
            "attachments": [
                {
                    "link": linkZumAnhang,
                    "name": nameDesAnhangs,
                    "type": typDesAnhangs
                },
                // ...
            ],
            "fromTask": taskID,
            "fromWorkflow": workflowID,
            "usageReason": auftrittsGrund
        }
    },
    // ...
]
// information ist optional