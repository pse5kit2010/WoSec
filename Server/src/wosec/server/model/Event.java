package wosec.server.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "Events")
public class Event {
	private int id;
	private String type;
	private java.util.Date time;
	private String description;
	private Instance instance;
	private Activity activity;
	private Activity destActivity;
	private ActivityGroup group;
	private Provider provider;
	private User user;

	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public java.util.Date getTime() {
		return this.time;
	}

	public void setTime(java.util.Date time) {
		this.time = time;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne
	@JoinColumn(name = "instanceID", nullable = false)
	public Instance getInstance() {
		return instance;
	}

	public void setInstance(Instance instance) {
		this.instance = instance;
	}

	@ManyToOne
	@JoinColumn(name = "activityID")
	public Activity getActivity() {
		return activity;
	}

	public void setActivity(Activity activity) {
		this.activity = activity;
	}

	@ManyToOne
	@JoinColumn(name = "destActivityID")
	public Activity getDestActivity() {
		return destActivity;
	}

	public void setDestActivity(Activity destActivity) {
		this.destActivity = destActivity;
	}

	@ManyToOne
	@JoinColumn(name = "groupID")
	public ActivityGroup getGroup() {
		return group;
	}

	public void setGroup(ActivityGroup group) {
		this.group = group;
	}

	@ManyToOne
	@JoinColumn(name = "providerID")
	public Provider getProvider() {
		return provider;
	}

	public void setProvider(Provider provider) {
		this.provider = provider;
	}


	@ManyToOne
	@JoinColumn(name = "userID")
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	
	
}