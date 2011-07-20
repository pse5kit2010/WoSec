package wosec.server.tests.eventhandling;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({ EventChainTest.class, DefaultEventHandlerTest.class, UserManagementEventHandlerTest.class,
		DebugEventHandlerTest.class, NewInstanceEventHandlerTest.class, BasicKeyAuthTest.class })
public class EventhandlingTests {
	public static Test suite() {
		TestSuite suite = new TestSuite(EventhandlingTests.class.getName());
		// $JUnit-BEGIN$

		// $JUnit-END$
		return suite;
	}

}
