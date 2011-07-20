
var WoSec = {}; // Namespace

// ES5 Functions
if (typeof Object.create !== 'function') { //source: http://javascript.crockford.com/prototypal.html
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

if (typeof Array.prototype.forEach !== 'function') {
  Array.prototype.forEach = function(callback)//[, thisObject])
  {
    var len = this.length;
    if (typeof callback != "function")
      throw new TypeError();

    var thisObject = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        callback.call(thisObject, this[i], i, this);
    }
  };
}

if (typeof Function.prototype.bind !== "function") { // http://webreflection.blogspot.com/2010/02/functionprototypebind.html

    Function.prototype.bind = (function (slice){

        // (C) WebReflection - Mit Style License
        function bind(context) {

            var self = this; // "trapped" function reference

            // only if there is more than an argument
            // we are interested into more complex operations
            // this will speed up common bind creation
            // avoiding useless slices over arguments
            if (1 < arguments.length) {
                // extra arguments to send by default
                var $arguments = slice.call(arguments, 1);
                return function () {
                    return self.apply(
                        context,
                        // thanks @kangax for this suggestion
                        arguments.length ?
                            // concat arguments with those received
                            $arguments.concat(slice.call(arguments)) :
                            // send just arguments, no concat, no slice
                            $arguments
                    );
                };
            }
            // optimized callback
            return function () {
                // speed up when function is called without arguments
                return arguments.length ? self.apply(context, arguments) : self.call(context);
            };
        }

        // the named function
        return bind;

    }(Array.prototype.slice));
}

WoSec.baseObject = {
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
}

WoSec.inherit = function(subType, superType) {
    var prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}


// crashes with jquery ui, moved to WoSec.baseObject
//if (typeof Object.prototype.later !== 'function') { // source: source: http://www.slideshare.net/douglascrockford/crockford-on-javascript-act-iii-function-the-ultimate (slides 43/44)
//	Object.prototype.later = function (msec, method) {
//		var that = this, args = Array.prototype.slice.apply(arguments, [2]);
//		if (typeof method === 'string') {
//			method = that[method];
//		}
//		setTimeout(function () {
//			method.apply(that, args);
//		}, msec);
//		return that; // Cascade
//	};
//}


//function class(extend, initializer, methods) { // aka new_constructor, source: http://www.slideshare.net/douglascrockford/crockford-on-javascript-act-iii-function-the-ultimate 
//	var func, prototype = Object.create(extend && extend.prototype);
//	if (methods) {
//		methods.keys().forEach(function (key) {
//		prototype[key] = methods[key];
//	});
//	}
//	func = function () {
//		var that = Object.create(prototype);
//	if (typeof initializer === 'function') {
//		initializer.apply(that, arguments);
//	}
//	return that;
//	};
//	func.prototype = prototype;
//	prototype.constructor = func;
//	return func;
//}
/**
 * Singleton (UtilityKlasse), das Funktionalität zur Verwaltung von SVG-Elementen bereitstellt;
 * erstellt SVGRectangles.
 */
