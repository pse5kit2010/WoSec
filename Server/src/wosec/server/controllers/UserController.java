package wosec.server.controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hibernate.HibernateException;
import org.hibernate.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import wosec.server.model.User;
import wosec.util.Configuration;
import wosec.util.HashGenerator;

/**
 * Diese Klasse nimmt alle Browseranfragen entgegen in denen der Benutzer sich
 * einloggen, ausloggen bzw sein Passwort ändert will
 */
public class UserController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Diese Methode überprüft ob der eingegebene Benutzername in der Datenbank
	 * vorhanden ist und falls ja ob das dazugehörige Passwort mit dem
	 * eingegebenen übereinstimmt. Je nach Auswertung wird eine Fehlermeldung
	 * ausgegeben oder an die Übersichtsseite des Benutzers weitergeleitet
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param response
	 *            HttpServletResponse
	 * @throws IOException
	 *             wird gegebenenfalls beim Weiterleiten an eine jsp-Seite
	 *             geworfen
	 * @throws IOException
	 * @throws ServletException
	 */
	private void login(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		Transaction tx = null;
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		try {
			tx = session.beginTransaction();

			User user = (User) session.createQuery("from User where identifier = ?").setString(0, username)
					.uniqueResult();
			String passHash = HashGenerator.SHA256(password);
			if (user == null || user.getPasswordHash() == null || !user.getPasswordHash().equals(passHash)) {
				// Benutzer nicht in Datenbank oder kein Passwort oder falsches Passwort:
				request.setAttribute("error", Configuration.getProperties().getProperty("LoginFailedErrorMessage"));
				request.getRequestDispatcher("Login.jsp").forward(request, response);
				return;
			} else {
				// Login erfolgreich:
				HttpSession httpsession = request.getSession(true);
				httpsession.setAttribute("user", user);
				response.sendRedirect("InstancesController");
			}
			tx.commit();
		} catch (Exception e) {
			if (tx != null && tx.isActive()) {
				try {
					tx.rollback();
				} catch (HibernateException e3) {
					System.out.println("Error rolling back transaction");
				}
			}
		}
	}

	/**
	 * Diese Methode loggt den angemeldeten Benutzer aus
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param response
	 *            HttpServletResponse
	 * @throws IOException
	 *             wird gegebenenfalls beim Weiterleiten an die Login.jsp
	 *             geworfen
	 */
	private void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession httpsession = ((HttpServletRequest) request).getSession(false);
		httpsession.invalidate();
		response.sendRedirect("Login.jsp");
	}

	/**
	 * Diese Methode wird aufgerufen falls die Passwortänderungsseite angezeigt
	 * werden soll oder wenn ein neues Passwort angelegt werden soll. Je nachdem
	 * wird beim ersten Fall einfach die Passwortänderungsseite angezeigt und im
	 * zweiten Fall werden die übermittelnden Passworte überprüft und je nach
	 * dem eine Meldung ausgegeben.
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param response
	 *            HttpServletResponse
	 */
	private void password(HttpServletRequest request, HttpServletResponse response) {

	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String action = request.getParameter("action");
		if (action != null) {

			if (action.equals("login")) {
				login(request, response);
			} else if (action.equals("logout")) {
				logout(request, response);
			} else if (action.equals("passwordChange")) {
				password(request, response);

			}
		} else {
			request.getRequestDispatcher("Login.jsp").forward(request, response);
		}

	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
			IOException {
		doGet(request, response);
	}
}
