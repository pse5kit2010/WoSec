package wosec.server.model;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.ElementCollection;

public class Instance {

    private String instanceId;
    private Workflow workflow;
    private User user;
    private Date lastVisited;
    private Set<Event> events = new HashSet<Event>(0);

    public Instance() {
    }

    public Instance(String instanceId, User user, Workflow workflow) {
        this.instanceId = instanceId;
        this.user = user;
        this.workflow = workflow;
    }

    public Instance(String instanceId, User user, Workflow workflow,
            Date lastVisited, Set<Event> events) {
        this.instanceId = instanceId;
        this.user = user;
        this.workflow = workflow;
        this.lastVisited = lastVisited;
        this.events = events;
    }

    public String getInstanceId() {
        return this.instanceId;
    }

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public Workflow getWorkflow() {
        return workflow;
    }

    public void setWorkflow(Workflow workflow) {
        this.workflow = workflow;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getLastVisited() {
        return lastVisited;
    }

    public void setLastVisited(Date time) {
        this.lastVisited = time;
    }

    public Set<Event> getEvents() {
        return events;
    }

    public void setEvents(Set<Event> events) {
        this.events = events;
    }
}