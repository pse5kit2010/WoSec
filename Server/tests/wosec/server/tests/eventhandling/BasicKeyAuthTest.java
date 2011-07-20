package wosec.server.tests.eventhandling;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;

import javax.persistence.Basic;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import wosec.server.controllers.eventhandling.BasicKeyAuth;
import wosec.server.controllers.eventhandling.IAuthentication;
import wosec.server.tests.NullHttpServletRequest;

@RunWith(Parameterized.class)
public class BasicKeyAuthTest {
	private BasicKeyAuth auth;
	private Hashtable requestParameters;

	public BasicKeyAuthTest(Hashtable params) {
		this.requestParameters = params;
	}

	@Parameters
	public static Collection<Object[]> data() {
		// Teste ungültige/fehlende Werte:
		
		// Keinerlei GET-Parameter:
		Hashtable map1 = new Hashtable();
		// Falscher Schlüssel:
		Hashtable map2 = new Hashtable();
		map2.put("key", BasicKeyAuth.KEY + "INVALID");
		// Leerer Schlüssel:
		Hashtable map3 = new Hashtable();
		map3.put("key", "");
		
		Object[][] data = new Object[][] { { map1 }, { map2 }, { map3 } };
		return Arrays.asList(data);
	}

	@Before
	public void setUp() {
		auth = new BasicKeyAuth();
	}

	@Test
	public void testValidateForIncorrectInput() {
		// Für ungültige/fehlende Werte:
		NullHttpServletRequest req = new NullHttpServletRequest(requestParameters);
		assertFalse(auth.validate(req));
	}
	
	@Test
	public void testValidateForCorrectInput() {
		// Korrekter Schlüssel:
		NullHttpServletRequest req = new NullHttpServletRequest();
		req.setParameter("key", BasicKeyAuth.KEY);
		assertTrue(auth.validate(req));
	}
}
