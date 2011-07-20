package wosec.server.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "Activities")
public class Activity {
	private String id;
	private String name;
	private String type;
	private boolean inWorkflowPool;
	private ActivityGroup activityGroup;
	private Activity correspondingActivity;

	@Id
	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean getInWorkflowPool() {
		return this.inWorkflowPool;
	}

	public void setInWorkflowPool(boolean inWorkflowPool) {
		this.inWorkflowPool = inWorkflowPool;
	}

	@ManyToOne
	@JoinColumn(name = "groupID")
	public ActivityGroup getActivityGroup() {
		return activityGroup;
	}

	public void setActivityGroup(ActivityGroup activityGroup) {
		this.activityGroup = activityGroup;
	}

	@ManyToOne(optional=true)
	@JoinColumn(name = "correspondingActivityID")
	public Activity getCorrespondingActivity() {
		return correspondingActivity;
	}

	public void setCorrespondingActivity(Activity correspondingActivity) {
		this.correspondingActivity = correspondingActivity;
	}
	
	
}
