<%@ page language="java" contentType="application/xhtml+xml; charset=utf-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
        <title><%= request.getParameter("title")%></title>
        <link type="text/css" rel="stylesheet" href="media/styles/default.css" />

        <link type="text/css" rel="stylesheet" href="jslib/gui/css/overcast/jquery-ui-1.8.7.custom.css" />
        <!--[if IE ]>
                <link type="text/css" rel="stylesheet" href="media/styles/ie.css" />
        <![endif]-->

            <script type="text/javascript" src="jslib/jquery-1.6.4.js"></script>
    <script type="text/javascript" src="jslib/jquery-ui-1.8.16.custom.js"></script>
        <script type="text/javascript" src="http://192.168.2.113/BA/clickheat/js/clickheat-original.js"></script>
        <script type="text/javascript">
            clickHeatSite = 'WoSec';
            //clickHeatGroup = encodeURIComponent(window.location.pathname+window.location.search);
            clickHeatGroup = '<%=request.getParameter("page") + "_" + request.getParameter("usr") + request.getParameter("additional")%>';
            clickHeatServer = 'http://localhost/BA/clickheat/click.php';
            
            $(document).ready(function() {
                //alert("The DOM is ready!");
                initClickHeat();
            });
            //
        </script>

