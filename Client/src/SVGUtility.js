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
