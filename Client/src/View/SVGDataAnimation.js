
(function() {
    
var $ = jQuery;

const ANIMATION_IMAGE_PATH = "media/images/fileicon.png" // {width: 34, height: 44}
,	  ANIMATION_IMAGE_SIZE = {width: 25.5, height: 33};


var animationPrototype;
function getAnimationPrototype() {
    if (!animationPrototype) {
        animationPrototype = document.createElementNS('http://www.w3.org/2000/svg', "image");
        animationPrototype.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href", ANIMATION_IMAGE_PATH);
        animationPrototype.setAttribute("width", ANIMATION_IMAGE_SIZE.width);
        animationPrototype.setAttribute("height", ANIMATION_IMAGE_SIZE.height);
    }
    return animationPrototype;
}

/**
 * Erstellt neue Animation mit show(endPosition)-Methode.
 * @param {String} id
 * @param {Object} startPosition Position von der die Animation beginnt
 * @param {Object} endPosition Position bei der die Animation endet
 * @param {Object} position
 */ 
WoSec.SVG.prototype.newDataAnimation = function SVGDataAnimation(id, startPosition, endPosition) {

    function adjustPosition(position) {
        position.x -= ANIMATION_IMAGE_SIZE.width / 2;
        position.y -= ANIMATION_IMAGE_SIZE.height / 2;
        return position;
    }

    startPosition = adjustPosition(startPosition);
    endPosition = adjustPosition(endPosition);

    var that = Object.create(WoSec.baseObject);
    var $svg = this.$svg;
    var icon = getAnimationPrototype().cloneNode(true);
    icon.setAttribute("id", id);
    $svg.find('svg')[0].appendChild(icon);
    var jQueryIcon = $("#" + id);
    jQueryIcon.hide();
    jQueryIcon.attr("x", startPosition.x);
    jQueryIcon.attr("y", startPosition.y);
    /**
     * Zeigt eine Datenanimation
     * @return {SVGTaskRectangle} self
     */
    that.show = function() {
        jQueryIcon.show();
        jQueryIcon.animate({
            svgY : endPosition.y
        }, 2000, function() {
            jQueryIcon.hide();
            jQueryIcon.attr("y", startPposition.y);
        });
        return this;
    };
    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Task} task beobachteter Task
     */
    that.refresh = function(task) {
        switch(task.getState()) {
            case "TransferingData":
                this.show();
                break;
        }
    };
    return that;
};

})();
