
/**
 * Das Objekt Workflow stellt ein Singleton dar,
 * das Methoden zum Finden und Erstellen von Tasks (Tasklanes) bereitstellt.
 * Es speichert das Task Repository.
 */
WoSec.workflow = (function() { // Singleton pattern begin
    // import
	var newTask = WoSec.newTask;
	var newTaskLane = WoSec.newTaskLane;
	var htmlRenderer = WoSec.htmlRenderer;
	var svgUtility = WoSec.svgUtility;
	
	var thisInstanceID;
    var taskRepository = {}; // ID => Task
    var taskLaneRepository = {}; // ID => TaskLane
	var correspondingActivities = {}; // ID => ID
	var activitiesInALane = {}; // TaskLaneID => [TaskIDs]
	
    function createTask(activityID) {
		if (typeof(activityID) != "string") {
			throw new TypeError("The given ID is not a String");
		}
        return newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle(activityID), correspondingActivities[activityID]);
    }
    function createTaskLane(activityGroupID) {
		if (typeof(activityGroupID) != "string") {
			throw new TypeError("The given groupID is not a String");
		}
		if (!activitiesInALane[activityGroupID]) {
			throw new Error("Unknown activityGroupID");
		}
        return newTaskLane(svgUtility.getTaskLaneRectangle(activityGroupID), activitiesInALane[activityGroupID]);
    }
    return {
		/**
		 * Initialisiert den Workflow mit den korrespondierenden Tasks und Tasks in einer TaskLane
		 * @param {String} InstanzID
		 * @param {Object} correspondingActivitiesIDs korrespondierende Tasks ID => ID
		 * @param {Object} activityIDsForALane Tasks in einer TaskLane TaskLaneID => [TaskIDs]
		 */
		init: function(instanceID, correspondingActivitiesIDs, activityIDsForALane) {
			thisInstanceID = instanceID;
			correspondingActivities = correspondingActivitiesIDs;
			activitiesInALane = activityIDsForALane;
		},
		/**
		 * Gibt die InstanzID des Workflows zurück
		 * @return InstanzID
		 */
		getInstanceID: function() {
			return thisInstanceID;
		},
		/**
		 * Liefert den Task mit der angegebenen ID zurück
		 * @param {String} activityID
		 * @return {Task} Task ggf. aus Repository
		 */
        getTaskByID: function(activityID) {
			if (!taskRepository[activityID]) {
				taskRepository[activityID] = createTask(activityID)
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
			}
            return taskLaneRepository[activityGroupID];
        }
    };
}()); // Singleton pattern end
