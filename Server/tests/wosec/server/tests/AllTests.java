package wosec.server.tests;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

import wosec.server.tests.controllers.ControllerTests;
import wosec.server.tests.eventhandling.EventhandlingTests;

@RunWith(Suite.class)
@Suite.SuiteClasses( { EventhandlingTests.class, ControllerTests.class })
public class AllTests {

	public static Test suite() {
		TestSuite suite = new TestSuite(AllTests.class.getName());
		//$JUnit-BEGIN$
		//$JUnit-END$
		return suite;
	}

}
