
(function () {

var $ = jQuery;

var CSS_CLASS_TIMESLIDER = "timeslider"
,   CSS_CLASS_TIMESLIDER_EVENT_LINK = "timeslider-entry"
,   CSS_CLASS_TIMESLIDER_BACKWARD_BUTTON = "timeslider-backward-button"
,   CSS_CLASS_TIMESLIDER_PLAY_PAUSE_BUTTON = "timeslider-play-pause-button"
,   CSS_CLASS_TIMESLIDER_PLAY_BUTTON = "timeslider-play-button"
,   CSS_CLASS_TIMESLIDER_PAUSE_BUTTON = "timeslider-pause-button"
,   CSS_CLASS_TIMESLIDER_FORWARD_BUTTON = "timeslider-forward-button"
,   CSS_CLASS_TIMESLIDER_PLAY_BUTTON_OVERLAY = "timeslider-play-pause-button-overlay"
,   CSS_CLASS_TIMESLIDER_ENTRY_EVENTCOMMAND = "timeslider-entry-";


var timeSliderPrototype;
function getTimeSliderPrototype() {
    if (!timeSliderPrototype) {
        timeSliderPrototype = $("<div class='" + CSS_CLASS_TIMESLIDER + "'></div>");
    }
    return timeSliderPrototype;
}

var timeSliderEventPrototype;
function getTimeSliderEventPrototype() {
    if (!timeSliderEventPrototype) {
        timeSliderEventPrototype = $('<a class="' + CSS_CLASS_TIMESLIDER_EVENT_LINK + '"></a>');
    }
    return timeSliderEventPrototype;
}

WoSec.HTMLGUI.prototype.TimeSlider = function TimeSlider(gui, eventChain) {
    var events = [];
    var paused = false;
    var sliding = false;
    var $node = getTimeSliderPrototype().clone();
    var slider = $node.slider({
        slide : function(event, ui) {
            var value = slider("option", "value");
            var backwards = ui.value < value;
            var searchedEventCommand;
            events.forEach(function(e) {
                if(e.timestamp <= ui.value) {
                    searchedEventCommand = e.eventCommand;
                }
            });
            gui.disableAnimations(eventChain);
            pause();
            sliding = true;
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
            sliding = false;
        }
    });
    slider = slider.slider.bind(slider);
    
    $("." + CSS_CLASS_TIMESLIDER_PLAY_PAUSE_BUTTON).click(function() {
        if (paused) {
            gui.enableAnimations(eventChain);
            unpause();
            eventChain.unlock().play();
        } else {
            eventChain.lock();
            pause();
        }
    });
    
    $("." + CSS_CLASS_TIMESLIDER_FORWARD_BUTTON).click(function() {
        gui.disableAnimations(eventChain);
        eventChain.seek(function(eventCommand) {
            eventCommand.execute();
        });
        if (!paused) {
            gui.enableAnimations(eventChain);
        }
    });
    
    $("." + CSS_CLASS_TIMESLIDER_BACKWARD_BUTTON).click(function() {
        gui.disableAnimations(eventChain);
        eventChain.seek(function(eventCommand) {
            eventCommand.execute();
        }, true);
        if (!paused) {
            gui.enableAnimations(eventChain);
        }
    });
    
    function pause() {
        paused = true;
        $node.find("." + CSS_CLASS_TIMESLIDER_PLAY_PAUSE_BUTTON)
            .removeClass(CSS_CLASS_TIMESLIDER_PAUSE_BUTTON)
            .addClass(CSS_CLASS_TIMESLIDER_PLAY_BUTTON);
        
    }
    
    function unpause() {
        paused = false;
        $node.find("." + CSS_CLASS_TIMESLIDER_PLAY_PAUSE_BUTTON)
            .removeClass(CSS_CLASS_TIMESLIDER_PLAY_BUTTON)
            .addClass(CSS_CLASS_TIMESLIDER_PAUSE_BUTTON);
    }
    
    function adjustSize() {
        var startTime = eventChain.getLength() > 0 ? eventChain.getEventCommand(0).getTimestamp() : 0;
        var endTime = eventChain.last().getTimestamp();
        
        slider("option", "min", startTime);
        slider("option", "max", endTime);
        
        var interval = endTime - startTime;
        events.forEach(function(e) {
            rightPercent = (endTime - e.timestamp) / interval * 100;
            e.entry.css("left", (100 - rightPercent) + "%");
        });
    }
    
    this.refresh = function(eventChain, event) {
        switch (event) {
            case "add":
                eventChain.forEach(function(eventCommand, i) {
                    if(!events[i]) {// if not yet created
                        var event = {};
                        event.eventCommand = eventCommand;
                        event.timestamp = eventCommand.getTimestamp();
                        event.entry = getTimeSliderEventPrototype().clone().appendTo($node);
                        // create new entry
                        event.entry.addClass(CSS_CLASS_TIMESLIDER_ENTRY_EVENTCOMMAND + eventCommand.getClass());
                        events.push(event);
                    }
                });
                adjustSize();
                if(eventChain.isLocked()) {// animation on the play button if new events arrieved and the chain is locked
                    $node.find('.' + CSS_CLASS_TIMESLIDER_PLAY_BUTTON_OVERLAY).show();
                    $node.find('.' + CSS_CLASS_TIMESLIDER_PLAY_PAUSE_BUTTON).effect('pulsate', {
                        times : 10
                    }, 1000)
                    setTimeout(function() {
                        $node.find('.' + CSS_CLASS_TIMESLIDER_PLAY_BUTTON_OVERLAY).hide();
                    }, 10000);
                }
                break;
            case "position":
                if (!sliding) {
                    slider("option", "value", eventChain.getEventCommand(eventChain.getCurrentPosition()).getTimestamp());
                }
                break;
            
            return this;
        }
    };
    
    this.appendTo = $node.appendTo.bind($node);
    this.hide = $node.hide.bind($node);
    this.show = $node.show.bind($node);
};

})();
