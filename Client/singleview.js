
$(function() {

    var correspondingTasks = {
        "__fX4gedbEd-f6JWMxJDGcQ" : "_ggEwYYBxEd-3VeNHLWdQXA",
        "_P2HHwNq2Ed-AhcDaNoYiNA" : "_mJVSMNq2Ed-AhcDaNoYiNA",
        "_mJVSMNq2Ed-AhcDaNoYiNA" : "_P2HHwNq2Ed-AhcDaNoYiNA",
        "_WwJSsMpEEd-l67V0iNGzSg" : "_EdDTcOdcEd-f6JWMxJDGcQ",
        "_EdDTcOdcEd-f6JWMxJDGcQ" : "_WwJSsMpEEd-l67V0iNGzSg",
        "_apOasOdcEd-f6JWMxJDGcQ" : "_zh-fUMpEEd-l67V0iNGzSg",
        "_zh-fUMpEEd-l67V0iNGzSg" : "_apOasOdcEd-f6JWMxJDGcQ",
        "_KtB5UM1pEd-E28gUOy1WVQ" : "_VDEZ0OHSEd-In4HYDc8LtQ",
        "_VDEZ0OHSEd-In4HYDc8LtQ" : "_KtB5UM1pEd-E28gUOy1WVQ",
        "_aazjsIIQEd-Ik-oRjTK6iQ" : "_mK9YgOdcEd-f6JWMxJDGcQ",
        "_mK9YgOdcEd-f6JWMxJDGcQ" : "_aazjsIIQEd-Ik-oRjTK6iQ",
        "_3OFh0IIQEd-Ik-oRjTK6iQ" : "_6P8wUIIQEd-Ik-oRjTK6iQ",
        "_6P8wUIIQEd-Ik-oRjTK6iQ" : "_3OFh0IIQEd-Ik-oRjTK6iQ",
        "_r0zOcMrXEd-l67V0iNGzSg" : "_JFuHsOdcEd-f6JWMxJDGcQ",
        "_JFuHsOdcEd-f6JWMxJDGcQ" : "_r0zOcMrXEd-l67V0iNGzSg"
    };
    var tasksInALane = {
        "_7kTKEOdbEd-f6JWMxJDGcQ" : ["__fX4gedbEd-f6JWMxJDGcQ", "_ggEwYYBxEd-3VeNHLWdQXA", "_WwJSsMpEEd-l67V0iNGzSg", "_EdDTcOdcEd-f6JWMxJDGcQ", "_zwzUUMraEd-l67V0iNGzSg", "_r0zOcMrXEd-l67V0iNGzSg"],
        "_1UFV4ItpEd-U-Z7QjvIBEA" : ["_P2HHwNq2Ed-AhcDaNoYiNA", "_VDEZ0OHSEd-In4HYDc8LtQ", "_KtB5UM1pEd-E28gUOy1WVQ", "_mJVSMNq2Ed-AhcDaNoYiNA"],
        "_BCoSEIBxEd-3VeNHLWdQXA" : ["_apOasOdcEd-f6JWMxJDGcQ", "_zh-fUMpEEd-l67V0iNGzSg", "_aazjsIIQEd-Ik-oRjTK6iQ", "_mK9YgOdcEd-f6JWMxJDGcQ"],
        "_Bdcl0IBxEd-3VeNHLWdQXA" : ["_3OFh0IIQEd-Ik-oRjTK6iQ", "_6P8wUIIQEd-Ik-oRjTK6iQ"]
    };
    
    var workflow = WoSec.newWorkflow("_BCoSEIBxEd-3VeNHLWdQXA", correspondingTasks, tasksInALane);
    var eventChain = WoSec.newEventChain(workflow);
    var gui = new WoSec.HTMLGUI([eventChain]);
    
    
    new WoSec.AJAXUpdater(eventChain, 0, gui);

});