
/**
 * Singleton (UtilityKlasse),
 * das Funktionalität zur Verwaltung von HTML-Elementen bereitstellt; erstellt Infoboxen.
 */
WoSec.htmlRenderer = (function() {
    var $ = jQuery;
	
	const CSS_ID_INFOBOXES = "infoboxes"
	,     CSS_CLASS_INFOBOX = "infobox"
	,     CSS_CLASS_INFOBOX_PARTICIPANT = "infobox-participant"
	,     CSS_CLASS_INFOBOX_DATA = "infobox-data"
	,	  INFOBOX_HIDE_DELAY_MS = 3000;
	const CSS_ID_DATABOX = "databox"
	,	  CSS_CLASS_DATABOX_ENTRY = "databox-entry"
	,	  CSS_ID_DATABOX_HOVER = "databox-hover"
	,	  DATABOX_HIDE_DELAY_MS = 5000;
	const CSS_ID_TIMESLIDER = "timeslider"
	,     CSS_CLASS_TIMESLIDER_EVENT_LINK = "timeslider-entry"
	,     CSS_ID_TIMESLIDER_PLAY_BUTTON = "timeslider-play-button"
	,	  CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY = "timeslider-play-button-overlay";
	
	// for DOM elements there is generally on prototype which gets cloned to create new elements
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
	
	var databoxInitialized = false;
	function initDatabox() {
		databoxInitialized = true;
		var showDatabox = false;
		var pinDatabox = false;
		var initialDataboxPosition = parseInt($("#"+CSS_ID_DATABOX).css("left"));
		var jQueryDatabox = $("#"+CSS_ID_DATABOX);
		$("#"+CSS_ID_DATABOX_HOVER).hover(function() {
			if (!showDatabox && !pinDatabox) {
				showDatabox = true;
				jQueryDatabox.animate({left: -10}).css("opacity", 0.8);
				setTimeout(function() {
					if (!pinDatabox) {
						jQueryDatabox.animate({left: initialDataboxPosition}, function() {
							showDatabox = false;
						});
					}
				}, DATABOX_HIDE_DELAY_MS);
			}
			return false;
		});
		jQueryDatabox.click(function() {
			if (showDatabox && !pinDatabox) {
				pinDatabox = true;
			} else if (pinDatabox) {
				pinDatabox = false;
				$(this).animate({left: initialDataboxPosition}, "slow", function() {
					showDatabox = false;
				});
			}
			return false;
		});
	}
    var dataEntryPrototype;
	function getDataEntryPrototype() {
		if (!dataEntryPrototype) {
			dataEntryPrototype = $('<div class="' + CSS_CLASS_DATABOX_ENTRY + '"></div>');
		}
		return dataEntryPrototype;
	}
	var databoxData = [];
	var databox = {
		add: function(data) {
			if (!databoxInitialized) {
				initDatabox();
			}
			if (data && databoxData.indexOf(data) == -1) {
				var dataEntry = getDataEntryPrototype().clone().appendTo("#"+CSS_ID_DATABOX);
				dataEntry.text(data);
				databoxData.push(data);
				$("#"+CSS_ID_DATABOX).effect('pulsate', {times: 3});
			}
		}
	};
	
	var timeSliderEventPrototype;
	function getTimeSliderEventPrototype() {
		if (!timeSliderEventPrototype) {
			timeSliderEventPrototype = $('<a class="' + CSS_CLASS_TIMESLIDER_EVENT_LINK + '"></a>');
		}
		return timeSliderEventPrototype;
	}
	var timeSlider;
	var timeSliderEvents = [];
	var eventChain;
    return {
		timeSlider: {
			/**
			 * Initialisiert den TimeSlider wenn der DOM bereit ist
			 */
			init: function() {
				eventChain = WoSec.eventChain;
				eventChain.registerObserver(this);
				$("#"+CSS_ID_TIMESLIDER_PLAY_BUTTON).click(function() {
					eventChain.unlock().play();
				});
				timeSlider = $("#"+CSS_ID_TIMESLIDER).slider({slide: function(event, ui) {
					var value = timeSlider.slider("option", "value");
					var backwards = ui.value < value;
					var searchedEventCommand;
					timeSliderEvents.forEach(function(e) {
						if (e.timestamp <= ui.value) {
							searchedEventCommand = e.eventCommand;
						}
					});
					eventChain.lock().seek(function(eventCommand) {
                        if (!backwards) {
                            eventCommand.execute();
                        } else {
                            eventCommand.unwind();
                        }
						if (eventCommand == searchedEventCommand) {
							return false;
						}
					}, backwards);
				}});
				return this;
			},
			adjustSize: function() {
				var startTime;
                var endTime;
                var min = timeSlider.slider("option", "min");
                var max = timeSlider.slider("option", "max");
                var intervalChanged = false;
                eventChain.forEach(function(eventCommand, i) {
                    if (!timeSliderEvents[i]) { // if not yet created
                        var event = {};
                        event.eventCommand = eventCommand;
                        event.timestamp = eventCommand.getTimestamp();
                        event.entry = getTimeSliderEventPrototype().clone().appendTo('#'+CSS_ID_TIMESLIDER); // create new entry
                        event.entry.addClass("timeslider-entry-"+eventCommand.getClass());
                        timeSliderEvents.push(event);
                    }
                    var time = eventCommand.getTimestamp();
                    if (!startTime || time < startTime) {
                        startTime = time;
                    }
                    if (!endTime || time > endTime) {
                        endTime = time;
                    }
                    if (startTime) {
                        timeSlider.slider("option", "min", startTime);
                        intervalChanged = true;
                    }
                    if (endTime) {
                        timeSlider.slider("option", "max", endTime);
                        intervalChanged = true;
                    }
                });
                if (startTime == min && endTime == max) {
                    intervalChanged = false;
                }
                if (intervalChanged) {
                    var interval = endTime - startTime;
                    timeSliderEvents.forEach(function(e){
                        rightPercent = (endTime - e.timestamp) / interval * 100;
                        e.entry.css("left", (100 - rightPercent) + "%");
                    });
                }
				return this;
			},
			/**
			 * Teil des Beobachtermusters, setzt den TimeSlider in Kenntnis, dass sich die EventChain geändert hat.
			 * @return {TimeSlider} self
			 */
			notify: function() {
				if (eventChain.getLength() != timeSliderEvents.length) {
					this.adjustSize();
					if (eventChain.isLocked()) { // animation on the play button if new events arrieved and the chain is locked
						$('#'+CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY).show();
						$('#'+CSS_ID_TIMESLIDER_PLAY_BUTTON).effect('pulsate', { times:10 }, 1000)
						setTimeout(function() {
							$('#'+CSS_ID_TIMESLIDER_PLAY_BUTTON_OVERLAY).hide();
						}, 10000);
					}
				}
				timeSlider.slider("option", "value", eventChain.getEventCommand(eventChain.getCurrentPosition()).getTimestamp());
				return this;
			}
		},
		/**
		 * Stellt die Informationsfläche dar, die beim Klicken bzw. Überfahren eines Tasks mit der Maus erscheint.
		 * @return {Infobox} neue Infobox
		 */
        createInfobox: function() {
            var infobox = getInfoboxPrototype().clone().appendTo("#"+CSS_ID_INFOBOXES);
			var empty = true;
			
            function setParticipant(participant) {
                infobox.find("."+CSS_CLASS_INFOBOX_PARTICIPANT).text(participant);
            }
			function setData(data) {
				infobox.find("."+CSS_CLASS_INFOBOX_DATA).text(data);
			}
			
            return {
				/**
				 * Bindet die Infobox an ein Rechteck im SVG.
				 * @param {SVGRectangle} rectangle Rechteck im SVG
				 * @return {Infobox} self
				 */
				bindToSVGRectangle: function(rectangle) {
					var position = rectangle.getPosition();
				    infobox.css("top", position.y + position.height);
				    infobox.css("left", position.x + position.width);
				    
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
					
					rectangle.registerOnHover(onHoverHandler);
					infobox.click(onClickHandler);
					return this;
				},
				/**
				 * Zeigt die Informationsfläche.
				 * @return {Infobox} self
				 */
                show: function() {
                    infobox.show();
					return this;
                },
				/**
				 * Verbirgt die Informationsfläche.
				 * @return {Infobox} self
				 */
                hide: function() {
                    infobox.hide();
					return this;
                },
				/**
				 * Setzt den Inhalt (User/Provider sowie Daten) der Infobox
				 * @param {Object} information
				 * @return {Infobox} self
				 */
				setContent: function(information) {
					if (information.participant && information.participant != "") {
						setParticipant(information.participant);
						empty = false;
					}
					if (information.data && information.data != "") {
						setData(information.data);
						databox.add(information.data);
						empty = false;
					}
					return this;
				}
            };
        }
    };
}());
