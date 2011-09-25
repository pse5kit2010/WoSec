$(function(){
    var POLL_URL = "UpdateController?type=Instance";
	var SINGLE_INSTANCE_LINK = "SingleInstanceController?instance=";
    if (typeof Array.prototype.forEach !== 'function') {
        Array.prototype.forEach = function(callback)//[, thisObject])
        {
            var len = this.length;
            if (typeof callback != "function") 
                throw new TypeError();
            
            var thisObject = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in this) 
                    callback.call(thisObject, this[i], i, this);
            }
        };
    }
	
	function prettyDateDiff(since) {
        var diff = (((new Date()).getTime() - since * 1000) / 1000)
        ,   day_diff = Math.floor(diff / 86400);
        if ( isNaN(day_diff) || day_diff <0)
                return;
		var date = new Date(since * 1000);
        return '<span title="' + date.getDay() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + '">' + (day_diff == 0 && (
                        diff <60 && "gerade eben" ||
                        diff <120 && "vor einer Minute" ||
                        diff <3600 && "vor " + Math.floor( diff / 60 ) + " Minuten" ||
                        diff <7200 && "vor einer Stunde" ||
                        diff <86400 && "vor " + Math.floor( diff / 3600 ) + " Stunden") ||
                day_diff == 1 && "Gestern" ||
                day_diff <7 && "vor " + day_diff + " Tagen" ||
				day_diff <14 && "vor einer Woche" ||
                day_diff <31 && "vor " + Math.ceil( day_diff / 7 ) + " Wochen" ||
			    day_diff <2*365 && "vor einem Jahr" ||
				"vor " + Math.ceil( day_diff / 365 ) + " Jahren")  + '</span>';
	}
	
	var prettyEvent = {
		"terminateInstance": "Instanz beendet",
		"createInstance": "Instanz gestartet",
		"humanActivityExecuted": "Aktivität (Human-Task) wurde ausgeführt",
		"eventActivityExecuted": "Aktivität (Event) wurde ausgeführt",
        "WSActivityExecuted": "Aktivität (Webservice-Aufruf) wurde ausgeführt",
		"WSProviderSelected": "Anbieter ausgewählt",
		"startActivityExecution": "Aktivität unmittelbar vor Ausführung",
		"DataTransferredToWS": "Übertragung von Daten an Webservice",
		"DataTransferredFromWS": "Rückgabe von Daten von einem Webservice",
		"HumanTaskExecutorSelected": "Benutzer für Aktivität ausgewählt",
        "DataTransferredToHuman": "Übertragung von Daten an Menschen",
        "DataTransferredFromHuman": "Eingabe von Daten durch Menschen"
	};
    
    var overview = (function(){
        var instances = {};
        var instancestable = $("#instancestable");
        var entryPrototype = $("<tr><td>Instanz starten: <a/></td><td/><td/><td/></tr>");
        function newInstance(data){
            var that = {};
            var entry = entryPrototype.clone();
            var tds = entry.find("td");
            
            that.update = function(data){
                $(tds[0]).find("a").attr("href", SINGLE_INSTANCE_LINK + data.id).text(data.id);
                $(tds[1]).text(data.workflowName);
                $(tds[2]).html(prettyDateDiff(data.create));
                $(tds[3]).html(prettyEvent[data.lastEvent] + " " + prettyDateDiff(data.finished));
				if (data.lastEvent == "terminateInstance") {
					entry.addClass("finished-instance");
				}
            }
            entry.hide();
            instancestable.append(entry);
			that.update(data);
			entry.fadeIn();
			entry.css("display", "table-row");
            return that;
        }
        
        return {
            update: function(data){
                data.forEach(function(instancedata){
                    if (!instances[instancedata.id]) {
                        instances[instancedata.id] = newInstance(instancedata);
                    }
                    else {
                        instances[instancedata.id].update(instancedata);
                    }
                });
            }
        };
    }());
    
    var ajaxUpdater = (function(){
        /*var $ = {
            getJSON: function(mock, it, callback){
                callback([{
                    id: "123",
                    workflowName: "Praktikumsvermittlung",
                    create: 1200004338,
                    finished: 1296154338,
                    lastEvent: "terminateInstance"
                }]);
            }
        }; //*/
        return {
            init: function loop(){
                $.getJSON(POLL_URL, {}, function(data){
                    overview.update(data);
                });
                setTimeout(loop, 5000);
                return this;
            }
        };
    }()).init();
});
