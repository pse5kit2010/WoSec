package wosec.server.controllers.eventhandling;

import javax.servlet.http.HttpServletRequest;

public interface IAuthentication {

	public boolean validate(HttpServletRequest aRequest);
}