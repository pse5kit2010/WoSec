package wosec.server.controllers;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Der InstancesController leitet zur Übersicht aller Instanzen weiter
 */
public class InstancesController extends SessionServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.getRequestDispatcher("AllInstances.jsp").forward(request, response);
	}
}
