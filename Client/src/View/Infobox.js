
(function() {

var $ = jQuery;

const CSS_ID_INFOBOXES = "infoboxes"
,     CSS_CLASS_INFOBOX = "infobox"
,     CSS_CLASS_INFOBOX_PARTICIPANT = "infobox-participant"
,     CSS_CLASS_INFOBOX_DATA = "infobox-data"
,     INFOBOX_HIDE_DELAY_MS = 3000;


var infoboxPrototype; // lazy creation when DOM ready
function getInfoboxPrototype(){
    if (!infoboxPrototype) {
        infoboxPrototype = $('<div class="' + CSS_CLASS_INFOBOX + '">' +
            '<div class="' +
                 CSS_CLASS_INFOBOX_PARTICIPANT +
            '"></div>' +
            '<div class="' +
                CSS_CLASS_INFOBOX_DATA +
            '"></div>' +
        '</div>').hide();
    }
    return infoboxPrototype;
}


/**
 * Stellt die Informationsfläche dar, die beim Klicken bzw. Überfahren eines Tasks mit der Maus erscheint.
 * @param {Position} position Position
 * @return {Infobox} neue Infobox
 */
WoSec.HTMLGUI.prototype.newInfobox = function Infobox(position) {
    var infobox = getInfoboxPrototype().clone().appendTo("#" + CSS_ID_INFOBOXES);
    var empty = true;

    infobox.css("top", position.y + position.height);
    infobox.css("left", position.x + position.width);

    function setParticipant(participant) {
        infobox.find("." + CSS_CLASS_INFOBOX_PARTICIPANT).text(participant);
    }

    function setData(data) {
        infobox.find("." + CSS_CLASS_INFOBOX_DATA).text(data);
    }

    var shown = false;
    
    return {
        notify: function(task) {
            this.setContent(task.getInformation());
        },
        /**
         * Zeigt die Informationsfläche.
         */
        show: function() {
            if(!shown) {
                infobox.slideToggle("slow");
                shown = true;
            }
            return this;
        },
        /**
         * Verbirgt die Informationsfläche.
         */
        hide: function() {
            if(shown) {
                infobox.slideToggle("slow");
                shown = false;
            }
            return this;
        },
        /**
         * Setzt den Inhalt (User/Provider sowie Daten) der Infobox
         * @param {Object} information
         * @return {Infobox} self
         */
        setContent: function(information) {
            if(information.participant && information.participant != "") {
                setParticipant(information.participant);
                empty = false;
            }
            if(information.data && information.data != "") {
                setData(information.data);
                databox.add(information.data);
                empty = false;
            }
            return this;
        }
        /* *
         * Bindet die Infobox an ein Rechteck im SVG.
         * @param {SVGRectangle} rectangle Rechteck im SVG
         * @return {Infobox} self
         * /
         bindToSVGRectangle: function(rectangle) {
    
         var showInfobox = false;
         var inside = false;
         var onClickHandler = function() {
         if (!showInfobox) {
         showInfobox = true;
         } else {
         infobox.slideToggle("slow");
         showInfobox = false;
         }
         return false;
         };
         var onHoverHandler = function() {
         if (!showInfobox && !inside && !empty) {
         inside = true;
         infobox.slideToggle("slow");
         setTimeout(function() {
         if (!showInfobox) {
         infobox.slideToggle("slow");
         }
         inside = false;
         }, INFOBOX_HIDE_DELAY_MS);
         }
         return false;
         };
    
         infobox.click(onClickHandler);
         return this;
         },*/
    };
}

})();