package wosec.server.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;

public class Workflow implements Serializable {

    private String workflowId;
    private Workflow relatedWorkflow;
    private String name;
    private byte securityLevel;
    private Set<Activity> activities = new HashSet<Activity>(0);
    private Set<Instance> instances = new HashSet<Instance>(0);
    private Set<DataProvider> dataProviders = new HashSet<DataProvider>(0);
    private Set<WorkflowLanguage> workflowLanguages = new HashSet<WorkflowLanguage>(0);
    private Set<User> users = new HashSet<User>(0);
    private List<User> nonAppUsers;
    
    public List<User> getNonAppUsers() {
        if (nonAppUsers == null) {
            Session session = HibernateUtil.getSessionFactory().getCurrentSession();
            boolean startTransaction = !session.getTransaction().isActive();
            if (startTransaction) {
                session.beginTransaction();
            }
            nonAppUsers = (List<User>) session.createQuery("select u from Workflow w left join w.users u where w.workflowId = ? and "
                    + "exists (from User usr left join usr.userRole r where r.name <> ? and usr = u)").setString(0, workflowId).setString(1, UserRole.ROLE_APP).list();
            if (startTransaction) {
                session.getTransaction().commit();
            }
        }
        return nonAppUsers;
        
    }
    
    @Override
    public boolean equals(Object obj) {
        boolean returnValue = false;
                
        if (obj instanceof Workflow) {
            returnValue = workflowId.equals(((Workflow)obj).workflowId) && name.equals(((Workflow)obj).name);
        }
        
        return returnValue;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 79 * hash + (this.workflowId != null ? this.workflowId.hashCode() : 0);
        hash = 79 * hash + (this.name != null ? this.name.hashCode() : 0);
        hash = 79 * hash + this.securityLevel;
        return hash;
    }
    

    public Workflow() {
    }

    public Workflow(String workflowId, String name, byte securityLevel) {
        this.workflowId = workflowId;
        this.name = name;
        this.securityLevel = securityLevel;
    }

    public Workflow(String workflowId, Workflow relatedWorkflow, String name, byte securityLevel,
            Set<Activity> activityGroups, Set<Instance> instances, Set<DataProvider> dataProviders,
            Set<WorkflowLanguage> workflowLanguages, Set<User> users) {
        this.workflowId = workflowId;
        this.relatedWorkflow = relatedWorkflow;
        this.name = name;
        this.securityLevel = securityLevel;
        this.activities = activityGroups;
        this.instances = instances;
        this.dataProviders = dataProviders;
        this.workflowLanguages = workflowLanguages;
        this.users = users;
    }

    public String getWorkflowId() {
        return this.workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public Workflow getRelatedWorkflow() {
        return relatedWorkflow;
    }

    public void setRelatedWorkflow(Workflow relatedWorkflow) {
        this.relatedWorkflow = relatedWorkflow;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public byte getSecurityLevel() {
        return this.securityLevel;
    }

    public void setSecurityLevel(byte securityLevel) {
        this.securityLevel = securityLevel;
    }

    public Set<Activity> getActivities() {
        return this.activities;
    }

    public void setActivities(Set<Activity> activities) {
        this.activities = activities;
    }

    public Set<Instance> getInstances() {
        return this.instances;
    }

    public void setInstances(Set<Instance> instances) {
        this.instances = instances;
    }

    public Set<DataProvider> getDataProviders() {
        return this.dataProviders;
    }

    public void setDataProviders(Set<DataProvider> dataProviders) {
        this.dataProviders = dataProviders;
    }

    public Set<WorkflowLanguage> getWorkflowLanguages() {
        return this.workflowLanguages;
    }

    public void setWorkflowLanguages(Set<WorkflowLanguage> workflowLanguages) {
        this.workflowLanguages = workflowLanguages;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}