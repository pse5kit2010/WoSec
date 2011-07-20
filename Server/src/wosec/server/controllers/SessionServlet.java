package wosec.server.controllers;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * SessionServlet ist eine abstrakte Klasse, die dafür verantwortlich ist, die
 * von ihr abgeleiteten servlets nur eingeloggten Benutzern verfügbar zu machen.
 */
@SuppressWarnings("serial")
public abstract class SessionServlet extends HttpServlet {
	/**
	 * Diese Methode prüft, ob der Anwender im System angemeldet ist. Ist dies
	 * nicht der Fall, wird die Anfrage automatisch auf die Login-Seite
	 * weitergeleitet.
	 * 
	 * Quelle: // Quelle:
	 * http://stackoverflow.com/questions/1026846/how-to-redirect
	 * -to-login-page-when-session-is-expired-in-java-web-application
	 */
	private boolean checkLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
		// Get current session, if any
		HttpSession session = ((HttpServletRequest) request).getSession(false);
		if (session == null || session.isNew() || session.getAttribute("user") == null) {
			// Session has expired - redirect to login page
			response.sendRedirect("Login.jsp");
			return false;
		}
		return true;
	}

	/***
	 * Prüft, ob ein Nutzer angemeldet ist.
	 */
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
			java.io.IOException {
		if(checkLogin(req, resp))
			super.service(req, resp);
	}
}
