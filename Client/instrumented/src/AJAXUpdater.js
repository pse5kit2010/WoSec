/* automatically generated by JSCoverage - do not edit */
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    _$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (typeof _$jscoverage !== 'object') {
  _$jscoverage = {};
}
if (! _$jscoverage['src/AJAXUpdater.js']) {
  _$jscoverage['src/AJAXUpdater.js'] = [];
  _$jscoverage['src/AJAXUpdater.js'][6] = 0;
  _$jscoverage['src/AJAXUpdater.js'][7] = 0;
  _$jscoverage['src/AJAXUpdater.js'][8] = 0;
  _$jscoverage['src/AJAXUpdater.js'][10] = 0;
  _$jscoverage['src/AJAXUpdater.js'][11] = 0;
  _$jscoverage['src/AJAXUpdater.js'][12] = 0;
  _$jscoverage['src/AJAXUpdater.js'][14] = 0;
  _$jscoverage['src/AJAXUpdater.js'][19] = 0;
  _$jscoverage['src/AJAXUpdater.js'][20] = 0;
  _$jscoverage['src/AJAXUpdater.js'][21] = 0;
  _$jscoverage['src/AJAXUpdater.js'][22] = 0;
  _$jscoverage['src/AJAXUpdater.js'][25] = 0;
}
_$jscoverage['src/AJAXUpdater.js'].source = ["","<span class=\"c\">/**</span>","<span class=\"c\"> * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).</span>","<span class=\"c\"> * Empfangene Eventdaten werden an die EventChain weitergegeben.</span>","<span class=\"c\"> */</span>","WoSec<span class=\"k\">.</span>ajaxUpdater <span class=\"k\">=</span> <span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">()</span> <span class=\"k\">{</span>","\t<span class=\"k\">var</span> DELAY_BETWEEN_POLLS <span class=\"k\">=</span> <span class=\"s\">5000</span><span class=\"k\">;</span>","\t<span class=\"k\">var</span> POLL_URL <span class=\"k\">=</span> <span class=\"s\">\"UpdateController?type=Event\"</span><span class=\"k\">;</span>","\t","\t<span class=\"k\">var</span> $ <span class=\"k\">=</span> jQuery<span class=\"k\">;</span>","    <span class=\"k\">var</span> eventChain <span class=\"k\">=</span> WoSec<span class=\"k\">.</span>eventChain<span class=\"k\">;</span>","\t<span class=\"k\">var</span> workflow <span class=\"k\">=</span> WoSec<span class=\"k\">.</span>workflow<span class=\"k\">;</span>","\t","    <span class=\"k\">return</span> <span class=\"k\">{</span>","\t\t<span class=\"c\">/**</span>","<span class=\"c\">\t\t * Startet den Abfrageprozess.</span>","<span class=\"c\">\t\t */</span>","        init<span class=\"k\">:</span> <span class=\"k\">function</span> loop<span class=\"k\">(</span>lastVisitedTimestamp<span class=\"k\">)</span> <span class=\"k\">{</span>","\t\t\tlastVisitedTimestamp <span class=\"k\">=</span> lastVisitedTimestamp <span class=\"k\">||</span> <span class=\"s\">0</span><span class=\"k\">;</span>\t","\t\t\t$<span class=\"k\">.</span>getJSON<span class=\"k\">(</span>POLL_URL<span class=\"k\">,</span> <span class=\"k\">{</span>since<span class=\"k\">:</span> eventChain<span class=\"k\">.</span>last<span class=\"k\">().</span>getTimestamp<span class=\"k\">()</span> <span class=\"k\">+</span> <span class=\"s\">1</span><span class=\"k\">,</span> instance<span class=\"k\">:</span> workflow<span class=\"k\">.</span>getInstanceID<span class=\"k\">()</span><span class=\"k\">}</span><span class=\"k\">,</span> <span class=\"k\">function</span><span class=\"k\">(</span>data<span class=\"k\">)</span> <span class=\"k\">{</span>","\t\t\t\teventChain<span class=\"k\">.</span>add<span class=\"k\">(</span>data<span class=\"k\">).</span>seek<span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">(</span>eventCommand<span class=\"k\">)</span> <span class=\"k\">{</span>","\t\t\t\t\t<span class=\"k\">return</span> eventCommand<span class=\"k\">.</span>getTimestamp<span class=\"k\">()</span> <span class=\"k\">&lt;=</span> lastVisitedTimestamp<span class=\"k\">;</span> <span class=\"c\">// seek forward until the timestamp is newer than the lastVisited</span>","\t\t\t\t<span class=\"k\">}</span><span class=\"k\">).</span>play<span class=\"k\">();</span>","\t\t\t<span class=\"k\">}</span><span class=\"k\">);</span>","\t\t\tsetTimeout<span class=\"k\">(</span>loop<span class=\"k\">,</span> DELAY_BETWEEN_POLLS<span class=\"k\">);</span>","\t\t<span class=\"k\">}</span>","    <span class=\"k\">}</span><span class=\"k\">;</span>","<span class=\"k\">}</span><span class=\"k\">());</span>"];
_$jscoverage['src/AJAXUpdater.js'][6]++;
WoSec.ajaxUpdater = (function () {
  _$jscoverage['src/AJAXUpdater.js'][7]++;
  var DELAY_BETWEEN_POLLS = 5000;
  _$jscoverage['src/AJAXUpdater.js'][8]++;
  var POLL_URL = "UpdateController?type=Event";
  _$jscoverage['src/AJAXUpdater.js'][10]++;
  var $ = jQuery;
  _$jscoverage['src/AJAXUpdater.js'][11]++;
  var eventChain = WoSec.eventChain;
  _$jscoverage['src/AJAXUpdater.js'][12]++;
  var workflow = WoSec.workflow;
  _$jscoverage['src/AJAXUpdater.js'][14]++;
  return ({init: (function loop(lastVisitedTimestamp) {
  _$jscoverage['src/AJAXUpdater.js'][19]++;
  lastVisitedTimestamp = (lastVisitedTimestamp || 0);
  _$jscoverage['src/AJAXUpdater.js'][20]++;
  $.getJSON(POLL_URL, {since: (eventChain.last().getTimestamp() + 1), instance: workflow.getInstanceID()}, (function (data) {
  _$jscoverage['src/AJAXUpdater.js'][21]++;
  eventChain.add(data).seek((function (eventCommand) {
  _$jscoverage['src/AJAXUpdater.js'][22]++;
  return (eventCommand.getTimestamp() <= lastVisitedTimestamp);
})).play();
}));
  _$jscoverage['src/AJAXUpdater.js'][25]++;
  setTimeout(loop, DELAY_BETWEEN_POLLS);
})});
})();