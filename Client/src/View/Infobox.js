
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
    var pinned = false;
    
    var that = Object.create(WoSec.baseObject);
    
    return WoSec.extend(that, {
        /**
         * Aktualisiere-Methode des Beobachter Musters
         * @param {Task} task beobachteter Task
         */
        refresh: function(task) {
            this.setContent(task.getInformation());
        },
        /**
         * Zeigt die Informationsfläche.
         * Versteckt sich wieder automatisch nach ein paar Sekunden
         */
        show: function() {
            if(!shown && !empty) {
                infobox.slideToggle("slow");
                shown = true;
                that.later(INFOBOX_HIDE_DELAY_MS, "hide");
            }
            return this;
        },
        /**
         * Verbirgt die Informationsfläche.
         */
        hide: function() {
            if(shown && !pinned) {
                infobox.slideToggle("slow");
                shown = false;
            }
            return this;
        },
        /**
         * Anheften - hindert die Infobox sich selbst zu lösen
         * Zweiter Aufruf versteckt die Infobox wieder.
         */
        pin: function() {
            if (pinned) {
                pinned = false;
                that.hide();
            } else {
                pinned = true;
                that.show();
            }
            return this;
        },
        /**
         * Setzt den Inhalt (User/Provider sowie Daten) der Infobox
         * @param {Object} information
         * @return {Infobox} self
         */
        setContent: function(information) {
            information = information[0] || {};
            if(information.participant && information.participant != "") {
                setParticipant(information.participant);
                empty = false;
            }
            if(information.data && information.data != "") {
                setData(information.data);
                empty = false;
            }
            return this;
        },
        /**
         * Registriert einen Eventhandler für das OnClick-Event der Infobox
         * @param {Function} handler zu registrierender Eventhandler
         */
        registerOnClick: function(handler) {
            infobox.click(handler);
            return this;
        }

    });
}

})();