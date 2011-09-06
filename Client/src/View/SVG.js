
(function() {
	
var $ = jQuery;
const CSS_ID_COLORSTORE = 'color-store'
,	  CSS_ID_COLORSTORE_UNOBTRUSIVE_COLOR = 'rect-unobtrusive'
,     CSS_ID_COLORSTORE_OBTRUSIVE_COLOR = 'rect-obtrusive'
,     CSS_ID_COLORSTORE_RESET_COLOR = 'rect-reset';
const ANIMATION_IMAGE_PATH = "media/images/fileicon.png" // {width: 34, height: 44}
,	  ANIMATION_IMAGE_SIZE = {width: 25.5, height: 33};

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

function getJQuerySVGRectanglesByActivityGroupID($svg, activityGroupID) {
    return $svg.find('svg rect').filter(function() {
       return $(this).attr('bpmn:pool-id') == activityGroupID;
    });
}

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
 * SVG beobachtet einen Workflow und erstellt zu jedem Task(Lane)
 * korrespondierende SVG Elemente.
 */
WoSec.newSVG = function SVG(id) {
	
    var $svg = $("#" + id);
    var lastKnownTaskID;
    var lastKnownTaskLaneID;
    
    var taskRectangleRepository = {};
    
    return {
        /**
         * Benachrichtige-Methode des Beobachter Musters
         * @param {Workflow} workflow beobachteter Workflow
         */
        notify: function(workflow) {
            var taskIDs = workflow.getTaskRepositoryEntries();
            var taskID;
            for (var i = taskIDs.length-1; i >= 0; i--) {
                taskID = taskIDs[i]
                if (lastKnownTaskID == taskID) {
                    break;
                }
                var task = workflow.getTaskByID(taskID);
                var rectangle = this.newTaskRectangle(taskID);
                task.registerObserver(rectangle);
                task.registerObserver(thistory.newDataAnimation(taskID, rectangle.getPosition().getCenter(), 
                    this.getTaskRectangle(task.getCorrespondingTask().getID()).getPosition().getCenter()));
                
            }
            lastKnownTaskID = taskID;
            
            var taskLaneIDs = workflow.getTaskLaneRepositoryEntries();
            var taskLaneID;
            for (var i = taskLaneIDs.length-1; i >= 0; i--) {
                taskID = taskLaneIDs[i]
                if (lastKnownTaskLaneID == taskLaneID) {
                    break;
                }
                workflow.getTaskLaneByID(taskLaneID).registerObserver(this.newTaskLaneRectangle(taskLaneID));
            }
            lastKnownTaskLaneID = taskLaneID;
            return this;
        },
		/**
		 * Bietet Zugriff und Manipulationsmöglichkeiten auf ein Task-Rechteck im SVG.
		 * @param {String} activityID
		 * @return {SVGTaskRectangle} neues SVGTaskRechteck
		 */
        getTaskRectangle: function SVGTaskRectangle(activityID) {
            if (taskRectangleRepository[activityID]) {
                return taskRectangleRepository[activityID];
            }
            
            var rectangles = getJQuerySVGRectanglesByActivityID($svg, activityID) || getJQuerySVGCircles($svg, activityID);
			if (!rectangles.length) {
				throw new Error("No rectangles/circles with activityID:[" + activityID + "] found");
			}
            var that = Object.create(WoSec.baseObject);
            
            /**
             * Benachrichtige-Methode des Beobachter Musters
             * @param {Task} task beobachteter Task
             */
            that.notify = function(task) {
                switch (task.getState()) {
                    case "Reset": this.reset(); break;
                    case "Starting": this.highlight(); break;
                    case "Started": this.markObtrusive(); break;
                    case "Finished": this.markUnObtrusive(); break;
                }
            };
            
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
			
			taskRectangleRepository[activityID] = that;
			
            return that;
        },
		/**
		 * Erstellt neue Animation mit show(endPosition)-Methode.
		 * @param {String} id
		 * @param {Object} startPosition Position von der die Animation beginnt
		 * @param {Object} endPosition Position bei der die Animation endet
		 * @param {Object} position
		 */
		newDataAnimation: function SVGDataAnimation(id, startPosition, endPosition) {
		    
            function adjustPosition(position) {
                position.x -= ANIMATION_IMAGE_SIZE.width/2;
                position.y -= ANIMATION_IMAGE_SIZE.height/2;
                return position;
            }
            startPosition = adjustPosition(startPosition);
            endPosition = adjustPosition(endPosition);
            
		    
			var that = Object.create(WoSec.baseObject);
			var icon = getAnimationPrototype().cloneNode(true);
			icon.setAttribute("id", id);
			$svg.find('svg')[0].appendChild(icon);
			var jQueryIcon = $("#"+id);
			jQueryIcon.hide();
			jQueryIcon.attr("x", position.x);
			jQueryIcon.attr("y", position.y);
			/**
             * Zeigt eine Datenanimation
             * @return {SVGTaskRectangle} self
             */
			that.show = function() {
				jQueryIcon.show();
				jQueryIcon.animate({svgY: endPosition.y}, 2000, function() {
					jQueryIcon.hide();
				    jQueryIcon.attr("y", startPposition.y);
				});
				return this;
			};
			
			/**
             * Benachrichtige-Methode des Beobachter Musters
             * @param {Task} task beobachteter Task
             */
			that.notify = function(task) {
			    switch(task.getState()) {
			        case "Sending": this.show(); break;
			    }
			};
			
			return that;
		},
		/**
		 * Bietet Hervorheben-Effekt für ein TaskLane-Rechteck im SVG.
		 * @param {String} activityGroupID
		 * @return {SVGTaskLaneRectangle} SVGRechteck, das nur das Hervorheben unterstützt
		 */
        newTaskLaneRectangle: function SVGTaskLaneRectangle(activityGroupID) {
            var jQueryRectangles = getJQuerySVGRectanglesByActivityGroupID($svg, activityGroupID);
            var that = Object.create(WoSec.baseObject);
			/**
			 * @see SVGTaskRectangle.highlight
			 */
            that.highlight = function() {
                jQueryRectangles.each(function() {
					$(this).effect('pulsate', { times:1 }, 1000);
				});
            };
            /**
             * Benachrichtige-Methode des Beobachter Musters
             */
            that.notify = that.highlight;
            
			return that;
        }
    };

}

}());
