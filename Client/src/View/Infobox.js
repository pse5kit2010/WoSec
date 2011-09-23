
(function() {

var $ = jQuery;

var CSS_CLASS_INFOBOX = "infobox"
,   CSS_CLASS_INFOBOX_ENTRY = "infobox-entry"
,   CSS_CLASS_INFOBOX_ENTRY_HEADER = "infobox-entry-header"
,   CSS_CLASS_INFOBOX_ENTRY_TIME = "infobox-entry-time"
,   CSS_CLASS_INFOBOX_ENTRY_EXECUSER = "infobox-entry-execUser"
,   CSS_CLASS_INFOBOX_ENTRY_CONTENT = "infobox-entry-content"
,   CSS_CLASS_INFOBOX_ENTRY_EVOKUSER = "infobox-entry-evokUser"
,   CSS_CLASS_INFOBOX_ENTRY_PROVIDER = "infobox-entry-provider"
,   CSS_CLASS_INFOBOX_ENTRY_DATA = "infobox-entry-data"
,   CSS_CLASS_INFOBOX_ENTRY_ATTACHMENTS = "infobox-entry-attachments"
,   CSS_CLASS_INFOBOX_ATTACHMENT_ENTRY = "infobox-attachment-entry"
,   CSS_CLASS_INFOBOX_ATTACHMENT_ENTRY_NAME = "infobox-attachment-entry-name"
,   CSS_CLASS_INFOBOX_ENTRY_USAGEREASON = "infobox-entry-usageReason"
,   CSS_CLASS_INFOBOX_DATA = "infobox-data"
,   INFOBOX_HIDE_DELAY_MS = 7000;


var infoboxPrototype; // lazy creation when DOM ready
function getInfoboxPrototype(){
    if (!infoboxPrototype) {
        infoboxPrototype = $('<div class="' + CSS_CLASS_INFOBOX + '">' +
            
        '</div>').hide();
    }
    return infoboxPrototype;
}
var infoboxEntryPrototype;
function getInfoboxEntryPrototype() {
    if (!infoboxEntryPrototype) {
        infoboxEntryPrototype = $('<div class="' + CSS_CLASS_INFOBOX_ENTRY + '">' +
            '<span class="' + CSS_CLASS_INFOBOX_ENTRY_HEADER + '">' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_TIME + '"></span>' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_EXECUSER + '"></span>' +
            '</span>' +
            '<div class="' + CSS_CLASS_INFOBOX_ENTRY_CONTENT + '">' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_EVOKUSER + '"></span>' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_PROVIDER + '"></span>' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_DATA + '"></span>' +
                '<ul class="' +  CSS_CLASS_INFOBOX_ENTRY_ATTACHMENTS + '"></ul>' +
                '<span class="' + CSS_CLASS_INFOBOX_ENTRY_USAGEREASON + '"></span>' +
            '</div>' +
        '</div>');
    }
    return infoboxEntryPrototype;
}

var attachmentEntryPrototype;
function getAttachmentEntryPrototype() {
    if (!attachmentEntryPrototype) {
        attachmentEntryPrototype = $('<li class="' + CSS_CLASS_INFOBOX_ATTACHMENT_ENTRY + '">' +
            '<span class="' + CSS_CLASS_INFOBOX_ATTACHMENT_ENTRY_NAME + '"></span>' +
            '<a></a>' +
        '</li>');
    }
    return attachmentEntryPrototype;
}


/**
 * Stellt die Informationsfläche dar, die beim Klicken bzw. Überfahren eines Tasks mit der Maus erscheint.
 * @param {Position} position Position
 * @return {Infobox} neue Infobox
 */
WoSec.HTMLGUI.prototype.newInfobox = function Infobox(position) {
    var infobox = getInfoboxPrototype().clone();
    var empty = true;

    infobox.css("top", position.y + position.height);
    infobox.css("left", position.x + position.width);


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
         * Anheften - hindert die Infobox sich selbst zu verstecken
         */
        pin: function() {
            pinned = true;
            that.show();
            return this;
        },
        /**
         * Lösen - hebt das Anheften wieder auf
         */
        unpin: function() {
            pinned = false;
            that.hide();
            return this;
        },
        /**
         * Setzt den Inhalt (User/Provider sowie Daten) der Infobox
         * @param {Object} information
         * @return {Infobox} self
         */
        setContent: function(information) {
            infobox.html("");
            console.log(information)
            information.forEach(function(i) {
                var entry = getInfoboxEntryPrototype().clone();
                var date = new Date(i.timestamp * 1000);
                entry.find("." + CSS_CLASS_INFOBOX_ENTRY_TIME).text(date.getDate() + "." + date.getMonth() + "." + date.getFullYear());
                if (i.participants) {
                    entry.find("." + CSS_CLASS_INFOBOX_ENTRY_EXECUSER).text(i.participants.execUser);
                    entry.find("." + CSS_CLASS_INFOBOX_ENTRY_EVOKUSER).text(i.participants.evokUser);
                    entry.find("." + CSS_CLASS_INFOBOX_ENTRY_PROVIDER).text(i.participants.provider);
                    empty = false;
                }
                entry.find("." + CSS_CLASS_INFOBOX_ENTRY_DATA).text(i.data);
                if (i.attachments) {
                    var attachments = entry.find("." + CSS_CLASS_INFOBOX_ENTRY_ATTACHMENTS);
                    i.attachments.forEach(function(a) {
                        var aEntry = getAttachmentEntryPrototype().clone();
                        aEntry.find("." + CSS_CLASS_INFOBOX_ATTACHMENT_ENTRY_NAME).text(a.name);
                        aEntry.find("a").attr("href", a.link).text(a.type);
                        attachments.append(aEntry);
                    });
                    empty = false;
                }
                entry.find("." + CSS_CLASS_INFOBOX_ENTRY_USAGEREASON).text(i.usageReason);
                
                infobox.append(entry);
            });
            return this;
        },
        /**
         * Registriert einen Eventhandler für das OnClick-Event der Infobox
         * @param {Function} handler zu registrierender Eventhandler
         */
        registerOnClick: function(handler) {
            infobox.click(handler);
            return this;
        },
        /**
         * Registriert Eventhandler für das OnHover-Event der Infobox
         * @param {Function} handlerIn Eventhandler beim eintreten
         * @param {Function} handlerOut Eventhandler beim austreten
         */
        registerOnHover: function(handlerIn, handlerOut) {
            infobox.hover(handlerIn, handlerOut);
            return this;
        },
        appendTo: function(cssSelector) {
            infobox.appendTo(cssSelector);
            return this;
        }

    });
}

})();