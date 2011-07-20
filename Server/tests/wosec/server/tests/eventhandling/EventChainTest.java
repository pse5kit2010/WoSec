package wosec.server.tests.eventhandling;

import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import wosec.server.controllers.eventhandling.BasicKeyAuth;
import wosec.server.controllers.eventhandling.EventHandlerService;
import wosec.server.tests.NullHttpServletRequest;
import wosec.server.tests.NullHttpServletResponse;

import com.thoughtworks.selenium.*;

@RunWith(Parameterized.class)
public class EventChainTest extends SeleneseTestCase {
	protected final String url = "http://localhost:8080/WoSecServer/";
	private String requestParameters;

	@Before
	public void setUp() throws Exception {
		setUp(url);
	}

	public EventChainTest(String params) {
		this.requestParameters = params;
	}

	@Parameters
	public static Collection<Object[]> data() {
		  Object[][] data = new Object[][] { 
				  // Keinerlei GET-Parameter: 
				  { "" },
				  // Falscher Schlüssel:
				  { "?key=" + BasicKeyAuth.KEY + "INVALID" },
				  // Korrekter Schlüssel, kein Eventtyp: 
				  { "?key=" + BasicKeyAuth.KEY },
				  // Korrekter Schlüssel, leerer Eventtyp:
				  { "?key=" + BasicKeyAuth.KEY + "&eventType=" },
				  // Korrekter Schlüssel, Event, das kein Handler bearbeiten kann:
				  { "?key=" + BasicKeyAuth.KEY + "&eventType=FUNNYINVALIDEVENT############" } 
		  };
		 
		return Arrays.asList(data);
	}

	@After
	public void tearDown() throws Exception {
		selenium.stop();
	}

	@Test
	public void testHandleOrRelay() throws Exception {
		 selenium.open("EventHandler" + requestParameters);
		 assertEquals("", selenium.getBodyText());
	}
}