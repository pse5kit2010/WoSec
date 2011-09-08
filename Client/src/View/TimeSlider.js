

(function() {

var $ = jQuery;

const CSS_ID_TIMESLIDER = "timeslider"
,     CSS_CLASS_TIMESLIDER_EVENT_LINK = "timeslider-entry"
,     CSS_ID_TIMESLIDER_PLAY_BUTTON = "timeslider-play-button"
,     CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY = "timeslider-play-button-overlay";

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