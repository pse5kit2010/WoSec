package wosec.server.controllers.eventhandling;

import java.util.Arrays;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Stellt einen EventHandler dar.
 * 
 * @author David
 */
public abstract class EventHandler {
	protected EventHandler next = null;
	private String[] validEvents = {};

	/**
	 * Falls das in req übergebene Event (Parameter "eventType") einem Typ
	 * entspricht, den dieser Handler bearbeiten kann (siehe Konstruktor), wird
	 * handle() aufgerufen, ansonsten wird die Verarbeitung an den nächsten
	 * Handler delegiert, sofern ein solcher existiert.
	 * 
	 * @param req
	 *            Anfrage, deren Parameter die Daten des zu verarbeitenden
	 *            Events enthalten.
	 */
	public final void handleOrRelay(HttpServletRequest req, HttpServletResponse resp) {
		String eventType = req.getParameter("eventType");
		// Falls nicht spezifiziert wurde, um was für ein Event es sich handelt,
		// breche ab:
		if (eventType == null)
			return;

		// Falls dieser Handler für den übergebenen Eventtyp zuständig ist:
		if (Arrays.asList(validEvents).contains(eventType)) {
			// Verarbeite das Event:
			handle(eventType, req, resp);
			// Ansonsten, falls es einen Nachfolger gibt...
		} else if (next != null) {
			// ... überlasse diesem die Verarbeitung:
			next.handleOrRelay(req, resp);
		}
	}

	/**
	 * Hier ist die konkrete Verarbeitungslogik für das in req übergebene Event
	 * zu implementieren.
	 * 
	 * @param eventType
	 *            der Typ des übergebenen Events (ermittelt aus
	 *            req.getParameter("eventType"))
	 * @param req
	 *            siehe handleOrRelay()
	 */
	protected abstract void handle(String eventType, HttpServletRequest req, HttpServletResponse resp);

	/**
	 * Erzeugt einen neuen EventHandler und speichert eine Referenz auf seinen
	 * Nachfolger, nextHandler.
	 * 
	 * @param nextHandler
	 *            Nachfolger dieses EventHandlers, der aufgerufen werden soll,
	 *            falls dieser Handler nicht für die Verarbeitung zuständig ist.
	 * @param validEventTypes
	 *            Eine Liste von Eventtypen, die dieser Handler verarbeiten
	 *            kann.
	 */
	public EventHandler(EventHandler nextHandler, String[] validEventTypes) {
		next = nextHandler;
		validEvents = validEventTypes;
	}
}