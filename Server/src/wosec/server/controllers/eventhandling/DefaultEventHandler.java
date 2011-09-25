package wosec.server.controllers.eventhandling;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;
import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.Activity;
import wosec.server.model.ActivityType;
import wosec.server.model.DataProvider;
import wosec.server.model.Event;
import wosec.server.model.EventData;
import wosec.server.model.EventId;
import wosec.server.model.EventInformation;
import wosec.server.model.Instance;
import wosec.server.model.User;
import wosec.server.model.UserRole;

public class DefaultEventHandler extends EventHandler {

    private final static Logger log = Logger.getLogger(DefaultEventHandler.class.getName());

    public DefaultEventHandler(EventHandler nextHandler) {
        super(nextHandler, new String[]{"humanActivityExecuted", "eventActivityExecuted",
                    "HumanTaskExecutorSelected", "WSProviderSelected", "startActivityExecution", "DataTransferredToWS",
                    "DataTransferredFromWS", "WSActivityExecuted", "startActivityExecution", "DataTransferredToHuman",
                    "DataTransferredFromHuman", "terminateInstance"});
    }

    protected void handle(String eventType, HttpServletRequest req, HttpServletResponse resp) {

        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        try {
            session.beginTransaction();

            Event event = setEventProperties(req, session);
            //event.setType(eventType);
            ActivityType type = (ActivityType) session.createQuery("from ActivityType a where a.name = ?").setString(0, eventType).uniqueResult();
            Set<ActivityType> typesSet = new HashSet<ActivityType>(1);
            typesSet.add(type);
            event.setActivityTypes(typesSet);
            //event.setActivityTypes(null);

            session.save(event);
            session.save(event.getEventInformation());
            if (event.getEventInformation().getEventData() != null) {
                session.save(event.getEventInformation().getEventData());
            }
            session.getTransaction().commit();
            log.info(String.format("Added Event with Instance-ID: \"%s\"", event.getInstance().getInstanceId()));

        } catch (ParseException e) {
            log.log(Level.SEVERE, "Timestamp must have the format \"yyyy-MM-ddTHH:mm:ssZ\"");
            log.log(Level.SEVERE, "Rolling back transaction");
            doRollback(session.getTransaction());
        } catch (EventHandlingException e1) {
            log.log(Level.SEVERE, e1.getMessage());
            log.log(Level.SEVERE, "Rolling back transaction");
            doRollback(session.getTransaction());
        }
    }

    protected void doRollback(Transaction tx) {
        if (tx.isActive()) {
            try {
                tx.rollback();
                System.out.println("tx rolled back");
            } catch (HibernateException e1) {
                System.out.println("rollback failed: " + e1.getMessage());
            }
        }
    }

