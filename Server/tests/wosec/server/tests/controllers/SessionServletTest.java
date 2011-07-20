package wosec.server.tests.controllers;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import wosec.server.tests.WoSecWebTestCase;

public class SessionServletTest extends WoSecWebTestCase {
	private final String identifier = "testIdentifier";
	private final String password = "ABC";

	@Before
	public void setUp() throws Exception {
		super.setUp();
		setBaseUrl(url);
		beginAt("/");

		// User hinzufügen
		gotoPage("/EventHandler?key=AHDEFG&eventType=createUser&identifier=" + identifier
				+ "&displayName=testInstance&password=" + password);
	}

	@After
	public void tearDown() throws Exception {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		// User löschen
		session.createQuery("delete User where identifier = ?").setString(0, identifier).executeUpdate();

		session.getTransaction().commit();

	}

	@Test
	public void testLinkToLogin() {
		// Test ob man auf die Loginseite verwiesen wird
		beginAt("/");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Test ob man beim Zugriff auf den InstancesController auf die
		// Loginseite verwiesen wird
		gotoPage("/InstancesController");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Test ob man beim Zugriff auf den SingleInstancesController mit
		// InstanzParameter auf die Loginseite verwiesen wird
		gotoPage("/SingleInstanceController?instance=test");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Test ob man beim Zugriff auf den SearchController auf die
		// Loginseite verwiesen wird
		gotoPage("/SearchController");
		assertTitleEquals(PageTitles.LOGINPAGE);
	}

	@Test
	public void testLogout() {
		beginAt("/");
		assertTitleEquals(PageTitles.LOGINPAGE);

		setTextField("username", "alice");
		setTextField("password", "ABC");
		submit();

		assertTitleEquals(PageTitles.INSTANCESPAGE);

		// Test ob man im angemeldeten Zustand nicht auf die Loginseite
		// verwiesen wird
		gotoPage("/InstancesController");
		assertTitleEquals(PageTitles.INSTANCESPAGE);

		clickLinkWithText("Logout");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Test ob man im ausgeloggten Zustand wieder auf die Loginseite
		// verwiesen wird
		gotoPage("/InstancesController");
		assertTitleEquals(PageTitles.LOGINPAGE);
	}
}
