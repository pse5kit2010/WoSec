package wosec.server.controllers.eventhandling;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

/**
 * Der EventHandlerService bildet den Controller, der für die Verarbeitung vom
 * Workflow Management System kommender Events zuständig ist.
 */
public class EventHandlerService extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private EventHandler firstHandler;
	private IAuthentication authenticator;

	/***
	 * Instanziiert die Zuständigkeitskette aus EventHandlern.
	 */
	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		firstHandler = new NewInstanceEventHandler(new DefaultEventHandler(new UserManagementEventHandler(
				new DebugEventHandler(null))));
		authenticator = new BasicKeyAuth();
	}

	/***
	 * Nimmt vom Workflow Management System kommende Anfragen entgegen, prüft
	 * deren Authentizität mittels authenticator.validate() und delegiert deren
	 * Verarbeitung an die handle-Methode von firstHandler.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp) {
		if (authenticator.validate(req))
			firstHandler.handleOrRelay(req);
	}
}