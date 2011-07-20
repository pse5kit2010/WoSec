package wosec.server.tests.controllers;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.junit.Ignore;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({ UserControllerTest.class, SessionServletTest.class, UpdateControllerTest.class })
public class ControllerTests {

	public static Test suite() {
		TestSuite suite = new TestSuite("Controller-Tests");
		// $JUnit-BEGIN$
		// $JUnit-END$
		return suite;
	}

}
