package wosec.server.model;

// Generated 16.08.2011 03:37:48 by Hibernate Tools 3.4.0.CR1
/**
 * ActivityInformation generated by hbm2java
 */
public class ActivityInformation implements java.io.Serializable {

    private ActivityId id;
    private Activity activity;
    private String name;
    private String information;

    public ActivityInformation() {
    }

    public ActivityInformation(Activity activity, String name,
            String information) {
        this.activity = activity;
        this.name = name;
        this.information = information;
    }

    public ActivityId getId() {
        return this.id;
    }

    public void setId(ActivityId id) {
        this.id = id;
    }

    public Activity getActivity() {
        return this.activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInformation() {
        return this.information;
    }

    public void setInformation(String information) {
        this.information = information;
    }
}