WoSec.svgUtility = (function() {
	var CSS_ID_COLORSTORE = 'color-store'
	,	CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR = 'rect-unobtrusive'
	,   CSS_ID_COLORSTORE_OBTRUSIVE_COLOR = 'rect-obtrusive'
	,   CSS_ID_COLORSTORE_RESET_COLOR = 'rect-reset';
	var ANIMATION_IMAGE_PATH = "media/images/fileicon.png" // {width: 34, height: 44}
	,	ANIMATION_IMAGE_SIZE = {width: 25.5, height: 33};
	
	var $ = jQuery;
	
    
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

    function getJQuerySVGRectanglesByActivityID(activityID) {
        return $('svg rect').filter(function() {
            return $(this).attr('bpmn:activity-id') == activityID;// && $(this).attr('fill') == 'white';
        });
    }
	function getCircles(activityID) {
        return $('svg circle').filter(function() {
            return $(this).attr('bpmn:activity-id') == activityID;// && $(this).attr('fill') == 'white';
        });
	}

    function getJQuerySVGRectanglesByActivityGroupID(activityGroupID) {
        return $('svg rect').filter(function() {
            return $(this).attr('bpmn:pool-id') == activityGroupID;
        });
    }
    
    return {
		/**
		 * Bietet Zugriff und Manipulationsmöglichkeiten auf ein Task-Rechteck im SVG.
		 * @param {String} activityID
		 * @return {SVGRectangle} neues SVGRechteck
		 */
        getTaskRectangle: function(activityID) {
            var rectangles = getJQuerySVGRectanglesByActivityID(activityID);
			if (rectangles.length == 0) { // couldn't find rectangles, try circles ("start"-task)
				rectangles = getCircles(activityID);
			}
			if (rectangles.length == 0) {
				throw new Error("No rectangles/circles with activityID:[" + activityID + "] found");
			}
            var that = Object.create(WoSec.baseObject);
			/**
			 * Gibt die Position des Rechtecks zurück.
			 * @return {Object} Position mit x,y,width und height- Eigenschaften (Integer), sowie getCenter()-Methode, welche den Mittelpunkt des Rechtecks zurück gibt
			 */
			that.getPosition = function() {
				return {
					x: parseInt($(rectangles[0]).attr("x")),
					y: parseInt($(rectangles[0]).attr("y")),
					width: parseInt($(rectangles[0]).attr("width")),
					height: parseInt($(rectangles[0]).attr("height")),
					getCenter: function() {
						return {
							x: this.x + this.width/2,
							y: this.y + this.height/2
						};
					}
				}
			};
			
			var texts = $("svg text").filter(function() {
				var pos = that.getPosition();
				return Math.abs(parseInt($(this).attr('x')) - pos.x) < pos.width
				    && Math.abs(parseInt($(this).attr('y')) - pos.y) < pos.height;
			});
			
			function adjustPositionForAnimation(position) {
				position.x -= ANIMATION_IMAGE_SIZE.width/2;
				position.y -= ANIMATION_IMAGE_SIZE.height/2;
				return position;
			}
			
			var animation = this.createAnimation(activityID, adjustPositionForAnimation(that.getPosition().getCenter()));
			/**
			 * Zeigt eine Datenanimation zwischen zwei Tasks
			 * @param {Task} Ziel-Task
			 * @return {SVGRectangle} self
			 */
			that.showAnimation = function(task) {
				animation.show(adjustPositionForAnimation(task.getPosition().getCenter()));
				return this;
			}
			/**
			 * Hebt das Rechteck hervor
			 * @return {SVGRectangle} self
			 */
            that.highlight = function() {
                rectangles.each(function() {
					$(this).effect('pulsate', { times:3 }, 1000);
				})
	            return this;
            };
			/**
			 * Färbt das Rechteck in einer auffälligen Farbe.
			 * @return {SVGRectangle} self
			 */
            that.markObtrusive = function() {
                rectangles.each(function() {
					$(this).attr('fill', $('#'+CSS_ID_COLORSTORE_OBTRUSIVE_COLOR).css('color'));
				});
                return this;
            };
			/**
			 * Färbt das Rechteck in einer unauffälligen Farbe.
			 * @return {SVGRectangle} self
			 */
            that.markUnobtrusive = function() {
                rectangles.each(function() {
                    $(this).attr('fill', $('#'+CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR).css('color'));
                });
                return this;
            };
			
			/**
			 * Setzt das Rechteck zurück (farblich)
			 * @return {SVGRectangle} self
			 */
			that.reset = function() {
				rectangles.each(function() {
                    $(this).attr('fill', $('#'+CSS_ID_COLORSTORE_RESET_COLOR).css('color'));
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
        },
		/**
		 * Erstellt neue Animation mit show(endPosition)-Methode.
		 * @param {String} id
		 * @param {Object} position
		 */
		createAnimation: function(id, position) {
			var that = Object.create(WoSec.baseObject);
			var icon = getAnimationPrototype().cloneNode(true);
			icon.setAttribute("id", id);
			$('svg')[0].appendChild(icon);
			var jQueryIcon = $("#"+id);
			jQueryIcon.hide();
			jQueryIcon.attr("x", position.x);
			jQueryIcon.attr("y", position.y);
			
			that.show = function(endPosition) {
				jQueryIcon.show();
				jQueryIcon.animate({svgY: endPosition.y}, 2000, function() {
					jQueryIcon.hide();
				    jQueryIcon.attr("y", position.y);
				});
				return this;
			};
			
			return that;
		},
		/**
		 * Bietet Hervorheben-Effekt für ein TaskLane-Rechteck im SVG.
		 * @param {String} activityGroupID
		 * @return {SVGRectangle} SVGRechteck, das nur das Hervorheben unterstützt
		 */
        getTaskLaneRectangle: function(activityGroupID) {
            var jQueryRectangles = getJQuerySVGRectanglesByActivityGroupID(activityGroupID);
            var that = Object.create(WoSec.baseObject);
			/**
			 * @see SVGRectangle.highlight
			 */
            that.highlight = function() {
                jQueryRectangles.each(function() {
					$(this).effect('pulsate', { times:1 }, 1000);
				});
            };
			return that;
        }
    };
}());

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

(function() {
    
// var workflow = WoSec.workflow; need late initializiation because of cross dependency

/**
 * Ein Task-Objekt ist assoziiert mit einer Aktivität des BPMN SVG Diagramms.
 * Es verwaltet die zugehörige Infobox und das SVGRectangle,
 * an die Anweisungen zur Darstellung delegiert werden.
 * @param {Infobox} infobox
 * @param {SVGRectangle} rectangle
 * @param {String} correspondingActivityID
 * @return {Task} neues Task-Objekt
 */
function newTask(infobox, rectangle, correspondingActivityID) {
    var that = Object.create(WoSec.baseObject);
	infobox.bindToSVGRectangle(rectangle);
	
	/**
	 * @see Infobox.show
	 * @return {Task} self
	 */
    that.showInfobox = infobox.show;
	/**
	 * @see Infobox.hide
	 * @return {Task} self
	 */
    that.hideInfobox = infobox.hide;
	/**
	 * Gibt den korrespondierenden Task zurück
	 * @return {Task} korrespondierender Task
	 */
	that.getCorrespondingTask = function() {
        return typeof(correspondingActivityID) == "string" && correspondingActivityID != "" && WoSec.workflow.getTaskByID(correspondingActivityID); // lazy load
    };
	/**
	 * @see SVGRectangle.highlight
	 * @return {Task} self
	 */
    that.highlight = rectangle.highlight;
	/**
	 * @see Infobox.setContent
	 * @return {Task} self
	 */
    that.setInformation = infobox.setContent;
	
	/**
	 * @see SVGRectangle.getPosition
	 */
	that.getPosition = rectangle.getPosition;
	
	/**
	 * @see SVGRectangle.showAnimation
	 * @return {Task} self
	 */
	that.animateData = function(){
		this.getCorrespondingTask() && rectangle.showAnimation(this.getCorrespondingTask());
		return this;
	}
	/**
	 * @see SVGRectangle.markObtrusive
	 * @return {Task} self
	 */
    that.markActive = rectangle.markObtrusive;
	/**
	 * @see SVGRectangle.markUnobtrusive
	 * @return {Task} self
	 */
    that.markFinished = rectangle.markUnobtrusive;
	
	/**
	 * @see SVGRectangle.reset
	 * @return {Task} self
	 */
	that.reset = rectangle.reset;
	
	return that;
}

WoSec.newTask = newTask;

}());


/*
 * Another version of Task without powerConstructor
 */
/*(function() {

// import
var workflow = WoSec.workflow;

function Task(htmlInfobox, svgRectangle, correspondingActivityID) {
    this.infobox = htmlInfobox;
    this.rectangle = svgRectangle;
    this.correspondingActivityID = correspondingActivityID;
}
Task.prototype.highlight = function() {
    this.rectangle.highlight();
};
Task.prototype.getInfobox = function() {
    return this.infobox;
};
Task.prototype.setParticipant = function(participant) {
    this.infobox.setParticipant(participant);
};
Task.prototype.getCorrespondingTask = function() {
    return workflow.getTaskByID(this.correspondingActivityID); // lazy load
};
Task.prototype.markActive = function() {
    this.rectangle.markObtrusive();
};

Task.prototype.markFinished = function() {
    this.rectangle.markUnobtrusive();
};



// export
WoSec.Task = Task;

}());*/

(function() {

// var workflow = WoSec.workflow; need late initializiation because of cross dependency

/**
 * Ein Tasklane-Objekt ist assoziiert mit einer ActivityGroup des BPMN SVG Diagramms.
 * Es verwaltet das zugehörige SVGRectangle, an das Anweisungen zur Darstellung delegiert werden.
 * @param {SVGRectangle} rectangle
 * @param {Array} activityIDs
 * @return {TaskLane}
 */
function newTaskLane(rectangle, activityIDs) {
	var that = Object.create(WoSec.baseObject);
	var getTasks = function() {
		var tasks = [];
		activityIDs.forEach(function(activityID, index) { 
            tasks[index] = WoSec.workflow.getTaskByID(activityID);
        });
		return tasks;
	};
	
	/**
	 * @see SVGRectangle.highlight
	 * @return {TaskLane} self
	 */
	that.highlight = rectangle.highlight;
	/**
	 * Setzt Informationen für alle Task in der Lane
	 * @param {Object} information
	 * @return {TaskLane} self
	 */
	that.setInformation = function(information) {
		getTasks().forEach(function(task) {
			task.setInformation(information);
		});
		return this;
	};
	return that;
}

WoSec.newTaskLane = newTaskLane;

}());

/**
 * Das Objekt Workflow stellt ein Singleton dar,
 * das Methoden zum Finden und Erstellen von Tasks (Tasklanes) bereitstellt.
 * Es speichert das Task Repository.
 */
WoSec.workflow = (function() { // Singleton pattern begin
    // import
	var newTask = WoSec.newTask;
	var newTaskLane = WoSec.newTaskLane;
	var htmlRenderer = WoSec.htmlRenderer;
	var svgUtility = WoSec.svgUtility;
	
	var thisInstanceID;
    var taskRepository = {}; // ID => Task
    var taskLaneRepository = {}; // ID => TaskLane
	var correspondingActivities = {}; // ID => ID
	var activitiesInALane = {}; // TaskLaneID => [TaskIDs]
	
    function createTask(activityID) {
		if (typeof(activityID) != "string") {
			throw new TypeError("The given ID is not a String");
		}
        return newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle(activityID), correspondingActivities[activityID]);
    }
    function createTaskLane(activityGroupID) {
		if (typeof(activityGroupID) != "string") {
			throw new TypeError("The given groupID is not a String");
		}
		if (!activitiesInALane[activityGroupID]) {
			throw new Error("Unknown activityGroupID");
		}
        return newTaskLane(svgUtility.getTaskLaneRectangle(activityGroupID), activitiesInALane[activityGroupID]);
    }
    return {
		/**
		 * Initialisiert den Workflow mit den korrespondierenden Tasks und Tasks in einer TaskLane
		 * @param {String} InstanzID
		 * @param {Object} correspondingActivitiesIDs korrespondierende Tasks ID => ID
		 * @param {Object} activityIDsForALane Tasks in einer TaskLane TaskLaneID => [TaskIDs]
		 */
		init: function(instanceID, correspondingActivitiesIDs, activityIDsForALane) {
			thisInstanceID = instanceID;
			correspondingActivities = correspondingActivitiesIDs;
			activitiesInALane = activityIDsForALane;
		},
		/**
		 * Gibt die InstanzID des Workflows zurück
		 * @return InstanzID
		 */
		getInstanceID: function() {
			return thisInstanceID;
		},
		/**
		 * Liefert den Task mit der angegebenen ID zurück
		 * @param {String} activityID
		 * @return {Task} Task ggf. aus Repository
		 */
        getTaskByID: function(activityID) {
			if (!taskRepository[activityID]) {
				taskRepository[activityID] = createTask(activityID)
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
			}
            return taskLaneRepository[activityGroupID];
        }
    };
}()); // Singleton pattern end

(function() {

var workflow = WoSec.workflow;

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
 * Führt die Animation des Befehls aus.
 * @return {EventCommand}
 */
EventCommand.prototype.animate = function() {
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


// weiß nicht so recht hier... gibt verschiedene Möglichkeiten das umzusetzen. Ich denke mal das der klassische Ansatz der einfachste ist...
// WoSec.inherit ermöglicht jedenfalls die Nutzung des instanceof Operators

/**
 * Abstrakte Klasse. Abstrahiert HighlightingEvent und MarkFinishedEvent,
 * die beide eine Statusänderung eines Tasks darstellen.
 * @augments EventCommand
 */
function StateChangingEvent() {}
WoSec.inherit(StateChangingEvent, EventCommand);

/**
 * Beim Starten einer Aktivität delegiert dieses Objekt die Anweisung,
 * sich hervorzuheben, an den zugehörigen Task.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Integer} timestamp Zeitstempel
 */
function HighlightingEvent(task, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
}
WoSec.inherit(HighlightingEvent, StateChangingEvent);
HighlightingEvent.prototype.classname = "HighlightingEvent";
/**
 * @see EventCommand.execute
 */
HighlightingEvent.prototype.execute = function() {
    this.task.markActive();
	this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markActive();
	return this;
};
HighlightingEvent.prototype.unwind = function() {
	this.task.reset();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().reset();
	return this;
}
/**
 * @see EventCommand.animate
 */
HighlightingEvent.prototype.animate = function() {
    this.task.highlight();
	this.task.getCorrespondingTask() && this.task.getCorrespondingTask().highlight();
	return this;
};
/**
 * Factory Methode zur Erstellung eines HighlightingEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 */
HighlightingEvent.create = function(event) {
	return new HighlightingEvent(workflow.getTaskByID(event.activityID), event.timestamp);
};

/**
 * Beim Beenden einer Aktivität delegiert dieses Objekt die Anweisung an den zugehörigen Task,
 *  sich als beendet zu markieren.
 * @augments StateChangingEvent
 * @param {Task} task Zugehöriger Task
 * @param {Object} information Zusätzliche Eventinformationen
 * @param {Integer} timestamp Zeitstempel
 */
function MarkFinishedEvent(task, information, timestamp) {
	EventCommand.call(this, timestamp);
    this.task = task;
	this.information = information || {};
}
WoSec.inherit(MarkFinishedEvent, StateChangingEvent);
MarkFinishedEvent.prototype.classname = "MarkFinishedEvent";
/**
 * @see EventCommand.execute
 */
MarkFinishedEvent.prototype.execute = function() {
    this.task.markFinished();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markFinished();
	this.task.setInformation(this.information);
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().setInformation(this.information);
	return this;
};
MarkFinishedEvent.prototype.unwind = function() {
	this.task.markActive();
    this.task.getCorrespondingTask() && this.task.getCorrespondingTask().markActive();
	return this;
}
//MarkFinishedEvent.prototype.animate = function() {}; // NOP
/**
 * Factory Methode zur Erstellung eines MarkFinishedEvent
 * @param {Object} event Eventdaten
 * @param {String} event.activityID Aktivitäts ID
 * @param {Integer} event.timestamp Zeitstempel
 * @param {Object} event.information zusätzliche Eventinformationen
 * 
 */
MarkFinishedEvent.create = function(event) {
	return new MarkFinishedEvent(workflow.getTaskByID(event.activityID), event.information, event.timestamp);
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
}
WoSec.inherit(TransferingDataEvent, EventCommand);
TransferingDataEvent.prototype.classname = "TransferingDataEvent";
/**
 * @see EventCommand.execute
 */
TransferingDataEvent.prototype.execute = function() {
    this.task.setInformation(this.information);
	return this;
};
// TransferingDataEvent.prototype.unwind = function() {} // NOP
/**
 * @see EventCommand.animate
 */
TransferingDataEvent.prototype.animate = function() {
    this.task.animateData();
	return this;
};
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
}
WoSec.inherit(SpecifyingParticipantEvent, EventCommand);
SpecifyingParticipantEvent.prototype.classname = "SpecifyingParticipantEvent";
/**
 * @see EventCommand.execute
 */
SpecifyingParticipantEvent.prototype.execute = function() {
    this.taskLane.setInformation(this.information);
	return this;
};
// SpecifyingParticipantEvent.prototype.unwind = function() {} // NOP
/**
 * @see EventCommand.animate
 */
SpecifyingParticipantEvent.prototype.animate = function() {
    this.taskLane.highlight();
	return this;
};
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
EventCommand.EventCommand = EventCommand;
EventCommand.StateChanging = StateChangingEvent;
EventCommand.Highlighting = HighlightingEvent;
EventCommand.MarkFinished = MarkFinishedEvent;
EventCommand.TransferingData = TransferingDataEvent;
EventCommand.SpecifyingParticipant = SpecifyingParticipantEvent;

WoSec.EventCommand = EventCommand;

}());


/**
 * Singleton zur Verwaltung einer Liste von EventCommands
 * und eines Zeigers zur momentanen (zeitlichen) Position der Events
 * @type EventChain
 */
WoSec.eventChain = (function () {
	const PLAY_TIME_BETWEEN_EVENTS_MS = 750;
	var   EventCommand = WoSec.EventCommand;
    
	var events = [];
	var currentPosition = 0;
	var observers = [];
	var locked = false;

    return {
		/**
		 * Registriert einen Beobachter
		 * @param {Object} observer
		 * @return {EventChain} self
		 */
		registerObserver: function(observer) {
			if (typeof observer.notify !== "function") {
				throw new Error("Observer has to support notify()-Method");
			}
			observers.push(observer);
			return this;
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
				if (!EventCommand[event.eventCommand]) {
					throw new Error("Unknown EventCommand: " + event.eventCommand);
				}
				events.push(EventCommand[event.eventCommand].create(event)); // factory method
			});
			observers.forEach(function(observer) {
				observer.notify();
			});
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
			observers.forEach(function(observer) {
				observer.notify();
			});
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
			this.seek(function(eventCommand){
				eventCommand.later(after, "execute")
							.later(after, "animate");
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
    };
}());

/**
 * Singleton zum Abfragen neuer Eventdaten alle paar Sekunden (Default 5).
 * Empfangene Eventdaten werden an die EventChain weitergegeben.
 */
WoSec.ajaxUpdater = (function() {
	const DELAY_BETWEEN_POLLS = 5000
	,	  POLL_URL = "UpdateController?type=Event";
	
	var $ = jQuery;
    var eventChain = WoSec.eventChain;
	var workflow = WoSec.workflow;
	
    return {
		/**
		 * Startet den Abfrageprozess.
		 */
        init: function (lastVisitedTimestamp) {
			var times = 0;
            lastVisitedTimestamp = lastVisitedTimestamp || 0;
			function ajax(callback) {
				$.getJSON(POLL_URL, {since: eventChain.last().getTimestamp() + 1, instance: workflow.getInstanceID()}, callback);
			}
			ajax(function(data) { 
				if (data.length != 0) {
					eventChain.add(data).seek(function(eventCommand) {
						return eventCommand.getTimestamp() <= lastVisitedTimestamp && eventCommand.execute(); // seek forward until the timestamp is newer than the lastVisited
					}).play();
				}
			});
			var playAndAddLoop = function(data) {
				if (data.length != 0) {
					eventChain.add(data).play();
				}
				setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
			}
			setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
            $("body").ajaxError(function(){
                times++;
                if (times >= 3) {
                    alert("Verbindung zum Server verloren!");
                } else {
                    setTimeout(ajax, DELAY_BETWEEN_POLLS, playAndAddLoop);
                }
            });
		}
    };
}());
