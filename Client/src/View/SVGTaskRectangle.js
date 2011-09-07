
(function() {

var $ = jQuery;

const CSS_ID_COLORSTORE = 'color-store'
,	  CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR = 'rect-unobtrusive'
,     CSS_ID_COLORSTORE_OBTRUSIVE_COLOR = 'rect-obtrusive'
,     CSS_ID_COLORSTORE_RESET_COLOR = 'rect-reset';

function getJQuerySVGRectanglesByActivityID($svg, activityID) {
    return $svg.find('svg rect').filter(function() {
        return $(this).attr('bpmn:activity-id') == activityID;// && $(this).attr('fill') == 'white';
    });
}
    
function getJQuerySVGCircles($svg, activityID) {
    return $svg.find('svg circle').filter(function() {
        return $(this).attr('bpmn:activity-id') == activityID;// && $(this).attr('fill') == 'white';
    });
}


var taskRectangleRepository = {};
WoSec.SVG.prototype.getTaskRectangle = function(activityID) {
    if(!taskRectangleRepository[activityID]) {
        taskRectangleRepository[activityID] = this.newTaskRectangle(activityID);
    }
    return taskRectangleRepository[activityID];
}

/**
 * Bietet Zugriff und Manipulationsmöglichkeiten auf ein Task-Rechteck im SVG.
 * @param {String} activityID
 * @return {SVGTaskRectangle} neues SVGTaskRechteck
 */
WoSec.SVG.prototype.newTaskRectangle = function SVGTaskRectangle(activityID) {
    
    var $svg = this.$svg;

    var rectangles = getJQuerySVGRectanglesByActivityID($svg, activityID);
    if(!rectangles.length) {
        rectangles = getJQuerySVGCircles($svg, activityID);
    }
    if(rectangles.length == 0) {
        throw new Error("No rectangles/circles with activityID:[" + activityID + "] found");
    }
    var that = Object.create(WoSec.baseObject);

    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Task} task beobachteter Task
     */
    that.refresh = function(task) {
        switch (task.getState()) {
            case "Reset":
                this.reset();
                break;
            case "Started":
                this.markObtrusive();
                this.highlight();
                break;
            case "Finished":
                this.markUnobtrusive();
                break;
        }
    };
    /**
     * Gibt die Position des Rechtecks zurück.
     * @return {Object} Position mit x,y,width und height- Eigenschaften (Integer), sowie getCenter()-Methode, welche den Mittelpunkt des Rechtecks zurück gibt
     */
    that.getPosition = function() {
        return {
            x : parseInt($(rectangles[0]).attr("x")),
            y : parseInt($(rectangles[0]).attr("y")),
            width : parseInt($(rectangles[0]).attr("width")),
            height : parseInt($(rectangles[0]).attr("height")),
            getCenter : function() {
                return {
                    x : this.x + this.width / 2,
                    y : this.y + this.height / 2
                };
            }
        }
    };
    var texts = $svg.find("svg text").filter(function() {
        var pos = that.getPosition();
        return Math.abs(parseInt($(this).attr('x')) - pos.x) < pos.width
            && Math.abs(parseInt($(this).attr('y')) - pos.y) < pos.height;
    });
    /**
     * Hebt das Rechteck hervor
     * @return {SVGRectangle} self
     */
    that.highlight = function() {
        rectangles.each(function() {
            $(this).effect('pulsate', {
                times : 3
            }, 1000);
        })
        return this;
    };
    /**
     * Färbt das Rechteck in einer auffälligen Farbe.
     * @return {SVGRectangle} self
     */
    that.markObtrusive = function() {
        rectangles.each(function() {
            $(this).attr('fill', $('#' + CSS_ID_COLORSTORE_OBTRUSIVE_COLOR).css('color'));
        });
        return this;
    };
    /**
     * Färbt das Rechteck in einer unauffälligen Farbe.
     * @return {SVGRectangle} self
     */
    that.markUnobtrusive = function() {
        rectangles.each(function() {
            $(this).attr('fill', $('#' + CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR).css('color'));
        });
        return this;
    };
    /**
     * Setzt das Rechteck zurück (farblich)
     * @return {SVGRectangle} self
     */
    that.reset = function() {
        rectangles.each(function() {
            $(this).attr('fill', $('#' + CSS_ID_COLORSTORE_RESET_COLOR).css('color'));
        });
        return this;
    };
    /**
     * Registriert Eventhandler für das OnClick-Event des Rechtecks.
     * @param {Function} handler Der zu bindende Eventhandler
     * @return {SVGRectangle} self
     */
    that.registerOnClick = function(handler) {
        $(rectangles[0]).click(handler);
        texts.each(function() {
            $(this).click(handler);
        })
        return this;
    };
    /**
     * Registriert Eventhandler für as OnHover-Event des Rechtecks.
     * @param {Function} handler Der zu bindende Eventhandler
     * @return {SVGRectangle} self
     */
    that.registerOnHover = function(handler) {
        $(rectangles[0]).hover(handler);
        texts.each(function() {
            $(this).hover(handler);
        })
        return this;
    };

    return that;
};

})();
