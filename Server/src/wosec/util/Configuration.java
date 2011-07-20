package wosec.util;

import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.Properties;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

/**
 * Utility-Klasse zum komfortablen Auslesen gespeicherter Konfigurationswerte.
 * 
 * @author david
 */
public final class Configuration extends HttpServlet {
	private final String configFileName = "wosec-config.xml";
	private static Properties props;

	/**
	 * Hiermit werden die geladenen Eigenschaften abgefragt.
	 */
	public static Properties getProperties() {
		return props;
	}

	@Override
	public void init(ServletConfig config) throws ServletException {
		// Vollständigen Pfad zu wosec-config.xml ermitteln
		String configFile = Thread.currentThread().getContextClassLoader().getResource(configFileName).getFile();
		try {
			// Dateinamen dekodieren, da dieser noch URL-kodiert ist:
			configFile = URLDecoder.decode(configFile, "UTF-8");
			// Lade Konfiguration
			InputStream is = new FileInputStream(configFile);
			props = new Properties();
			props.loadFromXML(is);
		} catch (Exception e) {
			System.err.println("Fatal error: WoSec initialization failed while loading configuration file. "
					+ e.getMessage());
		}
	}
}
