package wosec.server.model;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;


public class Event {
	
	private EventId eventId;
	private Instance instance;
	private Set<ActivityType> activityTypes = new HashSet<ActivityType>(0);
	private EventInformation eventInformation;

	public Event() {
	}

	public Event(EventId eventId, Instance instances) {
		this.eventId = eventId;
		this.instance = instances;
	}

	public Event(EventId eventId, Instance instances, Set activityTypeses,
			EventInformation eventInformation) {
		this.eventId = eventId;
		this.instance = instances;
		this.activityTypes = activityTypeses;
		this.eventInformation = eventInformation;
	}

	public EventId getId() {
		return this.eventId;
	}

	public void setId(EventId eventId) {
		this.eventId = eventId;
	}

	public Instance getInstance() {
		return this.instance;
	}

	public void setInstance(Instance instances) {
		this.instance = instances;
	}
        
        public String getActivityTypesString() {
            String returnValue = "";
            
            Set<ActivityType> types = this.getActivityTypes();
            
            //Iterator<ActivityTyp> it = types.iterator();
            
            for(Iterator<ActivityType> it = types.iterator(); it.hasNext();) {
                ActivityType type = it.next();
                returnValue += type.getName();
                if (it.hasNext()) {
                    returnValue += ",";
                }
            }
            
            return returnValue;
        }

	public Set<ActivityType> getActivityTypes() {
		return this.activityTypes;
	}

	public void setActivityTypes(Set<ActivityType> activityTypes) {
		this.activityTypes = activityTypes;
	}

	public EventInformation getEventInformation() {
		return this.eventInformation;
	}

	public void setEventInformation(EventInformation eventInformation) {
		this.eventInformation = eventInformation;
	} 	
}