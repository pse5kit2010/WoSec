
(function() {

var $ = jQuery;

function getJQuerySVGRectanglesByActivityGroupID($svg, activityGroupID) {
    return $svg.find('svg rect').filter(function() {
       return $(this).attr('bpmn:pool-id') == activityGroupID;
    });
}


/**
 * Bietet Hervorheben-Effekt für ein TaskLane-Rechteck im SVG.
 * @param {String} activityGroupID
 * @return {SVGTaskLaneRectangle} SVGRechteck, das nur das Hervorheben unterstützt
 */
WoSec.SVG.prototype.newTaskLaneRectangle = function SVGTaskLaneRectangle(activityGroupID) {
    
    var $svg = this.$svg;
    
    var jQueryRectangles = getJQuerySVGRectanglesByActivityGroupID($svg, activityGroupID);
    var that = Object.create(WoSec.baseObject);
    
    var enableAnimations = true;
    /**
     * Deaktiviert Animationen
     */
    that.disableAnimations = function() {
        enableAnimations = false;
        return this;
    };
    /**
     * Aktiviert Animationen
     */
    that.enableAnimations = function() {
        enableAnimations = true;
        return this;
    };
    
    /**
     * @see SVGTaskRectangle.highlight
     */
    that.highlight = function() {
        jQueryRectangles.each(function() {
            $(this).effect('pulsate', {
                times : 1
            }, 1000);
        });
    };
    /**
     * Aktualisiere-Methode des Beobachter Musters
     */
    that.refresh = function() {
        if (enableAnimations) {
            this.highlight();
        }
    };

    return that;
};


})();