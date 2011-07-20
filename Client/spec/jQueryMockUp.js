
var jQueryMockUp = {
    filter: function(){
        var array = ["someRectangle"];
        array.each = array.forEach;
        return array;
    },
    attr: function(){
        return "10";
    },
    effect: function(){
        return this;
    },
    hide: function(){
        return this;
    },
    show: function(){
        return this;
    },
    click: function(){
        return this;
    },
    hover: function(){
        return this;
    },
    find: function(){
        return this;
    },
    text: function(){
        return this;
    },
    css: function(){
        return this;
    },
    slideToggle: function(){
        return this;
    },
    clone: function(){
        return this;
    },
    appendChild: function(){
        return this;
    },
    appendTo: function(){
        return this;
    },
	getJSON: function(url, args, callback) {
		var result = this.ajax();
		if(result == false) {
			//call ajaxError handler
		} else {
			callback.call(result);
		}
		return true;
	},
	ajax: function() {
		return false;
	},
	ajaxError: function(callback) {
		var errorcallback = callback;
	}
	
};
jQueryMockUp[0] = jQueryMockUp;

var jQuery = function(){
    return jQueryMockUp;
};

