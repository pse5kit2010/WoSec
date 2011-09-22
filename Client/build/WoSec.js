
/**
 * WoSec Client-Side
 * 
MIT Licence:
Copyright (c) 2011 Justus Maier, David Rieger, Oleg Peters, Philip Lingel

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the 
"Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


/**
 * Namespace Deklaration und ein paar praktische Funktionen
 */

var WoSec = {};



WoSec.baseObject = {
	/**
	 * Führt eine Methode später aus
	 * Weitere Argumente werden an die Methode weitergegeben
	 * @param {Number} msec Zeitspanne die gewartet werden soll in Millisekunden
	 * @param {String} method Name der Methode die ausgeführt werden soll
	 */
	later: function (msec, method) {
        var that = this, args = Array.prototype.slice.apply(arguments, [2]);
        if (typeof method === 'string') {
            method = that[method];
        }
        setTimeout(function () {
            method.apply(that, args);
        }, msec);
        return that; // Cascade
    }
};

/**
 * Erzeugt Vererbung zwischen den gegebenen Klassen
 * @param {Function} subType erbende Klasse
 * @param {Function} superType Mutterklasse
 */
WoSec.inherit = function(subType, superType) {
    var prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
};

/**
 * Erweitert ein Objekt um die Methoden und Eigenschaften eines anderen
 * @param {Objekt} destination erbendes Objekt
 * @param {Objekt} source Quelle
 */
WoSec.extend = function(destination, source) {
  for (var p in source) {
    if (source.hasOwnProperty(p)) {
      destination[p] = source[p];
    }
  }
  return destination;
};


(function() {
	
var $ = jQuery;


/**
 * SVG beobachtet einen Workflow und erstellt zu jedem Task(Lane)
 * korrespondierende SVG Elemente.
 */
WoSec.SVG = function SVG(id) {
	
    this.$svg = $("#" + id);

}

}());