    private Event setEventProperties(HttpServletRequest req, Session session) throws ParseException, RuntimeException,
            EventHandlingException {
        Instance instance;
        String parameter;
        Object object;

        if ((parameter = req.getParameter("instanceID")) != null) {
            if ((instance = (Instance) session.get(Instance.class, parameter)) == null) {
                //ev.setInstance(instance);
                //} else {
                throw new EventHandlingException(String.format("The Instance \"%s\" doesn't exist!", parameter));
            }
        } else {
            throw new EventHandlingException("No given instanceID!");
        }
        Event ev = new Event();
        ev.setInstance(instance);
        ev.setId(EventId.generateKey(instance.getInstanceId()));
        EventInformation evInfo = new EventInformation();
        evInfo.setId(ev.getId());
        evInfo.setEvent(ev);
        ev.setEventInformation(evInfo);

        // Zeitstempel speichern
        // MySQL: Spalte 'time' muss vom Typ TIMESTAMP sein
        Date time;
        String timestamp = req.getParameter("timestamp");
        if (timestamp == null) {
            time = new Date();
        } else {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
            time = format.parse(req.getParameter("timestamp").replace(' ', '+'));
            System.out.println("uhrzeit: " + time);
        }
        ev.getEventInformation().setEventTime(time);

        // Test ob ActivityID, GroupID oder SourceAcrivityID übermittelt
        // wurde
        Activity activity = null;
        if ((parameter = req.getParameter("activityID")) != null) {
            //if ((object = session.get(Activity.class, parameter)) != null) {
            activity = (Activity) session.createQuery("from Activity where id.activityId = ? and workflow_id = ?").setString(0, req.getParameter("activityID")).setString(1, instance.getWorkflow().getWorkflowId()).uniqueResult();
            if (activity != null) {
                ev.getEventInformation().setActivity(activity);
                //todo testen ob das so OK ist!
                if ((parameter = req.getParameter("sourceActivityID")) != null) {
                    Activity targetActivity = (Activity) session.createQuery("from Activity where id.activityId = ? and workflow_id = ?").setString(0, req.getParameter("sourceActivityID")).setString(1, instance.getWorkflow().getWorkflowId()).uniqueResult();
                    if (targetActivity != null) {
                        ev.getEventInformation().setFromActivity(targetActivity);
                    }
                }
                //ev.setActivity((Activity) object);
            } else {
                throw new EventHandlingException(String.format("The activityID \"%s\" is wrong!", parameter));
            }
        } else if ((parameter = req.getParameter("groupID")) != null) {
            if ((object = session.createQuery("from Activity a where a.id.activityId = ? and a.workflow = ? AND is_group = ?").setString(0, parameter).setEntity(1, instance.getWorkflow()).setByte(2, (byte) 1).uniqueResult()) != null) {
                //TODO GRUPPEN!
                //ev.setGroup((ActivityGroup) object);
                ev.getEventInformation().setActivity((Activity) object);
            } else {
                throw new EventHandlingException(String.format("The groupID \"%s\" is wrong!", parameter));
            }

        } /*else if ((parameter = req.getParameter("sourceActivityID")) != null) {
            activity = (Activity) session.createQuery("from Activity where id.activityId = ? and workflow_id = ?").setString(0, req.getParameter("sourceActivityID")).setString(1, instance.getWorkflow().getWorkflowId()).uniqueResult();
            if (activity != null) {
                ev.getEventInformation().setActivity(activity);
                Activity targetActivity = (Activity) session.createQuery("from Activity where id.activityId = ? and workflow_id = ?").setString(0, req.getParameter("targetActivityID")).setString(1, instance.getWorkflow().getWorkflowId()).uniqueResult();
                ev.getEventInformation().setDestActivity(targetActivity);
            } else {
                throw new EventHandlingException(String.format("The soureActivityID \"%s\" is wrong!", parameter));
            }
        }*/
        // TODO check ob sourceactivityid wirklich gebraucht wird.

        // Test ob providerID oder userId übermittelt wurde
        if ((parameter = req.getParameter("providerName")) != null) {
            //DataProvider p = (DataProvider) session.get(DataProvider.class, parameter);
            DataProvider p = (DataProvider) session.createQuery("from DataProvider where name = ?").setString(0, parameter).uniqueResult();
            if (p == null) {
                // Provider noch nicht in Datenbank -> einfügen
                p = new DataProvider();
                //p.setId(parameter);
                p.setName(req.getParameter("providerName"));
                p.setWorkflow(instance.getWorkflow());
                session.save(p);
            }
            ev.getEventInformation().setDataProvider(p);
        } else if ((parameter = req.getParameter("execUser")) != null) {
            User user = (User) session.createQuery("from User u where u.identifier = ?").setString(0, parameter).uniqueResult();
            if (user == null) {
                //DARF KEINEN USER ANLEGEN!
                throw new EventHandlingException("a non existing user was specified");
                /*user = new User();
                user.setPasswordHash("");
                UserRole role = (UserRole) session.createQuery("from UserRole where name = ?").setString(0, UserRole.ROLE_USER).uniqueResult();
                user.setUserRole(role);
                user.setIdentifier(parameter);
                user.setDisplayName(req.getParameter("userName"));
                session.save(user);*/
            }
            ev.getEventInformation().setExecutingUser(user);
            //ev.setUser(user);
        } /*else if ((parameter = req.getParameter("evokUserID")) != null) {
        User user = (User) session.createQuery("from User u where u.identifier = ?").setString(0, parameter).uniqueResult();
        if (user == null) {
        throw new EventHandlingException("a non existing user was specified");
        }
        ev.getEventInformation().setEvokingUser(user);
        }*/
        if (activity != null) {
            System.out.println("last events...");
            //Zwei einzelne Abfragen, weil Hibernate kein UNION unterstützt...
            EventInformation lastEventCand1 = (EventInformation) session.createQuery("select ev from EventInformation ev where ev.id.instanceId = :instance "
                    + "and ev.id.eventId IN "
                    + "(select Max(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.activity = :activity)")
                    .setParameter("instance", instance.getInstanceId())
                    .setParameter("activity", activity)
                    .uniqueResult();
            EventInformation lastEventCand2 = (EventInformation) session.createQuery("select ev from EventInformation ev where ev.id.instanceId = :instance "
                    + "and ev.id.eventId IN "
                    + "(select Max(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.fromActivity = :activity)")
                    .setParameter("instance", instance.getInstanceId())
                    .setParameter("activity", activity)
                    .uniqueResult();
            /*List<EventInformation> lastEvents = (List<EventInformation>)session.createQuery("from EventInformation ev where ev.id.instanceId = :instance ")
                    + "and ev.id.eventId IN "
                    + "(select MAX(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.activity = :activity "
                    + "UNION select MAX(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.dest_activity = :activity)"
                    .setParameter("instance", instance.getInstanceId())
                    .setParameter("activity", activity)
                    .list();*/
//            List<EventInformation> lastEvents = (List<EventInformation>)session.createQuery("from EventInformation ev where ev.id.instanceId = :instance "
//                    + "and ev.id.eventId IN "
//                    + "(select MAX(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.activity = :activity "
//                    + "UNION select MAX(ev2.id.eventId) from EventInformation ev2 where ev2.id.instanceId = ev.id.instanceId AND ev2.dest_activity = :activity)")
//                    .setParameter("instance", instance.getInstanceId())
//                    .setParameter("activity", activity)
//                    .list();
            EventInformation lastEvent = null;
            if (lastEventCand1 != null && lastEventCand2 != null) {
                if (lastEventCand1.getEventTime().after(lastEventCand2.getEventTime())) {
                    lastEvent = lastEventCand1;
                } else {
                    lastEvent = lastEventCand2;
                }                       
            } else if (lastEventCand1 != null) {
                lastEvent = lastEventCand1;
            } else {
                lastEvent = lastEventCand2;
            }
            
            if (lastEvent != null && lastEvent.getExecutingUser() != null) {
                ev.getEventInformation().setEvokingUser(lastEvent.getExecutingUser());
            }
        }

        // Test ob dataDescription übermittelt wurde
        String dataDescription = (req.getParameter("dataUsed") != null) ? req.getParameter("dataUsed") : "";
        String usageReason = (req.getParameter("usageReason") != null) ? req.getParameter("usageReason") : "";
        //if ((parameter = req.getParameter("dataDescription")) != null) {
        if (!dataDescription.equals("") || !usageReason.equals("")) {
            //ev.setDescription(parameter);
            ev.getEventInformation().setEventData(new EventData(evInfo, dataDescription, usageReason));
            ev.getEventInformation().getEventData().setId(ev.getId());
//            ev.getEventInformation().getEventData().setDataUsed(parameter);
//            ev.getEventInformation().getEventData().setUsageReason("");
        }

        return ev;

    }
}