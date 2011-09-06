
(function() {    
	
// import
var newTask = WoSec.newTask
,	newTaskLane = WoSec.newTaskLane
,	htmlRenderer = WoSec.htmlRenderer
,	svgUtility = WoSec.svgUtility
,	MixinObservable = WoSec.MixinObservable;
/**
 * Die Klasse Workflow stellt Methoden 
 * zum Finden und Erstellen von Tasks (Tasklanes) bereit.
 * Sie speichert ein Task Repository.
 * 
 * Initialisiert den Workflow mit den korrespondierenden Tasks und Tasks in einer TaskLane
 * @param {String} instanceID InstanzID
 * @param {Object} correspondingActivityIDs korrespondierende Tasks ID => ID
 * @param {Object} activityIDsForALane Tasks in einer TaskLane TaskLaneID => [TaskIDs]
 */
WoSec.newWorkflow = function Workflow(instanceID, correspondingActivityIDs, activityIDsForALane) {
	if (typeof(instanceID) != "string") {
		throw new TypeError("The given instanceID is not a String");
	}

	
    var taskRepository = {}; // ID => Task
    var taskLaneRepository = {}; // ID => TaskLane
	
    function createTask(activityID) {
		if (typeof(activityID) != "string") {
			throw new TypeError("The given activityID is not a String");
		}
        return newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle(activityID), correspondingActivityIDs[activityID]);
    }
    function createTaskLane(activityGroupID) {
		if (typeof(activityGroupID) != "string") {
			throw new TypeError("The given groupID is not a String");
		}
		if (!activitiesInALane[activityGroupID]) {
			throw new Error("Unknown activityGroupID");
		}
        return newTaskLane(svgUtility.getTaskLaneRectangle(activityGroupID), activityIDsForALane[activityGroupID]);
    }
    return WoSec.extend(MixinObservable.call(Object.create(WoSec.baseObject)), {
        constructor: Workflow,
		/**
		 * Gibt die InstanzID des Workflows zurück
		 * @return InstanzID
		 */
		getInstanceID: function() {
			return instanceID;
		},
		/**
		 * Liefert den Task mit der angegebenen ID zurück
		 * @param {String} activityID
		 * @return {Task} Task ggf. aus Repository
		 */
        getTaskByID: function(activityID) {
			if (!taskRepository[activityID]) {
				taskRepository[activityID] = createTask(activityID);
				this.notifyObservers(this);
			}
            return taskRepository[activityID];
        },
		/**
		 * Liefert die Lane mit der angegebenen ID zurück
		 * @param {String} activityGroupID
		 * @return {TaskLane} TaskLane ggf. aus Repository
		 */
        getTaskLaneByID: function(activityGroupID) {
			if (!taskLaneRepository[activityGroupID]) {
				taskLaneRepository[activityGroupID] = createTaskLane(activityGroupID);
				this.notifyObservers(this);
			}
            return taskLaneRepository[activityGroupID];
        },
        getTaskRepositoryEntries: function() {
            var entries = [];
            for (var p in taskRepository) {
                entries.push(p);
            }
            return entries;
        },
        getTaskLaneRepositoryEntries: function() {
            var entries = [];
            for (var p in taskLaneRepository) {
                entries.push(p);
            }
            return entries;
        }
    });
};

}());