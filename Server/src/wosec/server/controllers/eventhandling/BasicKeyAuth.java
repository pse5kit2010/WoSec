package wosec.server.controllers.eventhandling;

import javax.servlet.http.HttpServletRequest;

public class BasicKeyAuth implements IAuthentication {
	public final static String KEY = "AHDEFG";
	
	public boolean validate(HttpServletRequest req) {
		return req.getParameter("key") != null && req.getParameter("key").equals(KEY);
	}
}