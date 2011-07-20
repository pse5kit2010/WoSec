package wosec.server.tests.controllers;

import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.SeleneseTestCase;

public class UpdateControllerTest extends SeleneseTestCase {
	private final String identifier = "testIdentifier";
	private final String password = "ABC";
	private final String instanceId = "testInstanceId";

	@Before
	public void setUp() throws Exception {
		selenium = new DefaultSelenium("localhost", 4444, "*chrome", "http://localhost:8080/");
		selenium.start();

		// User hinzufügen
		selenium.open("/WoSecServer/EventHandler?key=AHDEFG&eventType=createUser&identifier=" + identifier
				+ "&displayName=testInstance&password=" + password);

		// Instanz hinzufügen
		selenium.open("/WoSecServer/EventHandler?key=AHDEFG&eventType=createInstance&modelID=_BCoSEIBxEd-3VeNHLWdQXA&timestamp=2010-11-18T11%3A20%3A00%2B0100&identifier="
				+ identifier + "&instanceID=" + instanceId);
	}

	@Test
	public void testszenario_1() throws Exception {

		// Login-Seite wird aufgerufen
		selenium.open("/WoSecServer/Login.jsp");
		assertEquals(PageTitles.LOGINPAGE, selenium.getTitle());

		// Benutzer anmelden
		selenium.type("username", identifier);
		selenium.type("password", password);
		selenium.click("button");
		selenium.waitForPageToLoad("3000");

		// Test auf richtigen Titel und ob die Instanzentabelle mit den vier
		// Spalten vorhanden ist
		assertEquals(PageTitles.INSTANCESPAGE, selenium.getTitle());
		assertEquals("ID", selenium.getTable("instancestable.0.0"));
		assertEquals("Modell", selenium.getTable("instancestable.0.1"));
		assertEquals("Letztes Event", selenium.getTable("instancestable.0.2"));
		assertEquals("Zustand", selenium.getTable("instancestable.0.3"));

		// Test ob ein die eingefügte Instanz aufgelistet ist
		assertEquals(instanceId, selenium.getText("link=" + instanceId));
		// LastEvent createInstance

		// Ausloggen
		selenium.click("logoutButton");
		selenium.waitForPageToLoad("3000");
		assertEquals(PageTitles.LOGINPAGE, selenium.getTitle());
	}

	@Test
	public void testszenario_2() throws Exception {

		// Login-Seite wird aufgerufen
		selenium.open("/WoSecServer/Login.jsp");
		assertEquals(PageTitles.LOGINPAGE, selenium.getTitle());

		// Benutzer anmelden
		selenium.type("username", identifier);
		selenium.type("password", password);
		selenium.click("button");
		selenium.waitForPageToLoad("3000");
		assertEquals(PageTitles.INSTANCESPAGE, selenium.getTitle());

		// Eingefügte Instanz öffnen
		selenium.click("link=" + instanceId);
		selenium.waitForPageToLoad("3000");

		// Test ob SVG-Element vorhanden
		selenium.isElementPresent("svg");

		// Ausloggen
		selenium.click("logoutLink");
		selenium.waitForPageToLoad("3000");
		assertEquals(PageTitles.LOGINPAGE, selenium.getTitle());
	}

	@After
	public void tearDown() throws Exception {

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();

		// User und Instanz (+dessen Events) löschen
		session.createQuery("delete Event where instanceID = ?").setString(0, instanceId).executeUpdate();
		session.createQuery("delete Instance where id = ?").setString(0, instanceId).executeUpdate();
		session.createQuery("delete User where identifier = ?").setString(0, identifier).executeUpdate();

		session.getTransaction().commit();

		selenium.stop();

	}
}