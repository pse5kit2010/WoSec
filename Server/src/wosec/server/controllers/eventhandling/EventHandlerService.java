package wosec.server.controllers.eventhandling;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
        //authenticator = new BasicKeyAuth();
        authenticator = new DatabaseAuth();
    }

    /***
     * Nimmt vom Workflow Management System kommende Anfragen entgegen, prüft
     * deren Authentizität mittels authenticator.validate() und delegiert deren
     * Verarbeitung an die handle-Methode von firstHandler.
     */
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        //FIXME auskommentieren rückgängig machen
        if (authenticator.validate(req)) {
//        req.setAttribute("userId", 2);
            firstHandler.handleOrRelay(req, resp);
        } else {
            log("failed app login");
        }
    }
}