(function() {

var $ = jQuery;

var CSS_ID_COLORSTORE = 'color-store'
,	CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR = 'rect-unobtrusive'
,   CSS_ID_COLORSTORE_OBTRUSIVE_COLOR = 'rect-obtrusive'
,   CSS_ID_COLORSTORE_RESET_COLOR = 'rect-reset';
var SCROLL_ANIMATION_MS = 100
,   SCROLL_SUPPRESS_PIXEL = 100;

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
    
    that.scrollTo = function() {
        var position = this.getPosition();
        var target = {
            x: position.x - $svg.parent().width() / 2,
            y: position.y - $svg.parent().height() / 2
        };
        var scrollPosition = {
            x: $svg.scrollLeft(),
            y: $svg.scrollTop()
        };
        // only scroll if needed
        if (Math.abs(target.x - scrollPosition.x) > SCROLL_SUPPRESS_PIXEL
            || Math.abs(target.y - scrollPosition.y) > SCROLL_SUPPRESS_PIXEL) {
            $svg.animate({scrollLeft: target.x}, SCROLL_ANIMATION_MS);
            $svg.animate({scrollTop: target.y}, SCROLL_ANIMATION_MS);
        }
        return this;
    };

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
                this.scrollTo();
                if (enableAnimations) {
                    this.highlight();
                }
                break;
            case "Finished":
                this.markUnobtrusive();
                this.scrollTo();
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
            var color = $('#' + CSS_ID_COLORSTORE_OBTRUSIVE_COLOR).css('color');
            $(this).attr('fill', color);
            $(this).css('fill', color);
        });
        return this;
    };
    /**
     * Färbt das Rechteck in einer unauffälligen Farbe.
     * @return {SVGRectangle} self
     */
    that.markUnobtrusive = function() {
        rectangles.each(function() {
            var color = $('#' + CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR).css('color');
            $(this).attr('fill', color);
            $(this).css('fill', color);
        });
        return this;
    };
    /**
     * Setzt das Rechteck zurück (farblich)
     * @return {SVGRectangle} self
     */
    that.reset = function() {
        rectangles.each(function() {
            var color = $('#' + CSS_ID_COLORSTORE_RESET_COLOR).css('color');
            $(this).attr('fill', color);
            $(this).css('fill', color);
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

(function() {
    
var $ = jQuery;

var ANIMATION_IMAGE_PATH = "media/images/fileicon.png" // {width: 34, height: 44}
,   ANIMATION_IMAGE_SIZE = {width: 25.5, height: 33};


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
     * Zeigt eine Datenanimation
     * @return {SVGTaskRectangle} self
     */
    that.show = function() {
        jQueryIcon.show();
        jQueryIcon.animate({
            svgY : endPosition.y
        }, 1000, function() {
            jQueryIcon.hide();
            jQueryIcon.attr("y", startPosition.y);
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
                if (enableAnimations) {
                    this.show();
                }
                break;
        }
    };
    return that;
};

})();


(function() {

var $ = jQuery;

var SVG = WoSec.SVG;

var CSS_ID_INFOBOXES = "infoboxes";


/**
 * Kontrolliert das Interface
 */
WoSec.HTMLGUI = function HTMLGUI(eventChain) {
    
    var svg = new SVG("instancesvg");
    var svgElements = [];
    
    var knownTaskIDs = [];
    var knownTaskLaneIDs = [];
    
    
    
    /**
     * Deaktiviert Animationen
     */
    this.disableAnimations = function() {
        svgElements.forEach(function(svgElement) {
            svgElement.disableAnimations();
        });
        return this;
    };
    /**
     * Aktiviert Animationen
     */
    this.enableAnimations = function() {
        svgElements.forEach(function(svgElement) {
            svgElement.enableAnimations();
        });
        return this;
    };
 
    /**
     * Aktualisiere-Methode des Beobachter Musters
     * @param {Workflow} workflow beobachteter Workflow
     */
    this.refresh = function(workflow) {
        var taskIDs = workflow.getTaskRepositoryEntries();
        var taskID;
        for(var i = taskIDs.length - 1; i >= 0; i--) {
            var taskID = taskIDs[i];
            if(knownTaskIDs.indexOf(taskID) > -1) {
                continue;
            }
            var task = workflow.getTaskByID(taskID);
            var svgTaskRectangle = svg.newTaskRectangle(taskID);
            task.registerObserver(svgTaskRectangle);
            var svgDataAnimation;
            if(task.getCorrespondingTask()) {
                svgDataAnimation = svg.newDataAnimation(taskID, svgTaskRectangle.getPosition().getCenter(), svg.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter());
                task.registerObserver(svgDataAnimation);
            }
            var infobox = this.newInfobox(svgTaskRectangle.getPosition())
            task.registerObserver(infobox);
            svgTaskRectangle.registerOnHover(infobox.show);
            infobox.registerOnHover(infobox.pin, infobox.unpin);
            infobox.appendTo("#" + CSS_ID_INFOBOXES);
                        
            svgElements.push(svgTaskRectangle);
            if (svgDataAnimation) {
                svgElements.push(svgDataAnimation);
            }
        }
        knownTaskIDs = taskIDs;

        var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
        var taskLaneID;
        for(var i = taskLaneIDs.length - 1; i >= 0; i--) {
            taskLaneID = taskLaneIDs[i]
            if(knownTaskLaneIDs.indexOf(taskLaneID) > -1) {
                continue;
            }
            var svgTaskLaneRectangle = svg.newTaskLaneRectangle(taskLaneID);
            workflow.getTaskLaneByID(taskLaneID).registerObserver(svgTaskLaneRectangle);
            svgElements.push(svgTaskLaneRectangle);
        }
        knownTaskLaneIDs = taskLaneIDs;
        return this;
    }
    
    
    var timeSlider = this.newTimeSlider(this, eventChain);
    eventChain.registerObserver(timeSlider);
    
    eventChain.getWorkflow().registerObserver(this);
};

})();


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
,   INFOBOX_HIDE_DELAY_MS = 3000;


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
        setContent: function(information, timestamp) {
            infobox.html("");
            information.forEach(function(i) {
                var entry = getInfoboxEntryPrototype().clone();
                entry.find("." + CSS_CLASS_INFOBOX_ENTRY_TIME).text(i.timestamp);
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


(function() {

var $ = jQuery;

var CSS_ID_TIMESLIDER = "timeslider"
,   CSS_CLASS_TIMESLIDER_EVENT_LINK = "timeslider-entry"
,   CSS_ID_TIMESLIDER_PLAY_BUTTON = "timeslider-play-button"
,   CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY = "timeslider-play-button-overlay";

var timeSliderEventPrototype;
function getTimeSliderEventPrototype() {
    if (!timeSliderEventPrototype) {
        timeSliderEventPrototype = $('<a class="' + CSS_CLASS_TIMESLIDER_EVENT_LINK + '"></a>');
    }
    return timeSliderEventPrototype;
}
    
WoSec.HTMLGUI.prototype.newTimeSlider = function TimeSlider(gui, eventChain) {
    $("#" + CSS_ID_TIMESLIDER_PLAY_BUTTON).click(function() {
        gui.enableAnimations();
        eventChain.unlock().play();
    });
    var timeSliderEvents = [];
    var timeSlider = $("#" + CSS_ID_TIMESLIDER).slider({
        slide : function(event, ui) {
            var value = timeSlider.slider("option", "value");
            var backwards = ui.value < value;
            var searchedEventCommand;
            timeSliderEvents.forEach(function(e) {
                if(e.timestamp <= ui.value) {
                    searchedEventCommand = e.eventCommand;
                }
            });
            gui.disableAnimations();
            eventChain.lock().seek(function(eventCommand) {
                if(!backwards) {
                    eventCommand.execute();
                } else {
                    eventCommand.unwind();
                }
                if(eventCommand == searchedEventCommand) {
                    return false;
                }
            }, backwards);
        }
    });

    return {
        adjustSize : function(eventChain) {
            var startTime;
            var endTime;
            var min = timeSlider.slider("option", "min");
            var max = timeSlider.slider("option", "max");
            var intervalChanged = false;
            eventChain.forEach(function(eventCommand, i) {
                if(!timeSliderEvents[i]) {// if not yet created
                    var event = {};
                    event.eventCommand = eventCommand;
                    event.timestamp = eventCommand.getTimestamp();
                    event.entry = getTimeSliderEventPrototype().clone().appendTo('#' + CSS_ID_TIMESLIDER);
                    // create new entry
                    event.entry.addClass("timeslider-entry-" + eventCommand.getClass());
                    timeSliderEvents.push(event);
                }
                var time = eventCommand.getTimestamp();
                if(!startTime || time < startTime) {
                    startTime = time;
                }
                if(!endTime || time > endTime) {
                    endTime = time;
                }
                if(startTime) {
                    timeSlider.slider("option", "min", startTime);
                    intervalChanged = true;
                }
                if(endTime) {
                    timeSlider.slider("option", "max", endTime);
                    intervalChanged = true;
                }
            });
            if(startTime == min && endTime == max) {
                intervalChanged = false;
            }
            if(intervalChanged) {
                var interval = endTime - startTime;
                timeSliderEvents.forEach(function(e) {
                    rightPercent = (endTime - e.timestamp) / interval * 100;
                    e.entry.css("left", (100 - rightPercent) + "%");
                });
            }
            return this;
        },
        /**
         * Teil des Beobachtermusters, setzt den TimeSlider in Kenntnis, dass sich die EventChain geändert hat.
         * @param {EventChain} eventChain
         */
        refresh : function(eventChain) {
            if(eventChain.getLength() != timeSliderEvents.length) {
                this.adjustSize(eventChain);
                if(eventChain.isLocked()) {// animation on the play button if new events arrieved and the chain is locked
                    $('#' + CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY).show();
                    $('#' + CSS_ID_TIMESLIDER_PLAY_BUTTON).effect('pulsate', {
                        times : 10
                    }, 1000)
                    setTimeout(function() {
                        $('#' + CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY).hide();
                    }, 10000);
                }
            }
            timeSlider.slider("option", "value", eventChain.getEventCommand(eventChain.getCurrentPosition()).getTimestamp());
            return this;
        }
    };
}
})(); 
(function() {

/**
 * Das Mixin Observable kapselt die Grundfunktionalität
 * für das Beobachter-Muster.
 * Beobachter können registriert und benachrichtigt werden.
 */
WoSec.MixinObservable = function Observable() {
    var observers = [];

    /**
     * Registriert einen Beobachter
     * @param {Object} observer zu registrierender Beobachter
     */
    this.registerObserver = function(observer) {
        if( typeof observer.refresh !== "function") {
            throw new Error("Observer has to support refresh()-Method");
        }
        observers.push(observer);
        return this;
    };
    /**
     * Informiert alle Beobachter
     * Argumente werden übergeben
     */
    this.notifyObservers = function() {
        var args = Array.prototype.slice.call(arguments);
        observers.forEach(function(observer) {
            observer.refresh.apply(observer, args);
        });
        return this;
    };
};

})()


(function() {

var MixinObservable = WoSec.MixinObservable;

var states = ["Reset", "Starting", "Started", "Finished", "TransferingData"];
/**
 * Ein Task-Objekt ist assoziiert mit einer Aktivität des BPMN SVG Diagramms.
 * Es verwaltet die zugehörige Infobox und das SVGRectangle,
 * an die Anweisungen zur Darstellung delegiert werden.
 * @param {String} id ID des Tasks
 * @param {String} correspondingActivityID ID des korrespondierenden Tasks
 * @param {Workflow} workflow zugehöriger Workflow
 * @return {Task} neues Task-Objekt
 */
WoSec.newTask = function Task(id, correspondingActivityID, workflow) {
    var that = Object.create(WoSec.baseObject);
    MixinObservable.call(that);
	var state = "Reset";
	var information = [];
	
	that.constructor = Task;
	
	/**
	 * Gibt die ID des Tasks zurück
	 */
	that.getID = function() {
		return id;
	};
	/**
	 * Gibt den korrespondierenden Task zurück
	 * @return {Task} korrespondierender Task
	 */
	that.getCorrespondingTask = function() {
        return (typeof(correspondingActivityID) == "string" && correspondingActivityID != "")
        	? workflow.getTaskByID(correspondingActivityID)
        	: null;
    };
    
    /**
     * Gibt den Zustand des Tasks zurück
     * @return {String} Zustand
     */
    that.getState = function() {
    	return state;
    };
    
    /**
     * Gibt die gespeicherten Informationen zurück
     * @return {Object} Informationen
     */
    that.getInformation = function() {
        return information;
    }
    
	/**
	 * Fügt dem Task Informationen hinzu
	 * @param {Object} i Informationen
	 */
    that.addInformation = function(i) {
    	information.push(i);
        this.notifyObservers(this);
    	return this;
    };
	
	/**
	 * Setzt den Zustand des Tasks
	 * @param {String} newState neuer Zustand
	 */
	that.setState = function(newState) {
		if (states.indexOf(newState) == -1) {
			throw new Error("Unknown state [" + newState + "] given");
		}
		state = newState;
		this.notifyObservers(this);
		return this;
	}
	
	
	return that;
}

}());

(function() {

var MixinObservable = WoSec.MixinObservable;

/**
 * Ein Tasklane-Objekt ist assoziiert mit einer ActivityGroup des BPMN SVG Diagramms.
 * Es verwaltet das zugehörige SVGRectangle, an das Anweisungen zur Darstellung delegiert werden.
 * @param {SVGRectangle} rectangle
 * @param {Array} activityIDs
 * @return {TaskLane}
 */
WoSec.newTaskLane = function TaskLane(activityIDs, workflow) {
	var that = Object.create(WoSec.baseObject);
	MixinObservable.call(that);
	var getTasks = function() {
		var tasks = [];
		activityIDs.forEach(function(activityID, index) { 
            tasks[index] = workflow.getTaskByID(activityID);
        });
		return tasks;
	};
	
	that.constructor = TaskLane;
	/**
	 * Fügt allen Tasks in der Lane Informationen hinzu
	 * @param {Object} information
	 * @return {TaskLane} self
	 */
	that.addInformation = function(information) {
		getTasks().forEach(function(task) {
			task.addInformation(information);
		});
		this.notifyObservers();
		return this;
	};
	return that;
}

}());


(function() {    
	
// import
var newTask = WoSec.newTask
,	newTaskLane = WoSec.newTaskLane
,	MixinObservable = WoSec.MixinObservable;
/**
 * Die Klasse Workflow stellt Methoden 
 * zum Finden und Erstellen von Tasks (Tasklanes) bereit.
 * Sie speichert ein Task Repository.
 * 
 * Initialisiert den Workflow mit den korrespondierenden Tasks und Tasks in einer TaskLane
 * @param {String} instanceID InstanzID
 * @param {Object} correspondingActivityIDs korrespondierende Tasks ID => ID
 * @param {Object} activityIDsInALane Tasks in einer TaskLane TaskLaneID => [TaskIDs]
 */
WoSec.newWorkflow = function Workflow(instanceID, correspondingActivityIDs, activityIDsInALane) {
	if (typeof(instanceID) != "string") {
		throw new TypeError("The given instanceID is not a String");
	}

    var that = Object.create(WoSec.baseObject)
	
    var taskRepository = {}; // ID => Task
    var taskLaneRepository = {}; // ID => TaskLane
	
    function createTask(activityID) {
		if (typeof(activityID) != "string") {
			throw new TypeError("The given activityID is not a String");
		}
        return newTask(activityID, correspondingActivityIDs[activityID], that);
    }
    function createTaskLane(activityGroupID) {
		if (typeof(activityGroupID) != "string") {
			throw new TypeError("The given groupID is not a String");
		}
		if (!activityIDsInALane[activityGroupID]) {
			throw new Error("Unknown activityGroupID[" + activityGroupID + "]");
		}
        return newTaskLane(activityIDsInALane[activityGroupID], that);
    }
    MixinObservable.call(that);
    return WoSec.extend(that, {
        constructor: Workflow,
        toString: function() {
            return "Workflow:"+this.getInstanceID();
        },
		/**
		 * Gibt die InstanzID des Workflows zurück
		 * @return InstanzID
		 */
		getInstanceID: function() {
			return instanceID;
		},
		/**
		 * Liefert den Task mit der angegebenen ID zurück
		 * @param {String} activityID
		 * @return {Task} Task ggf. aus Repository
		 */
        getTaskByID: function(activityID) {
			if (!taskRepository[activityID]) {
				taskRepository[activityID] = createTask(activityID);
				taskRepository[activityID].getCorrespondingTask(); // create corresponding Task if possible
				this.notifyObservers(this);
			}
            return taskRepository[activityID];
        },
		/**
		 * Liefert die Lane mit der angegebenen ID zurück
		 * @param {String} activityGroupID
		 * @return {TaskLane} TaskLane ggf. aus Repository
		 */
        getTaskLaneByID: function(activityGroupID) {
			if (!taskLaneRepository[activityGroupID]) {
				taskLaneRepository[activityGroupID] = createTaskLane(activityGroupID);
				this.notifyObservers(this);
			}
            return taskLaneRepository[activityGroupID];
        },
        getTaskRepositoryEntries: function() {
            var entries = [];
            for (var p in taskRepository) {
                entries.push(p);
            }
            return entries;
        },
        getTaskLaneRepositoryEntries: function() {
            var entries = [];
            for (var p in taskLaneRepository) {
                entries.push(p);
            }
            return entries;
        }
    });
};

}());

(function() {

var WorkflowClass = WoSec.newWorkflow;


var workflow;
/**
 * Ein kleiner Workaround um die Workflowobjektabhängigkeit
 * Die Factories benötigen jeweils einen Workflow dem das zu erstellende Event zugeordnet wird.
 * Muss immer vor der Benutzung einer Factory aufgerufen werden.
 * @param {Workflow} w der zu verwendende Workflow
 */
function usingWorkflow(w) {
	if (!w instanceof WorkflowClass) {
		throw new TypeError("Given argument is not a workflow [" + w + "]");
	}
	workflow = w;
	return this; // allows method chaining
};

/**
 * Basisklasse für Events unterschiedlichen Typs, bietet Ausführen- und Animiere-Methoden.
 * Speichert einen zugehörigen Zeitstempel.
 * Entwurfsmuster Befehl (Command)
 * Namespace für alle EventCommands
 * @param {Integer} timestamp Zeitstempel
 */
function EventCommand(timestamp) {// interface (and abstract class)
	if (typeof(timestamp) != "number") {
		throw new Error("Timestamp [" + timestamp + "] is not a number");
	}
	this.timestamp = timestamp;
} 
EventCommand.prototype = Object.create(WoSec.baseObject);
EventCommand.prototype.classname = "EventCommand";
/**
 * Gibt den Namen der Klasse zurück.
 * Verwendet für CSS Abhängigkeiten
 * @return {String}
 */
EventCommand.prototype.getClass = function() {
	return this.classname;
}
/**
 * Führt den Befehl aus.
 * @return {EventCommand}
 */
EventCommand.prototype.execute = function() {
	return this;
};
/**
 * Macht den Befehl rückgängig
 */
EventCommand.prototype.unwind = function() {
	return this;
}
/**
 * Gibt den Zeitstempel des Events zurück
 * @return {Integer}
 */
EventCommand.prototype.getTimestamp = function() {
	return this.timestamp;
}
/**
 * Factory Methode zur erstellung eines EventCommands
 * @param {Object} event
 */
EventCommand.create = function(event) {
	return new EventCommand(event.timestamp);
}



/**
 * Beim Starten einer Aktivität delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben, an den zugehörigen Task.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Integer} timestamp Zeitstempel
 */
function StartingTaskEvent(task, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
}
WoSec.inherit(StartingTaskEvent, EventCommand);
StartingTaskEvent.prototype.classname = "StartingTaskEvent";
/**
 * @see EventCommand.execute
 */
StartingTaskEvent.prototype.execute = function() {
    this.task.setState("Started");
	this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setState("Started");
	return this;
};
/**
 * @see EventCommand.unwind
 */
StartingTaskEvent.prototype.unwind = function() {
	this.task.setState("Reset");
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setState("Reset");
	return this;
}
/**
 * Factory Methode zur Erstellung eines StartingTaskEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 */
StartingTaskEvent.create = function(event) {
	return new StartingTaskEvent(workflow.getTaskByID(event.activityID), event.timestamp);
};

/**
 * Beim Beenden einer Aktivität delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 *  sich als beendet zu markieren.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function FinishingTaskEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
	this.information.timestamp = timestamp;
}
WoSec.inherit(FinishingTaskEvent, EventCommand);
FinishingTaskEvent.prototype.classname = "FinishingTaskEvent";
/**
 * @see EventCommand.execute
 */
FinishingTaskEvent.prototype.execute = function() {
    this.task.setState("Finished");
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setState("Finished");
	this.task.addInformation(this.information);
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().addInformation(this.information);
	return this;
};
/**
 * @see EventCommand.unwind
 */
FinishingTaskEvent.prototype.unwind = function() {
	this.task.setState("Started");
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setState("Started");
	return this;
}
//FinishingTaskEvent.prototype.fastExecute = function() {}; // NOP
/**
 * Factory Methode zur Erstellung eines FinishingTaskEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
FinishingTaskEvent.create = function(event) {
	return new FinishingTaskEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
}


/**
 * Bei einem Datentransfer delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 * eine Animation zum korrespondierenden Task darzustellen.
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function TransferingDataEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
    this.information.timestamp = timestamp;
}
WoSec.inherit(TransferingDataEvent, EventCommand);
TransferingDataEvent.prototype.classname = "TransferingDataEvent";
/**
 * @see EventCommand.execute
 */
TransferingDataEvent.prototype.execute = function() {
    this.task.setState("TransferingData");
	return this;
};
// TransferingDataEvent.prototype.unwind = function() {} // NOP
/**
 * Factory Methode zur Erstellung eines TransferingDataEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
TransferingDataEvent.create = function(event) {
	return new TransferingDataEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
}


/**
 * Bei der Festlegung des zugewiesenen Users bzw. Providers delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben und den Participant festzulegen, an die zugehörige TaskLane sich hervorzuheben.
 * @param {TaskLane} taskLane Zugehörige TaskLane
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function SpecifyingParticipantEvent(taskLane, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.taskLane = taskLane;
    this.information = information || {};
    this.information.timestamp = timestamp;
}
WoSec.inherit(SpecifyingParticipantEvent, EventCommand);
SpecifyingParticipantEvent.prototype.classname = "SpecifyingParticipantEvent";
/**
 * @see EventCommand.execute
 */
SpecifyingParticipantEvent.prototype.execute = function() {
    this.taskLane.addInformation(this.information);
	return this;
};
// SpecifyingParticipantEvent.prototype.unwind = function() {} // NOP

/**
 * Factory Methode zur Erstellung eines SpecifyingParticipantEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityGroupID AktivitätsGruppen ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * @param {Object} event.information.participant ausgewählter Provider oder User
 */
SpecifyingParticipantEvent.create = function(event) {
	return new SpecifyingParticipantEvent(workflow.getTaskLaneByID(event.activityGroupID), event.information, event.timestamp);
}


// exports
WoSec.eventCommands = {
	usingWorkflow: usingWorkflow,
	EventCommand: EventCommand,
	StartingTask: StartingTaskEvent,
	FinishingTask: FinishingTaskEvent,
	TransferingData: TransferingDataEvent,
	SpecifyingParticipant: SpecifyingParticipantEvent
};

}());


(function() {

var eventCommands = WoSec.eventCommands
,   EventCommand = eventCommands.EventCommand
,	MixinObservable = WoSec.MixinObservable;


var PLAY_TIME_BETWEEN_EVENTS_MS = 1000;

/**
 * Klasse zur Verwaltung einer Liste von EventCommands
 * und eines Zeigers zur momentanen (zeitlichen) Position der Events
 * @constructor
 * @param {Workflow} workflow zugehöriger Workflow
 */
WoSec.newEventChain = function EventChain(workflow) {
    
	var events = [];
	var currentPosition = 0;
	var locked = false;

    var that = Object.create(WoSec.baseObject)
    MixinObservable.call(that);
    return WoSec.extend(that, {
        constructor: EventChain,
        /**
         * Gibt den zugehörigen Workflow zurück
         * @return {Workflow}
         */
        getWorkflow: function() {
        	return workflow;
        },
		/**
		 * Gibt die momentane Position in der EventChain zurück
		 * @return {Integer} momentane Position
		 */
		getCurrentPosition: function() {
			return currentPosition;
		},
		/**
		 * Gibt das EventCommand Objekt an der gegeben Position zurück
		 * @param {Number} position
		 * @return {EventCommand}
		 */
		getEventCommand: function(position) {
			return events[position];
		},
		/**
		 * Gibt die Länge der EventChain, also die Anzahl der enthaltenen EventCommands zurück
		 * @return {Number}
		 */
		getLength: function() {
			return events.length;
		},
		/**
		 * Sperrt die EventChain, verhindert abspielen
		 * @return {EventChain} self
		 */
		lock: function() {
			locked = true;
			return this;
		},
		/**
		 * Entsperrt die EventChain, verhindert erlaubt abspielen
		 * @return {EventChain} self
		 */
		unlock: function() {
			locked = false;
			return this;
		},
		/**
		 * Gibt true zurück wenn die EventChain gesperrt ist
		 * @returm {Boolean}
		 */
		isLocked: function() {
			return locked;
		},
		/**
		 * Verarbeitet JSON Daten, erstellt neue EventCommands und fügt sie dem Repository hinzu.
		 * @memberOf EventChain
		 * @param {Array} data JSON daten
		 * @return {EventChain} self
		 */
        add: function(data) {
			data = data || [];
            data.forEach(function(event) {
				if (!eventCommands[event.eventCommand]) {
					throw new Error("Unknown EventCommand: " + event.eventCommand);
				}
				events.push(eventCommands.usingWorkflow(workflow)[event.eventCommand].create(event)); // factory method
			});
			events.sort(function(e, next) {
			    e.timestamp - next.timestamp;
			});
			this.notifyObservers(this);
			return this;
        },
		/**
		 * Iteriert über Events und übergibt das jeweilige EventCommand an die übergebene Strategie.
		 * Hält an wenn die Strategie false zurückgibt
		 * Informiert die Beobachter
		 * @memberOf EventChain
		 * @param {Function} strategy Strategie zur Iteration
		 * @param {Boolean} [backwards] true um die Kette rückwärts zu durchlaufen
		 * @return {EventChain} self
		 */
        seek: function(strategy, backwards) {
            var direction = backwards ? -1 : 1;
			var i = currentPosition;
			if (i == events.length) { // in case we are at the end of the chain
				i--;
			}
            while (0 <= i && i < events.length) {
				currentPosition = i;
				if (strategy(events[i], i) === false) {
					break;
				}
				i += direction
			}
			this.notifyObservers(this);
			return this;
        },
		/**
		 * Iteriert über alle Events
		 * @see Array.prototype.forEach
		 */
		forEach: events.forEach.bind(events),
		/**
		 * Iteriert über Events in einer angenehmen Geschwindigkeit und führt die EventCommands aus.
		 * @memberOf EventChain
		 * @return {EventChain} self
		 */
        play: function() {
			if (locked) {
				return this;
			}
			var after = 0;
			this.seek(function(eventCommand) {
				eventCommand.later(after, "execute");
				after += PLAY_TIME_BETWEEN_EVENTS_MS;
			});
			setTimeout(function(){
				currentPosition = events.length;
			}, after);
			return this;
        },
		/**
		 * Gibt das letzte EventCommand in der Kette zurück,
		 * falls die Kette leer ist, wird ein EventCommand mit Zeitstempel 0 zurückgegeben
		 * @memberOf EventChain
		 * @return {EventCommand} das letzte EventCommand in der Kette
		 */
		last: function() {
			if (events[events.length - 1]) { // if last event exists return it
				return events[events.length - 1];
			} else {
				return new EventCommand(0); // else mock an event with timestamp zero for the ajaxUpdater
			}
		}
    });
};

}());

/**
 * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).
 * Empfangene Eventdaten werden an die EventChain weitergegeben.
 */
WoSec.AJAXUpdater = function AJAXUpdater(eventChain) {
	var DELAY_BETWEEN_POLLS = 5000;
	var POLL_URL = "UpdateController?type=Event";
	
	//var $ = jQuery;
	var $ = {
	    getJSON: function(mock, it, callback) {
		callback(
[/*{
    "timestamp": 1314317905,
    "eventCommand": "EventCommand",
    "information": {},
    "eventType": "createInstance"
}, */{
    "timestamp": 1314373858,
    "eventCommand": "FinishingTask",
    "information": {},
    "eventType": "humanActivityExecuted",
    "activityID": "__fX4gedbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1314373863,
    "eventCommand": "FinishingTask",
    "information": {},
    "eventType": "eventActivityExecuted",
    "activityID": "_ggEwYYBxEd-3VeNHLWdQXA"
}, {
    "timestamp": 1314373864,
    "eventCommand": "SpecifyingParticipant",
    "information": {},
    "eventType": "HumanTaskExecutorSelected",
    "activityGroupID": "_7kTKEOdbEd-f6JWMxJDGcQ"
}, {
    "timestamp": 1314373864,
    "eventCommand": "SpecifyingParticipant",
    "information": {
        "participants": {
            "provider": "DB01"
        }
    },
    "eventType": "WSProviderSelected",
    "activityGroupID": "_1UFV4ItpEd-U-Z7QjvIBEA"
}, {
    "timestamp": 1314373865,
    "eventCommand": "TransferingData",
    "information": {
        "data": "UserID: _sDfw47sd33saeF",
        "participants": {
            "provider": "DB01",
            "evokUser": "Alice",
            "execUser": "Ich"
        },
        "attachments": [
            {
                "link": "http://somewhereIbelong",
                "name": "Das ist ein Anhang!",
                "type": "Ein Link der nirgends hinführt..."
            }
        ],
        "usageReason": "wie bestellt"
    },
    "eventType": "DataTransferredToWS",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373865,
    "eventCommand": "StartingTask",
    "information": {},
    "eventType": "startActivityExecution",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373866,
    "eventCommand": "TransferingData",
    "information": {
        "data": "",
        "participants": {
            "provider": "DB01"
        },
        "usageReason": "an die Datenbank geschickt, weil deshalb",
        "attachments": [
            {
                "link": "http://blabla",
                "name": "Anschreiben",
                "type": "Word-Dokument"
            }, {
                "link": "http://blablub",
                "name": "Ausschreibung",
                "type": "PDF-Datei"
            }
        ]
    },
    "eventType": "DataTransferredFromWS",
    "activityID": "_mJVSMNq2Ed-AhcDaNoYiNA"
}, {
    "timestamp": 1314373867,
    "eventCommand": "FinishingTask",
    "information": {
        "participants": {
            "provider": "DB01"
        }
    },
    "eventType": "WSActivityExecuted",
    "activityID": "_P2HHwNq2Ed-AhcDaNoYiNA"
}]);
	    }
	};//*/
	
    
		$.getJSON(POLL_URL, {since: eventChain.last().getTimestamp(), instance: eventChain.getWorkflow().getInstanceID()}, function(data) {
			eventChain.add(data).play();
		});
		//setTimeout(loop, DELAY_BETWEEN_POLLS);
	
};
