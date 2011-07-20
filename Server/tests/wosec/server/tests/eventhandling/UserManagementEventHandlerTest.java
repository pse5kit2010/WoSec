package wosec.server.tests.eventhandling;

import static org.junit.Assert.*;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;

import javax.persistence.Basic;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import wosec.server.controllers.eventhandling.BasicKeyAuth;
import wosec.server.controllers.eventhandling.UserManagementEventHandler;
import wosec.server.model.User;
import wosec.server.tests.NullHttpServletRequest;
import wosec.util.HashGenerator;

public class UserManagementEventHandlerTest {
	private final String sampleIdentifier = "testSampleUserHJA2376SDG672DSD343h667g";
	private final String sampleDisplayName = "Max Mustermann";
	private final String samplePassword = "HSADH3774r89/%$§!$/)(=)347637⁸76 16";

	/**
	 * Allgemeine Logik zum Aufrufen des UserManagementEventHandlers und
	 * anschließendem Abrufen des betroffenen Users aus der Datenabnk
	 * 
	 * @param req Anfrage mit Event-Parametern
	 * @return Den Nutzer, der angelegt/bearbeitet/gelöscht wurde
	 */
	private User doIt(NullHttpServletRequest req) {
		UserManagementEventHandler handler = new UserManagementEventHandler(null);
		handler.handleOrRelay(req);
		Session s = HibernateUtil.getSessionFactory().openSession();
		return (User) s.createQuery("from User where identifier = ?").setString(0, sampleIdentifier).uniqueResult();
	}

	/**
	 * Fügt einen Beispielnutzer in die Datenbank ein
	 */
	@Before
	public void setUp() throws Exception {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("key", BasicKeyAuth.KEY);
		req.setParameter("eventType", "createUser");
		req.setParameter("identifier", sampleIdentifier);
		req.setParameter("password", samplePassword);
		req.setParameter("displayName", sampleDisplayName);
		User u = doIt(req);
		assertNotNull(u);
		assertEquals(sampleIdentifier, u.getIdentifier());
		assertEquals(sampleDisplayName, u.getDisplayname());
		assertEquals(HashGenerator.SHA256(samplePassword), u.getPasswordHash());
	}

	/**
	 * Löscht den angelegten Beispielnutzer:
	 */
	@After
	public void tearDown() throws Exception {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("key", BasicKeyAuth.KEY);
		req.setParameter("eventType", "deleteUser");
		req.setParameter("identifier", sampleIdentifier);
		assertNull(doIt(req));
	}

	/**
	 * Lässt UserManagementEventHandler DisplayName des Beispielnutzers updaten
	 */
	@Test
	public void testUpdate() {
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("key", BasicKeyAuth.KEY);
		req.setParameter("eventType", "updateUser");
		req.setParameter("identifier", sampleIdentifier);
		req.setParameter("newDisplayName", "LSDJLKJASDJ ASDLKJASLKDJ");
		User u = doIt(req);
		assertEquals("LSDJLKJASDJ ASDLKJASLKDJ", u.getDisplayname());
	}

}
