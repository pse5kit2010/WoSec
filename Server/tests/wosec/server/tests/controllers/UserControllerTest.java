package wosec.server.tests.controllers;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import wosec.server.model.User;
import wosec.server.tests.WoSecWebTestCase;
import wosec.util.Configuration;
import wosec.util.HashGenerator;

public class UserControllerTest extends WoSecWebTestCase {
	private final String userNoPwdIdentifier = "testUserNoPwd-UserController";
	private final String userPwdIdentifier = "!(testUserPwdUserController)/%$";
	private final String userPwdPassword = "!testPwd-UserController&/()?";

	private String errorMsg;

	@BeforeClass
	public void setUp() throws Exception {
		super.setUp();
		setBaseUrl(url);

		Configuration config = new Configuration();
		config.init(null);
		errorMsg = config.getProperties().getProperty("LoginFailedErrorMessage");

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		// User ohne Passwort (z.B User die angeleget werden wenn ein
		// dementsprechendes Event ankommt)
		User userNoPwd = new User();
		userNoPwd.setDisplayname(userNoPwdIdentifier);
		userNoPwd.setIdentifier(userNoPwdIdentifier);
		session.save(userNoPwd);

		// User mit Passwort (kann sich einloggen)
		User userPwd = new User();
		userPwd.setIdentifier(userPwdIdentifier);
		userPwd.setDisplayname(userPwdIdentifier);
		userPwd.setPasswordHash(HashGenerator.SHA256(userPwdPassword));
		session.save(userPwd);

		session.getTransaction().commit();
	}

	@AfterClass
	public void tearDown() throws Exception {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		// Beide User löschen
		session.createQuery("delete User where identifier = ? or identifier = ?").setString(0, userPwdIdentifier)
				.setString(1, userNoPwdIdentifier).executeUpdate();

		session.getTransaction().commit();
	}

	/**
	 * Es wird getestet ob man bei correkter Eingabe des Usernames und des
	 * Passwords eingeloggt wird und anschließend beim Click auf "Logout" wieder
	 * ausgeloggt wird
	 */
	@Test
	public void testUserControllerCorrectPasswordAndLogout() {
		beginAt("/");
		assertTitleEquals(PageTitles.LOGINPAGE);
		// Einloggen
		setTextField("username", userPwdIdentifier);
		setTextField("password", userPwdPassword);
		submit();

		assertTitleEquals(PageTitles.INSTANCESPAGE);
		// Ausloggen
		clickLinkWithText("Logout");

		assertTitleEquals(PageTitles.LOGINPAGE);

	}

	/**
	 * Es wird getestet ob man sich als User ohne Password (User die aus Events
	 * entnommen und gespeichert werden)einloggen kann
	 */
	@Test
	public void testUserControllerNoPassword() {
		beginAt("/");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Login sollte nicht möglich sein
		setTextField("username", userNoPwdIdentifier);
		submit();

		assertTextPresent(errorMsg);
		assertTitleEquals(PageTitles.LOGINPAGE);
	}

	/**
	 * Es wird getestet ob man bei falscher Eingabe des Passworts wieder auf die
	 * Loginseite verwiesen (also nicht eingeloggt)wird und danach sollte man
	 * sich bei richtiger Eingabe noch eingeloggen können
	 */
	@Test
	public void testUserControllerWrongPassword() {
		beginAt("/");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Test mit falschen Passwort
		setTextField("username", userPwdIdentifier);
		setTextField("password", "wrongPassword");
		submit();

		// Überprüfung ob richtige Texte angezeigt werden
		assertTextPresent("Login fehlgeschlagen!");
		assertTitleEquals(PageTitles.LOGINPAGE);

		// Überprüfung ob man sich nun noch einloggen kann
		setTextField("username", userPwdIdentifier);
		setTextField("password", userPwdPassword);
		submit();

		assertTitleEquals(PageTitles.INSTANCESPAGE);
	}
}
