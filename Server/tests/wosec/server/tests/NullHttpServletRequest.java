package wosec.server.tests;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.*;

import javax.servlet.*;
import javax.servlet.http.*;

/**
 * NullObjekt zum Simulieren einer HTTP-Anfrage
 * 
 * Quelle: http://www.jguru.com/faq/view.jsp?EID=110660
 */
public class NullHttpServletRequest implements HttpServletRequest {
	public Hashtable parameters = new Hashtable();

	public void setParameter(String key, String value) {
		parameters.put(key, value);
	}

	public String getParameter(String key) {
		return (String) this.parameters.get(key);
	}

	public Enumeration getParameterNames() {
		return this.parameters.elements();
	}

	public Cookie[] getCookies() {
		return null;
	}

	public String getMethod() {
		return null;
	}

	public String getRequestURI() {
		return null;
	}

	public String getServletPath() {
		return null;
	}

	public String getPathInfo() {
		return null;
	}

	public String getPathTranslated() {
		return null;
	}

	public String getQueryString() {
		return null;
	}

	public String getRemoteUser() {
		return null;
	}

	public String getAuthType() {
		return null;
	}

	public String getHeader(String name) {
		return null;
	}

	public int getIntHeader(String name) {
		return 0;
	}

	public long getDateHeader(String name) {
		return 0;
	}

	public Enumeration getHeaderNames() {
		return null;
	}

	public HttpSession getSession(boolean create) {
		return null;
	}

	public String getRequestedSessionId() {
		return null;
	}

	public boolean isRequestedSessionIdValid() {
		return false;
	}

	public boolean isRequestedSessionIdFromCookie() {
		return false;
	}

	public boolean isRequestedSessionIdFromUrl() {
		return false;
	}

	public int getContentLength() {
		return 0;
	}

	public String getContentType() {
		return null;
	}

	public String getProtocol() {
		return null;
	}

	public String getScheme() {
		return null;
	}

	public String getServerName() {
		return null;
	}

	public int getServerPort() {
		return 0;
	}

	public String getRemoteAddr() {
		return null;
	}

	public String getRemoteHost() {
		return null;
	}

	public String getRealPath(String path) {
		return null;
	}

	public ServletInputStream getInputStream() throws IOException {
		return null;
	}

	public String[] getParameterValues(String name) {
		return null;
	}

	public Enumeration getAttributeNames() {
		return null;
	}

	public Object getAttribute(String name) {
		return null;
	}

	public HttpSession getSession() {
		return null;
	}

	public BufferedReader getReader() throws IOException {
		return null;
	}

	public String getCharacterEncoding() {
		return null;
	}

	public void setAttribute(String name, Object o) {
	}

	public boolean isRequestedSessionIdFromURL() {
		return false;
	}

	@Override
	public Enumeration getLocales() {
		return null;
	}

	@Override
	public String getLocalAddr() {
		return null;
	}

	@Override
	public String getLocalName() {
		return null;
	}

	@Override
	public int getLocalPort() {
		return 0;
	}

	@Override
	public Locale getLocale() {
		return null;
	}

	@Override
	public Map getParameterMap() {
		return null;
	}

	@Override
	public int getRemotePort() {
		return 0;
	}

	@Override
	public RequestDispatcher getRequestDispatcher(String arg0) {
		return null;
	}

	@Override
	public boolean isSecure() {
		return false;
	}

	@Override
	public void removeAttribute(String arg0) {

	}

	@Override
	public void setCharacterEncoding(String arg0) throws UnsupportedEncodingException {

	}

	@Override
	public String getContextPath() {
		return null;
	}

	@Override
	public Enumeration getHeaders(String arg0) {
		return null;
	}

	@Override
	public StringBuffer getRequestURL() {
		return null;
	}

	@Override
	public Principal getUserPrincipal() {
		return null;
	}

	@Override
	public boolean isUserInRole(String arg0) {
		return false;
	}

	public NullHttpServletRequest(Hashtable parameters) {
		this.parameters = parameters;
	}

	public NullHttpServletRequest() {
	}
}