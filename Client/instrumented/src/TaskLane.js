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
if (! _$jscoverage['src/TaskLane.js']) {
  _$jscoverage['src/TaskLane.js'] = [];
  _$jscoverage['src/TaskLane.js'][2] = 0;
  _$jscoverage['src/TaskLane.js'][13] = 0;
  _$jscoverage['src/TaskLane.js'][14] = 0;
  _$jscoverage['src/TaskLane.js'][15] = 0;
  _$jscoverage['src/TaskLane.js'][16] = 0;
  _$jscoverage['src/TaskLane.js'][17] = 0;
  _$jscoverage['src/TaskLane.js'][18] = 0;
  _$jscoverage['src/TaskLane.js'][20] = 0;
  _$jscoverage['src/TaskLane.js'][27] = 0;
  _$jscoverage['src/TaskLane.js'][33] = 0;
  _$jscoverage['src/TaskLane.js'][34] = 0;
  _$jscoverage['src/TaskLane.js'][35] = 0;
  _$jscoverage['src/TaskLane.js'][37] = 0;
  _$jscoverage['src/TaskLane.js'][39] = 0;
  _$jscoverage['src/TaskLane.js'][42] = 0;
}
_$jscoverage['src/TaskLane.js'].source = ["","<span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">()</span> <span class=\"k\">{</span>","","<span class=\"c\">// var workflow = WoSec.workflow; need late initializiation because of cross dependency</span>","","<span class=\"c\">/**</span>","<span class=\"c\"> * Ein Tasklane-Objekt ist assoziiert mit einer ActivityGroup des BPMN SVG Diagramms.</span>","<span class=\"c\"> * Es verwaltet das zugeh&#195;&#182;rige SVGRectangle, an das Anweisungen zur Darstellung delegiert werden.</span>","<span class=\"c\"> * @param {SVGRectangle} rectangle</span>","<span class=\"c\"> * @param {Array} activityIDs</span>","<span class=\"c\"> * @return {TaskLane}</span>","<span class=\"c\"> */</span>","<span class=\"k\">function</span> newTaskLane<span class=\"k\">(</span>rectangle<span class=\"k\">,</span> activityIDs<span class=\"k\">)</span> <span class=\"k\">{</span>","\t<span class=\"k\">var</span> that <span class=\"k\">=</span> Object<span class=\"k\">.</span>create<span class=\"k\">(</span>WoSec<span class=\"k\">.</span>baseObject<span class=\"k\">);</span>","\t<span class=\"k\">var</span> getTasks <span class=\"k\">=</span> <span class=\"k\">function</span><span class=\"k\">()</span> <span class=\"k\">{</span>","\t\t<span class=\"k\">var</span> tasks <span class=\"k\">=</span> <span class=\"k\">[];</span>","\t\tactivityIDs<span class=\"k\">.</span>forEach<span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">(</span>activityID<span class=\"k\">,</span> index<span class=\"k\">)</span> <span class=\"k\">{</span> ","            tasks<span class=\"k\">[</span>index<span class=\"k\">]</span> <span class=\"k\">=</span> WoSec<span class=\"k\">.</span>workflow<span class=\"k\">.</span>getTaskByID<span class=\"k\">(</span>activityID<span class=\"k\">);</span>","        <span class=\"k\">}</span><span class=\"k\">);</span>","\t\t<span class=\"k\">return</span> tasks<span class=\"k\">;</span>","\t<span class=\"k\">}</span><span class=\"k\">;</span>","\t","\t<span class=\"c\">/**</span>","<span class=\"c\">\t * @see SVGRectangle.highlight</span>","<span class=\"c\">\t * @return {TaskLane} self</span>","<span class=\"c\">\t */</span>","\tthat<span class=\"k\">.</span>highlight <span class=\"k\">=</span> rectangle<span class=\"k\">.</span>highlight<span class=\"k\">;</span>","\t<span class=\"c\">/**</span>","<span class=\"c\">\t * Setzt Informationen f&#195;&#188;r alle Task in der Lane</span>","<span class=\"c\">\t * @param {Object} information</span>","<span class=\"c\">\t * @return {TaskLane} self</span>","<span class=\"c\">\t */</span>","\tthat<span class=\"k\">.</span>setInformation <span class=\"k\">=</span> <span class=\"k\">function</span><span class=\"k\">(</span>information<span class=\"k\">)</span> <span class=\"k\">{</span>","\t\tgetTasks<span class=\"k\">().</span>forEach<span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">(</span>task<span class=\"k\">)</span> <span class=\"k\">{</span>","\t\t\ttask<span class=\"k\">.</span>setInformation<span class=\"k\">(</span>information<span class=\"k\">);</span>","\t\t<span class=\"k\">}</span><span class=\"k\">);</span>","\t\t<span class=\"k\">return</span> <span class=\"k\">this</span><span class=\"k\">;</span>","\t<span class=\"k\">}</span><span class=\"k\">;</span>","\t<span class=\"k\">return</span> that<span class=\"k\">;</span>","<span class=\"k\">}</span>","","WoSec<span class=\"k\">.</span>newTaskLane <span class=\"k\">=</span> newTaskLane<span class=\"k\">;</span>","","<span class=\"k\">}</span><span class=\"k\">());</span>"];
_$jscoverage['src/TaskLane.js'][2]++;
(function () {
  _$jscoverage['src/TaskLane.js'][13]++;
  function newTaskLane(rectangle, activityIDs) {
    _$jscoverage['src/TaskLane.js'][14]++;
    var that = Object.create(WoSec.baseObject);
    _$jscoverage['src/TaskLane.js'][15]++;
    var getTasks = (function () {
  _$jscoverage['src/TaskLane.js'][16]++;
  var tasks = [];
  _$jscoverage['src/TaskLane.js'][17]++;
  activityIDs.forEach((function (activityID, index) {
  _$jscoverage['src/TaskLane.js'][18]++;
  tasks[index] = WoSec.workflow.getTaskByID(activityID);
}));
  _$jscoverage['src/TaskLane.js'][20]++;
  return tasks;
});
    _$jscoverage['src/TaskLane.js'][27]++;
    that.highlight = rectangle.highlight;
    _$jscoverage['src/TaskLane.js'][33]++;
    that.setInformation = (function (information) {
  _$jscoverage['src/TaskLane.js'][34]++;
  getTasks().forEach((function (task) {
  _$jscoverage['src/TaskLane.js'][35]++;
  task.setInformation(information);
}));
  _$jscoverage['src/TaskLane.js'][37]++;
  return this;
});
    _$jscoverage['src/TaskLane.js'][39]++;
    return that;
}
  _$jscoverage['src/TaskLane.js'][42]++;
  WoSec.newTaskLane = newTaskLane;
})();
