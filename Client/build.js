
// 1. Concatenation
// 2. Compression

var fs = require("fs")
,   inspect = require("util").inspect
,   exec = require('child_process').exec;
var jslint = require("./lib/jslint");

var dir = "src/"
,   files = [
    "WoSec.js",
    "View/SVG.js",
    "View/SVGTaskRectangle.js",
    "View/SVGTaskLaneRectangle.js",
    "View/SVGDataAnimation.js",
    "View/HTMLGUI.js",
    "View/Infobox.js",
    "View/TImeSlider.js",
    "Model/MixinObservable.js",
    "Model/Task.js",
    "Model/TaskLane.js",
    "Model/Workflow.js",
    "Model/EventCommands.js",
    "Model/EventChain.js",
    "AjaxUpdaterMockup.js"
];

var code = files.map(function(file) {
    return fs.readFileSync(dir + file, "utf8");
});

code = code.join("\n");

fs.writeFile("build/WoSec.js", code, function(err) {
    err && console.log(err);
    console.log("Verketteten Code gespeichert.");
    exec("java -jar ./bin/compiler.jar --js build/WoSec.js --js_output_file build/WoSec.min.js", function(err, stdout, stderr) {
        err && console.log(err);
        console.log("Kompressierten Code gespeichert.");
    });

});
if (!jslint(code)) {
    console.log("JSLint Report")
    //console.log(jslint.errors);
    console.log(jslint.data());
    console.log("--Ende JSLint Report --\n");
}




