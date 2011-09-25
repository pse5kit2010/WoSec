package org.hibernate;

import org.hibernate.SessionFactory;

import org.hibernate.cfg.Configuration;

public class HibernateUtil {

    private static final SessionFactory sessionFactory = buildSessionFactory();

    private HibernateUtil() {
    }

    private static SessionFactory buildSessionFactory() {
        HibernateUtil hibernateUtil = new HibernateUtil();
        Configuration config = new Configuration();
        // Create the SessionFactory from hibernate.cfg.xml

        // Annotation and XML
        return new Configuration().configure().buildSessionFactory();


    }

    public static SessionFactory getSessionFactory() {

        return sessionFactory;

    }
}