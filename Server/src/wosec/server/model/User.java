package wosec.server.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.ElementCollection;
import javax.persistence.JoinColumn;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class User implements Serializable {

    private Integer userId;
    private String identifier;
    private String displayName;
    private String passwordHash;
    private UserRole userRole;
    private Set<Instance> instances = new HashSet<Instance>(0);
    private Set<Workflow> workflows = new HashSet<Workflow>(0);
    private Set<Event> eventDatasForEvokingUser = new HashSet<Event>(0);
    private Set<Event> eventDatasForExecutingUser = new HashSet<Event>(0);

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        boolean isEqual = false;
        
        if (obj instanceof User) {
            User usr = (User)obj;
            isEqual = usr.userId == this.userId && usr.identifier.equals(this.identifier);
        }
        
        return isEqual;
    }
    

    public static User loadFromId(Integer userId) {
        //Session session = HibernateUtil.getSessionFactory().openSession();
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        return (User) session.get(User.class, userId);
    }

    public boolean isAdmin() {
        return this.getUserRole().getName().equals(UserRole.ROLE_ADMN);
    }

    public boolean isBPMNDesigner() {
        return this.isAdmin() || this.getUserRole().getName().equals(UserRole.ROLE_BPMN);
    }

    public boolean isApp() {
        return this.getUserRole().getName().equals(UserRole.ROLE_APP);
    }

    public User() {
    }

    public User(UserRole userRole, String identifier, String passwordHash) {
        this.userRole = userRole;
        this.identifier = identifier;
        this.passwordHash = passwordHash;
    }

    public User(UserRole userRole, String identifier, String passwordHash,
            String displayName, Set eventDatasForEvokingUser, Set instances,
            Set eventDatasForExecutingUser, Set workflows) {
        this.userRole = userRole;
        this.identifier = identifier;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.eventDatasForEvokingUser = eventDatasForEvokingUser;
        this.instances = instances;
        this.eventDatasForExecutingUser = eventDatasForExecutingUser;
        this.workflows = workflows;
    }

    public Integer getUserId() {
        return this.userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getIdentifier() {
        return this.identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPasswordHash() {
        return this.passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public Set<Instance> getInstances() {
        return instances;
    }

    public void setInstances(Set<Instance> instances) {
        this.instances = instances;
    }
    
    public Set<Workflow> getWorkflows() {
        return this.workflows;
    }

    public Set<Workflow> getWorkflows(boolean asAdmin) {
        if (this.isAdmin()) {
            //Falls Admin: alle Workflows zurückgeben
            // XXX wieder zurückändern
            Session session = HibernateUtil.getSessionFactory().openSession();
            //Session session = HibernateUtil.getSessionFactory().getCurrentSession();
            Transaction tx = session.getTransaction();
            boolean transactionActive = !tx.isActive();
            if (transactionActive) {
                 tx = session.beginTransaction();
            }
            List<Workflow> list = session.createQuery("from Workflow").list();
            if (transactionActive) {
                tx.commit();
            }
            return new HashSet<Workflow>(list);        
        } else {
            return this.workflows;
        }
    }

    public void setWorkflows(Set<Workflow> workflows) {
        this.workflows = workflows;
    }

    public Set<Event> getEventDatasForEvokingUser() {
        return this.eventDatasForEvokingUser;
    }

    public void setEventDatasForEvokingUser(Set<Event> eventDatasForEvokingUser) {
        this.eventDatasForEvokingUser = eventDatasForEvokingUser;
    }

    public Set<Event> getEventDatasForExecutingUser() {
        return this.eventDatasForExecutingUser;
    }

    public void setEventDatasForExecutingUser(Set<Event> eventDatasForExecutingUser) {
        this.eventDatasForExecutingUser = eventDatasForExecutingUser;
    }
}