
//jquery.event.js



//jquery.lang.vector.js

(function(){
	var getSetZero = function(v){ return v !== undefined ? (this.array[0] = v) : this.array[0] },
		getSetOne = function(v){ return v !== undefined ? (this.array[1] = v) : this.array[1] }
/**
 * @class
 * A vector class
 * @constructor creates a new vector instance from the arguments.  Example:
 * @codestart
 * new jQuery.Vector(1,2)
 * @codeend
 * 
 */
jQuery.Vector = function(){
	this.update( jQuery.makeArray(arguments) );
};
jQuery.Vector.prototype = 
/* @Prototype*/
{
	/**
	 * Applys the function to every item in the vector.  Returns the new vector.
	 * @param {Function} f
	 * @return {jQuery.Vector} new vector class.
	 */
	app: function( f ) {
		  var newArr = [];
		  
		  for(var i=0; i < this.array.length; i++)
			  newArr.push( f(  this.array[i] ) );
		  var vec = new jQuery.Vector();
		  return vec.update(newArr);
	},
	/**
	 * Adds two vectors together.  Example:
	 * @codestart
	 * new Vector(1,2).plus(2,3) //-> &lt;3,5>
	 * new Vector(3,5).plus(new Vector(4,5)) //-> &lt;7,10>
	 * @codeend
	 * @return {jQuery.Vector}
	 */
	plus: function() {
		var args = arguments[0] instanceof jQuery.Vector ? 
				 arguments[0].array : 
				 jQuery.makeArray(arguments), 
			arr=this.array.slice(0), 
			vec = new jQuery.Vector();
		for(var i=0; i < args.length; i++)
			arr[i] = (arr[i] ? arr[i] : 0) + args[i];
		return vec.update(arr);
	},
	/**
	 * Like plus but subtracts 2 vectors
	 * @return {jQuery.Vector}
	 */
	minus: function() {
		 var args = arguments[0] instanceof jQuery.Vector ? 
				 arguments[0].array : 
				 jQuery.makeArray(arguments), 
			 arr=this.array.slice(0), vec = new jQuery.Vector();
		 for(var i=0; i < args.length; i++)
			arr[i] = (arr[i] ? arr[i] : 0) - args[i];
		 return vec.update(arr);
	},
	/**
	 * Returns the current vector if it is equal to the vector passed in.  
	 * False if otherwise.
	 * @return {jQuery.Vector}
	 */
	equals: function() {
		var args = arguments[0] instanceof jQuery.Vector ? 
				 arguments[0].array : 
				 jQuery.makeArray(arguments), 
			 arr=this.array.slice(0), vec = new jQuery.Vector();
		 for(var i=0; i < args.length; i++)
			if(arr[i] != args[i]) return null;
		 return vec.update(arr);
	},
	/*
	 * Returns the 2nd value of the vector
	 * @return {Number}
	 */
	x : getSetZero,
	width : getSetZero,
	/**
	 * Returns the first value of the vector
	 * @return {Number}
	 */
	y : getSetOne,
	height : getSetOne,
	/**
	 * Same as x()
	 * @return {Number}
	 */
	top : getSetOne,
	/**
	 * same as y()
	 * @return {Number}
	 */
	left : getSetZero,
	/**
	 * returns (x,y)
	 * @return {String}
	 */
	toString: function() {
		return "("+this.array[0]+","+this.array[1]+")";
	},
	/**
	 * Replaces the vectors contents
	 * @param {Object} array
	 */
	update: function( array ) {
		if(this.array){
			for(var i =0; i < this.array.length; i++) delete this.array[i];
		}
		this.array = array;
		for(var i =0; i < array.length; i++) this[i]= this.array[i];
		return this;
	}
};

jQuery.Event.prototype.vector = function(){
	if(this.originalEvent.synthetic){
		var doc = document.documentElement, body = document.body;
		return  new jQuery.Vector(this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), 
								  this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0));
	}else{
		return new jQuery.Vector(this.pageX, this.pageY);
	}
}

jQuery.fn.offsetv = function() {
	if(this[0] == window){
		return new jQuery.Vector(window.pageXOffset ? window.pageXOffset : document.documentElement.scrollLeft,
							  window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop)
	}else{
		var offset = this.offset();
 		 return new jQuery.Vector(offset.left, offset.top);
	}
};

jQuery.fn.dimensionsv = function(){
	if(this[0] == window)
		return new jQuery.Vector(this.width(), this.height());
	else
		return new jQuery.Vector(this.outerWidth(), this.outerHeight());
}
jQuery.fn.centerv = function(){
	return this.offsetv().plus( this.dimensionsv().app(function(u){return u /2;})  )
}

jQuery.fn.makePositioned = function() {
	return this.each(function(){
		var that = jQuery(this);
		var pos = that.css('position');

		if (!pos || pos == 'static') {
			var style = { position: 'relative' };

			if (window.opera) {
				style.top = '0px';
				style.left = '0px';
			}
			that.css(style);
		}
	});
};
	
})(jQuery);

//jquery.event.livehack.js

(function(){

	var event = jQuery.event,
		
		//helper that finds handlers by type and calls back a function, this is basically handle
		findHelper = function(events, types, callback){
			for( var t =0; t< types.length; t++ ) {
				var type = types[t], 
					typeHandlers,
					all = type.indexOf(".") < 0,
					namespaces,
					namespace; 
				if ( !all ) {
					namespaces = type.split(".");
					type = namespaces.shift();
					namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
				}
				typeHandlers = ( events[type] || [] ).slice(0);
				
				for( var h = 0; h <typeHandlers.length; h++ ) {
					var handle = typeHandlers[h];
					if( !handle.selector && (all || namespace.test( handle.namespace ))  ){
						callback(type, handle.origHandler || handle.handler);
					}
				}
			}
		}
	
	/**
	 * Finds event handlers of a given type on an element.
	 * @param {HTMLElement} el
	 * @param {Array} types an array of event names
	 * @param {String} [selector] optional selector
	 * @return {Array} an array of event handlers
	 */
	event.find  = function(el, types, selector){
		var events = $.data(el, "events"), 
			handlers = [];

		if( !events ) {
			return handlers;
		}
		
		if( selector ) {
			if (!events.live) { 
				return [];
			}
			var live = events.live;

			for ( var t = 0; t < live.length; t++ ) {
				var liver = live[t];
				if(  liver.selector === selector &&  $.inArray(liver.origType, types  ) !== -1 ) {
					handlers.push(liver.origHandler || liver.handler);
				}
			}
		}else{
			// basically re-create handler's logic
			findHelper(events, types, function(type, handler){
				handlers.push(handler);
			})
		}
		return handlers;
	}
	/**
	 * Finds 
	 * @param {HTMLElement} el
	 * @param {Array} types
	 */
	event.findBySelector = function(el, types){
		var events = $.data(el, "events"), 
			selectors = {}, 
			//adds a handler for a given selector and event
			add = function(selector, event, handler){
				var select = selectors[selector] ||  (selectors[selector] = {}),
					events = select[event] || (select[event] = []);
				events.push(handler);
			};

		if ( !events ) {
			return selectors;
		}
		//first check live:
		$.each( events.live||[] , function(i, live) {
			if( $.inArray(live.origType, types  ) !== -1 ) {
				add( live.selector, live.origType, live.origHandler || live.handler );
			}
		})
		//then check straight binds
		
		findHelper(events, types, function(type, handler){
			add("", type, handler);
		})
		
		return selectors;
	}
	$.fn.respondsTo = function(events){
		if(!this.length){
			return false;
		}else{
			//add default ?
			return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
		}
	}
	$.fn.triggerHandled = function(event, data){
		event = ( typeof event == "string" ? $.Event(event) : event);
		this.trigger(event, data);
		return event.handled;
	}
	/**
	 * Only attaches one event handler for all types ...
	 * @param {Array} types llist of types that will delegate here
	 * @param {Object} startingEvent the first event to start listening to
	 * @param {Object} onFirst a function to call 
	 */
	event.setupHelper = function(types, startingEvent, onFirst){
		if(!onFirst) {
			onFirst = startingEvent;
			startingEvent = null;
		}
		var add = function(handleObj){
			
			var selector = handleObj.selector || "";
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).delegate(selector,startingEvent, onFirst );
				}
			}
			else {
				//var bySelector = event.find(this, types, selector);
				if(!event.find(this, types, selector).length){
					event.add(this, startingEvent, onFirst, {
						selector: selector,
						delegate: this
					});
				}
				
			}
			
		}
		var remove = function(handleObj){
			var selector = handleObj.selector || "";
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).undelegate(selector,startingEvent, onFirst );
				}
			}
			else {
				if (!event.find(this, types, selector).length) {
					event.remove(this, startingEvent, onFirst, {
						selector: selector,
						delegate: this
					});
				}
			}
		}
		$.each(types, function(){
			event.special[this] = {
				add:  add,
				remove: remove,
				setup: function() {},
				teardown: function() {}
			};
		});
	}
})(jQuery);

//jquery.event.drag.js

(function($){
	//modify live
	//steal the live handler ....
	
	
	
	var bind = function(object, method){  
			var args = Array.prototype.slice.call(arguments, 2);  
			return function() {  
				var args2 = [this].concat(args, $.makeArray( arguments ));  
				return method.apply(object, args2);  
			};  
		},
		event = $.event, handle  = event.handle;
		
	/**
	 * @class jQuery.Drag
	 * @parent specialevents
	 * @plugin jquery/event/drag
	 * @download jquery/dist/jquery.event.drag.js
	 * @test jquery/event/drag/qunit.html
	 * Provides drag events as a special events to jQuery.  
	 * A jQuery.Drag instance is created on a drag and passed
	 * as a parameter to the drag event callbacks.  By calling
	 * methods on the drag event, you can alter the drag's
	 * behavior.
	 * <h2>Drag Events</h2>
	 * The drag plugin allows you to listen to the following events:
	 * <ul>
	 * 	<li><code>dragdown</code> - the mouse cursor is pressed down</li>
	 *  <li><code>draginit</code> - the drag motion is started</li>
	 *  <li><code>dragmove</code> - the drag is moved</li>
	 *  <li><code>dragend</code> - the drag has ended</li>
	 *  <li><code>dragover</code> - the drag is over a drop point</li>
	 *  <li><code>dragout</code> - the drag moved out of a drop point</li>
	 * </ul>
	 * <p>Just by binding or delegating on one of these events, you make
	 * the element dragable.  You can change the behavior of the drag
	 * by calling methods on the drag object passed to the callback.
	 * <h3>Example</h3>
	 * Here's a quick example:
	 * @codestart
	 * //makes the drag vertical
	 * $(".drags").live("draginit", function(event, drag){
	 *   drag.vertical();
	 * })
	 * //gets the position of the drag and uses that to set the width
	 * //of an element
	 * $(".resize").live("dragmove",function(event, drag){
	 *   $(this).width(drag.position.left() - $(this).offset().left   )
	 * })
	 * @codeend
	 * <h2>Drag Object</h2>
	 * <p>The drag object is passed after the event to drag 
	 * event callback functions.  By calling methods
	 * and changing the properties of the drag object,
	 * you can alter how the drag behaves.
	 * </p>
	 * <p>The drag properties and methods:</p>
	 * <ul>
	 * 	<li><code>[jQuery.Drag.prototype.cancel cancel]</code> - stops the drag motion from happening</li>
	 *  <li><code>[jQuery.Drag.prototype.ghost ghost]</code> - copys the draggable and drags the cloned element</li>
	 *  <li><code>[jQuery.Drag.prototype.horizontal horizontal]</code> - limits the scroll to horizontal movement</li>
	 *  <li><code>[jQuery.Drag.prototype.location location]</code> - where the drag should be on the screen</li>
	 *  <li><code>[jQuery.Drag.prototype.mouseElementPosition mouseElementPosition]</code> - where the mouse should be on the drag</li>
	 *  <li><code>[jQuery.Drag.prototype.only only]</code> - only have drags, no drops</li>
	 *  <li><code>[jQuery.Drag.prototype.representative representative]</code> - move another element in place of this element</li>
	 *  <li><code>[jQuery.Drag.prototype.revert revert]</code> - animate the drag back to its position</li>
	 *  <li><code>[jQuery.Drag.prototype.vertical vertical]</code> - limit the drag to vertical movement</li>
	 *  <li><code>[jQuery.Drag.prototype.limit limit]</code> - limit the drag within an element (*limit plugin)</li>
	 *  <li><code>[jQuery.Drag.prototype.scrolls scrolls]</code> - scroll scrollable areas when dragging near their boundries (*scroll plugin)</li>
	 * </ul>
	 * <h2>Demo</h2>
	 * Now lets see some examples:
	 * @demo jquery/event/drag/drag.html 1000
	 * @constructor
	 * The constructor is never called directly.
	 */
	$.Drag = function(){}
	
	/**
	 * @Static
	 */
	$.extend($.Drag,
	{
		lowerName: "drag",
		current : null,
		/**
		 * Called when someone mouses down on a draggable object.
		 * Gathers all callback functions and creates a new Draggable.
		 * @hide
		 */
		mousedown: function( ev, element ) {
			var isLeftButton = ev.button == 0 || ev.button == 1;
			if( !isLeftButton || this.current) return; //only allows 1 drag at a time, but in future could allow more
			
			//ev.preventDefault();
			//create Drag
			var drag = new $.Drag(), 
			delegate = ev.liveFired || element,
			selector = ev.handleObj.selector,
			self = this;
			this.current = drag;

			drag.setup({
				element: element,
				delegate: ev.liveFired || element,
				selector: ev.handleObj.selector,
				moved: false,
				callbacks: {
					dragdown: event.find(delegate, ["dragdown"], selector),
					draginit: event.find(delegate, ["draginit"], selector),
					dragover: event.find(delegate, ["dragover"], selector),
					dragmove: event.find(delegate, ["dragmove"], selector),
					dragout: event.find(delegate, ["dragout"], selector),
					dragend: event.find(delegate, ["dragend"], selector)
				},
				destroyed: function() {
					self.current = null;
				}
			}, ev)
		}
	})
	
	
	
	
	
	/**
	 * @Prototype
	 */
	$.extend($.Drag.prototype , {
		setup: function( options, ev ) {
			//this.noSelection();
			$.extend(this,options);
			this.element = $(this.element);
			this.event = ev;
			this.moved = false;
			this.allowOtherDrags = false;
			var mousemove = bind(this, this.mousemove);
			var mouseup =   bind(this, this.mouseup);
			this._mousemove = mousemove;
			this._mouseup = mouseup;
			$(document).bind('mousemove' ,mousemove);
			$(document).bind('mouseup',mouseup);
			
			if(! this.callEvents('down',this.element, ev) ){
				ev.preventDefault();
			}
		},
		/**
		 * Unbinds listeners and allows other drags ...
		 * @hide
		 */
		destroy  : function() {
			$(document).unbind('mousemove', this._mousemove);
			$(document).unbind('mouseup', this._mouseup);
			if(!this.moved){
				this.event = this.element = null;
			}
			//this.selection();
			this.destroyed();
		},
		mousemove: function( docEl, ev ) {
			if(!this.moved){
				this.init(this.element, ev)
				this.moved= true;
			}
			
			var pointer = ev.vector();
			if (this._start_position && this._start_position.equals(pointer)) {
				return;
			}
			//e.preventDefault();
			
			this.draw(pointer, ev);
		},
		mouseup: function( docEl,event ) {
			//if there is a current, we should call its dragstop
			if(this.moved){
				this.end(event);
			}
			this.destroy();
		},
		noSelection: function() {
			document.documentElement.onselectstart = function() { return false; }; 
			document.documentElement.unselectable = "on"; 
			$(document.documentElement).css('-moz-user-select', 'none'); 
		},
		selection: function() {
			document.documentElement.onselectstart = function() { }; 
			document.documentElement.unselectable = "off"; 
			$(document.documentElement).css('-moz-user-select', ''); 
		},
		init: function( element, event ) {
			element = $(element);
			var startElement = (this.movingElement = (this.element = $(element)));         //the element that has been clicked on
													//if a mousemove has come after the click
			this._cancelled = false;                //if the drag has been cancelled
			this.event = event;
			this.mouseStartPosition = event.vector(); //where the mouse is located
			/**
			 * @attribute mouseElementPosition
			 * The position of start of the cursor on the element
			 */
			this.mouseElementPosition = this.mouseStartPosition.minus( this.element.offsetv() ); //where the mouse is on the Element
	
			//this.callStart(element, event);
			this.callEvents('init',element, event)
			
			//Check what they have set and respond accordingly
			//  if they canceled
			if(this._cancelled == true) return;
			//if they set something else as the element
			
			this.startPosition = startElement != this.movingElement ? this.movingElement.offsetv() : this.currentDelta();
	
			this.movingElement.makePositioned();
			this.oldZIndex = this.movingElement.css('zIndex');
			this.movingElement.css('zIndex',1000);
			if(!this._only && this.constructor.responder)
				this.constructor.responder.compile(event, this);
		},
		callEvents: function( type, element, event, drop ) {
			var cbs = this.callbacks[this.constructor.lowerName+type];
			for(var i=0; i  < cbs.length; i++){
				cbs[i].call(element, event, this, drop)
			}
			return cbs.length
		},
		/**
		 * Returns the position of the movingElement by taking its top and left.
		 * @hide
		 * @return {Vector}
		 */
		currentDelta: function() {
			return new $.Vector( parseInt( this.movingElement.css('left') ) || 0 , 
								parseInt( this.movingElement.css('top') )  || 0 )  ;
		},
		//draws the position of the dragmove object
		draw: function( pointer, event ) {
			// only drag if we haven't been cancelled;
			if(this._cancelled) return;
			/**
			 * @attribute location
			 * The location of where the element should be in the page.  This 
			 * takes into account the start position of the cursor on the element.
			 */
			this.location =  pointer.minus(this.mouseElementPosition);                              // the offset between the mouse pointer and the representative that the user asked for
			// position = mouse - (dragOffset - dragTopLeft) - mousePosition
			this.move( event );
			if(this._cancelled) return;
			if(!event.isDefaultPrevented())
				this.position(this.location);

			//fill in
			if(!this._only && this.constructor.responder)
				this.constructor.responder.show(pointer, this, event);  
		},
		/**
		 * @hide
		 * Set the drag to only allow horizontal dragging.
		 * 
		 * @param {Object} offsetPositionv the position of the element (not the mouse)
		 */
		position: function( offsetPositionv ) {  //should draw it on the page
			var dragged_element_page_offset = this.movingElement.offsetv();          // the drag element's current page location
			
			var dragged_element_css_offset = this.currentDelta();                   //  the drag element's current left + top css attributes
			
			var dragged_element_position_vector =                                   // the vector between the movingElement's page and css positions
				dragged_element_page_offset.minus(dragged_element_css_offset);      // this can be thought of as the original offset
			
			this.required_css_position = offsetPositionv.minus(dragged_element_position_vector)
			
			

			var style = this.movingElement[0].style;
			if(!this._cancelled && !this._horizontal) {
				style.top =  this.required_css_position.top() + "px"
			}
			if(!this._cancelled && !this._vertical){
				style.left = this.required_css_position.left() + "px"
			}
		},
		move: function( event ) {
			this.callEvents('move',this.element, event)
		},
		over: function( event, drop ) {
			this.callEvents('over',this.element, event, drop)
		},
		out: function( event, drop ) {
			this.callEvents('out',this.element, event, drop)
		},
		/**
		 * Called on drag up
		 * @hide
		 * @param {Event} event a mouseup event signalling drag/drop has completed
		 */
		end: function( event ) {
			if(this._cancelled) return;
			if(!this._only && this.constructor.responder)
				this.constructor.responder.end(event, this);
	
			this.callEvents('end',this.element, event)
	
			if(this._revert){
				var self= this;
				this.movingElement.animate(
					{
						top: this.startPosition.top()+"px",
						left: this.startPosition.left()+"px"},
						function(){
							self.cleanup.apply(self, arguments)
						}
				)
			}
			else
				this.cleanup();
			this.event = null;
		},
		/**
		 * Cleans up drag element after drag drop.
		 * @hide
		 */
		cleanup: function() {
			this.movingElement.css({zIndex: this.oldZIndex});
			if (this.movingElement[0] !== this.element[0])
				this.movingElement.css({ display: 'none' });
			if(this._removeMovingElement)
				this.movingElement.remove();
				
			this.movingElement = this.element = this.event = null;
		},
		/**
		 * Stops drag drop from running.
		 */
		cancel: function() {
			this._cancelled = true;
			//this.end(this.event);
			if(!this._only && this.constructor.responder)
				this.constructor.responder.clear(this.event.vector(), this, this.event);  
			this.destroy();
			
		},
		/**
		 * Clones the element and uses it as the moving element.
		 * @return {jQuery.fn} the ghost
		 */
		ghost: function( loc ) {
			// create a ghost by cloning the source element and attach the clone to the dom after the source element
			var ghost = this.movingElement.clone().css('position','absolute');
			(loc ? $(loc) : this.movingElement ).after(ghost);
			ghost.width(this.movingElement.width())
				.height(this.movingElement.height())
				
			// store the original element and make the ghost the dragged element
			this.movingElement = ghost;
			this._removeMovingElement = true;
			return ghost;
		},
		/**
		 * Use a representative element, instead of the movingElement.
		 * @param {HTMLElement} element the element you want to actually drag
		 * @param {Number} offsetX the x position where you want your mouse on the object
		 * @param {Number} offsetY the y position where you want your mouse on the object
		 */
		representative: function( element, offsetX, offsetY ){
			this._offsetX = offsetX || 0;
			this._offsetY = offsetY || 0;
	
			var p = this.mouseStartPosition;
	
			this.movingElement = $(element);
			this.movingElement.css({
				top: (p.y() - this._offsetY) + "px",
				left: (p.x() - this._offsetX) + "px",
				display: 'block',
				position: 'absolute'
			}).show();
	
			this.mouseElementPosition = new $.Vector(this._offsetX, this._offsetY)
		},
		/**
		 * Makes the movingElement go back to its original position after drop.
		 * @codestart
		 * ".handle dragend" : function( el, ev, drag ) {
		 *    drag.revert()
		 * }
		 * @codeend
		 * @param {Boolean} [val] optional, set to false if you don't want to revert.
		 */
		revert: function( val ) {
			this._revert = val == null ? true : val;
		},
		/**
		 * Isolates the drag to vertical movement.
		 */
		vertical: function() {
			this._vertical = true;
		},
		/**
		 * Isolates the drag to horizontal movement.
		 */
		horizontal: function() {
			this._horizontal = true;
		},
		
		
		/**
		 * Respondables will not be alerted to this drag.
		 */
		only: function( only ) {
			return (this._only = (only === undefined ? true : only));
		}
	});
	
	/**
	 * @add jQuery.event.special
	 */
	event.setupHelper( [
		/**
		 * @attribute dragdown
		 * <p>Listens for when a drag movement has started on a mousedown.
		 * If you listen to this, the mousedown's default event (preventing
		 * text selection) is not prevented.  You are responsible for calling it
		 * if you want it (you probably do).  </p>
		 * <p><b>Why might you not want it?</b></p>
		 * <p>You might want it if you want to allow text selection on element
		 * within the drag element.  Typically these are input elements.</p>
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 * @codestart
		 * $(".handles").live("dragdown", function(ev, drag){})
		 * @codeend
		 */
		'dragdown',
		/**
		 * @attribute draginit
		 * Called when the drag starts.
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 */
		'draginit',
		/**
		 * @attribute dragover
		 * Called when the drag is over a drop.
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 */
		'dragover',
		/**
		 * @attribute dragmove
		 * Called when the drag is moved.
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 */
		'dragmove',
		/**
		 * @attribute dragout
		 * When the drag leaves a drop point.
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 */
		'dragout', 
		/**
		 * @attribute dragend
		 * Called when the drag is done.
		 * <p>Drag events are covered in more detail in [jQuery.Drag].</p>
		 */
		'dragend'
		], "mousedown", function(e){
		$.Drag.mousedown.call($.Drag, e, this)
		
	} )
	
	


})(jQuery);

//jquery.event.drag.limit.js

(function($){
	
	
	$.Drag.prototype.
	/**
	 * @function limit
	 * @plugin jquery/event/drag/limit
	 * @download jquery/dist/jquery.event.drag.limit.js
	 * limits the drag to a containing element
	 * @param {jQuery} container
	 */
	limit = function(container){
		//on draws ... make sure this happens
		this._limit = {
			offset: container.offsetv(),
			size : container.dimensionsv()
		}
	}
	
	var oldPosition = $.Drag.prototype.position;
	$.Drag.prototype.position = function(offsetPositionv){
		//adjust required_css_position accordingly
		if(this._limit){
			var movingSize = this.movingElement.dimensionsv(),
			    lot = this._limit.offset.top(),
				lof = this._limit.offset.left()
				height = this._limit.size.height(),
				width = this._limit.size.width();
			
			//check if we are out of bounds ...
			//above
			if(offsetPositionv.top() < lot){
				offsetPositionv.top( lot )
			}
			//below
			if(offsetPositionv.top()+movingSize.height() > lot+ height){
				offsetPositionv.top( lot+ height - movingSize.height() )
			}
			//left
			if(offsetPositionv.left() < lof){
				offsetPositionv.left( lof )
			}
			//right
			if(offsetPositionv.left()+movingSize.width() > lof+ width){
				offsetPositionv.left( lof+ width - movingSize.left() )
			}
		}
		
		oldPosition.call(this, offsetPositionv)
	}
	
})(jQuery);

//jquery.dom.js



//jquery.dom.within.js

(function($){
   var withinBox = function(x, y, left, top, width, height ){
        return (y >= top &&
                y <  top + height &&
                x >= left &&
                x <  left + width);
    } 
/**
 * @function within
 * @parent dom
 * Returns if the elements are within the position
 * @param {Object} x
 * @param {Object} y
 * @param {Object} cache
 */
$.fn.within= function(x, y, cache) {
    var ret = []
    this.each(function(){
        var q = jQuery(this);

        if(this == document.documentElement) return ret.push(this);

        var offset = cache ? jQuery.data(this,"offset", q.offset()) : q.offset();

        var res =  withinBox(x, y, 
                                      offset.left, offset.top,
                                      this.offsetWidth, this.offsetHeight );

        if(res) ret.push(this);
    });
    
    return this.pushStack( jQuery.unique( ret ), "within", x+","+y );
}


/**
 * @function withinBox
 * returns if elements are within the box
 * @param {Object} left
 * @param {Object} top
 * @param {Object} width
 * @param {Object} height
 * @param {Object} cache
 */
$.fn.withinBox = function(left, top, width, height, cache){
  	var ret = []
    this.each(function(){
        var q = jQuery(this);

        if(this == document.documentElement) return  this.ret.push(this);

        var offset = cache ? jQuery.data(this,"offset", q.offset()) : q.offset();

        var ew = q.width(), eh = q.height();

		res =  !( (offset.top > top+height) || (offset.top +eh < top) || (offset.left > left+width ) || (offset.left+ew < left));

        if(res)
            ret.push(this);
    });
    return this.pushStack( jQuery.unique( ret ), "withinBox", jQuery.makeArray(arguments).join(",") );
}
    
})(jQuery);

//jquery.dom.compare.js

(function($){
/**
 * @function compare
 * @parent dom
 * @download jquery/dist/jquery.compare.js
 * Compares the position of two nodes and returns a bitmask detailing how they are positioned 
 * relative to each other.  You can expect it to return the same results as 
 * [http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition | compareDocumentPosition].
 * Parts of this documentation and source come from [http://ejohn.org/blog/comparing-document-position | John Resig].
 * <h2>Demo</h2>
 * @demo jquery/dom/compare/compare.html
 * @test jquery/dom/compare/qunit.html
 * @plugin dom/compare
 * @param {HTMLElement} a the first node
 * @param {HTMLElement} b the second node
 * @return {Number} A bitmap with the following digit values:
 * <table class='options'>
 *     <tr><th>Bits</th><th>Number</th><th>Meaning</th></tr>
 *     <tr><td>000000</td><td>0</td><td>Elements are identical.</td></tr>
 *     <tr><td>000001</td><td>1</td><td>The nodes are in different documents (or one is outside of a document).</td></tr>
 *     <tr><td>000010</td><td>2</td><td>Node B precedes Node A.</td></tr>
 *     <tr><td>000100</td><td>4</td><td>Node A precedes Node B.</td></tr>
 *     <tr><td>001000</td><td>8</td><td>Node B contains Node A.</td></tr>
 *     <tr><td>010000</td><td>16</td><td>Node A contains Node B.</td></tr>
 * </table>
 */
jQuery.fn.compare = function(b){ //usually 
	//b is usually a relatedTarget, but b/c it is we have to avoid a few FF errors
	
	try{ //FF3 freaks out with XUL
		b = b.jquery ? b[0] : b;
	}catch(e){
		return null;
	}
	if (window.HTMLElement) { //make sure we aren't coming from XUL element
		var s = HTMLElement.prototype.toString.call(b)
		if (s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]') return null;
	}
	if(this[0].compareDocumentPosition){
		return this[0].compareDocumentPosition(b);
	}
	if(this[0] == document && b != document) return 8;
	var number = (this[0] !== b && this[0].contains(b) && 16) + (this[0] != b && b.contains(this[0]) && 8),
		docEl = document.documentElement;
	if(this[0].sourceIndex){
		number += (this[0].sourceIndex < b.sourceIndex && 4)
		number += (this[0].sourceIndex > b.sourceIndex && 2)
		number += (this[0].ownerDocument !== b.ownerDocument ||
			(this[0] != docEl && this[0].sourceIndex <= 0 ) ||
			(b != docEl && b.sourceIndex <= 0 )) && 1
	}else{
		var range = document.createRange(), 
			sourceRange = document.createRange(),
			compare;
		range.selectNode(this[0]);
		sourceRange.selectNode(b);
		compare = range.compareBoundaryPoints(Range.START_TO_START, sourceRange);
		
	}

	return number;
}

})(jQuery);

//jquery.event.drop.js

(function($){
	var event = $.event, 
		callHanders = function(){
			
		};
	//somehow need to keep track of elements with selectors on them.  When element is removed, somehow we need to know that
	//
	/**
	 * @add jQuery.event.special
	 */
	var eventNames = [
	/**
	 * @attribute dropover
	 * Called when a drag is first moved over this drop element.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropover",
	/**
	 * @attribute dropon
	 * Called when a drag is dropped on a drop element.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropon",
	/**
	 * @attribute dropout
	 * Called when a drag is moved out of this drop.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropout",
	/**
	 * @attribute dropinit
	 * Called when a drag motion starts and the drop elements are initialized.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropinit",
	/**
	 * @attribute dropmove
	 * Called repeatedly when a drag is moved over a drop.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropmove",
	/**
	 * @attribute dropend
	 * Called when the drag is done for this drop.
	 * <p>Drop events are covered in more detail in [jQuery.Drop].</p>
	 */
	"dropend"];
	
	
	
	/**
	 * @class jQuery.Drop
	 * @parent specialevents
	 * @plugin jquery/event/drop
	 * @download jquery/dist/jquery.event.drop.js
	 * @test jquery/event/drag/qunit.html
	 * 
	 * Provides drop events as a special event to jQuery.  
	 * By binding to a drop event, the your callback functions will be 
	 * called during the corresponding phase of drag.
	 * <h2>Drop Events</h2>
	 * All drop events are called with the native event, an instance of drop, and the drag.  Here are the available drop 
	 * events:
	 * <ul>
	 * 	<li><code>dropinit</code> - the drag motion is started, drop positions are calculated.</li>
	 *  <li><code>dropover</code> - a drag moves over a drop element, called once as the drop is dragged over the element.</li>
	 *  <li><code>dropout</code> - a drag moves out of the drop element.</li>
	 *  <li><code>dropmove</code> - a drag is moved over a drop element, called repeatedly as the element is moved.</li>
	 *  <li><code>dropon</code> - a drag is released over a drop element.</li>
	 *  <li><code>dropend</code> - the drag motion has completed.</li>
	 * </ul>
	 * <h2>Examples</h2>
	 * Here's how to listen for when a drag moves over a drop:
	 * @codestart
	 * $('.drop').live("dropover", function(ev, drop, drag){
	 *   $(this).addClass("drop-over")
	 * })
	 * @codeend
	 * A bit more complex example:
	 * @demo jquery/event/drop/drop.html 1000
	 * @constructor
	 * The constructor is never called directly.
	 */
	$.Drop = function(callbacks, element){
		jQuery.extend(this,callbacks);
		this.element = element;
	}
	$.each(eventNames, function(){
			event.special[this] = {
				add: function( handleObj ) {
					//add this element to the compiles list
					var el = $(this), current = (el.data("dropEventCount") || 0);
					el.data("dropEventCount",  current+1   )
					if(current==0){
						$.Drop.addElement(this);
					}
				},
				remove: function() {
					var el = $(this), current = (el.data("dropEventCount") || 0);
					el.data("dropEventCount",  current-1   )
					if(current<=1){
						$.Drop.removeElement(this);
					}
				}
			}
	})
	$.extend($.Drop,{
		lowerName: "drop",
		_elements: [], //elements that are listening for drops
		_responders: [], //potential drop points
		last_active: [],
		endName: "dropon",
		addElement: function( el ) {
			//check other elements
			for(var i =0; i < this._elements.length ; i++  ){
				if(el ==this._elements[i]) return;
			}
			this._elements.push(el);
		},
		removeElement: function( el ) {
			 for(var i =0; i < this._elements.length ; i++  ){
				if(el == this._elements[i]){
					this._elements.splice(i,1)
					return;
				}
			}
		},
		/**
		* @hide
		* For a list of affected drops, sorts them by which is deepest in the DOM first.
		*/ 
		sortByDeepestChild: function( a, b ) {
			var compare = a.element.compare(b.element);
			if(compare & 16 || compare & 4) return 1;
			if(compare & 8 || compare & 2) return -1;
			return 0;
		},
		/**
		 * @hide
		 * Tests if a drop is within the point.
		 */
		isAffected: function( point, moveable, responder ) {
			return ((responder.element != moveable.element) && (responder.element.within(point[0], point[1], responder).length == 1));
		},
		/**
		 * @hide
		 * Calls dropout and sets last active to null
		 * @param {Object} drop
		 * @param {Object} drag
		 * @param {Object} event
		 */
		deactivate: function( responder, mover, event ) {
			mover.out(event, responder)
			responder.callHandlers(this.lowerName+'out',responder.element[0], event, mover)
		}, 
		/**
		 * @hide
		 * Calls dropover
		 * @param {Object} drop
		 * @param {Object} drag
		 * @param {Object} event
		 */
		activate: function( responder, mover, event ) { //this is where we should call over
			mover.over(event, responder)
			//this.last_active = responder;
			responder.callHandlers(this.lowerName+'over',responder.element[0], event, mover);
		},
		move: function( responder, mover, event ) {
			responder.callHandlers(this.lowerName+'move',responder.element[0], event, mover)
		},
		/**
		 * Gets all elements that are droppable, adds them
		 */
		compile: function( event, drag ) {
			var el, drops, selector, sels;
			this.last_active = [];
			for(var i=0; i < this._elements.length; i++){ //for each element
				el = this._elements[i]
				var drops = $.event.findBySelector(el, eventNames)

				for(selector in drops){ //find the selectors
					sels = selector ? jQuery(selector, el) : [el];
					for(var e= 0; e < sels.length; e++){ //for each found element, create a drop point
						jQuery.removeData(sels[e],"offset");
						this.add(sels[e], new this(drops[selector]), event, drag);
					}
				}
			}
			
		},
		add: function( element, callbacks, event, drag ) {
			element = jQuery(element);
			var responder = new $.Drop(callbacks, element);
			responder.callHandlers(this.lowerName+'init', element[0], event, drag)
			if(!responder._canceled){
				this._responders.push(responder);
			}
		},
		show: function( point, moveable, event ) {
			var element = moveable.element;
			if(!this._responders.length) return;
			
			var respondable, 
				affected = [], 
				propagate = true, 
				i,j, la, toBeActivated, aff, 
				oldLastActive = this.last_active;
				
			for(var d =0 ; d < this._responders.length; d++ ){
				
				if(this.isAffected(point, moveable, this._responders[d])){
					affected.push(this._responders[d]);  
				}
					 
			}
			
			affected.sort(this.sortByDeepestChild); //we should only trigger on lowest children
			event.stopRespondPropagate = function(){
				propagate = false;
			}
			//deactivate everything in last_active that isn't active
			toBeActivated = affected.slice();
			this.last_active = affected;
			for (j = 0; j < oldLastActive.length; j++) {
				la = oldLastActive[j]
				i = 0;
				while((aff = toBeActivated[i])){
					if(la == aff){
						toBeActivated.splice(i,1);break;
					}else{
						i++;
					}
				}
				if(!aff){
					this.deactivate(la, moveable, event);
				}
				if(!propagate) return;
			}
			for(var i =0; i < toBeActivated.length; i++){
				this.activate(toBeActivated[i], moveable, event);
				if(!propagate) return;
			}
			//activate everything in affected that isn't in last_active
			
			for (i = 0; i < affected.length; i++) {
				this.move(affected[i], moveable, event);
				
				if(!propagate) return;
			}
		},
		end: function( event, moveable ) {
			var responder, la;
			for(var r =0; r<this._responders.length; r++){
				this._responders[r].callHandlers(this.lowerName+'end', null, event, moveable);
			}
			//go through the actives ... if you are over one, call dropped on it
			for(var i = 0; i < this.last_active.length; i++){
				la = this.last_active[i]
				if( this.isAffected(event.vector(), moveable, la)  && la[this.endName]){
					la.callHandlers(this.endName, null, event, moveable);
				}
			}
			
			
			this.clear();
		},
		/**
		 * Called after dragging has stopped.
		 * @hide
		 */
		clear: function() {
		  
		  this._responders = [];
		}
	})
	$.Drag.responder = $.Drop;
	
	$.extend($.Drop.prototype,{
		callHandlers: function( method, el, ev, drag ) {
			var length = this[method] ? this[method].length : 0
			for(var i =0; i < length; i++){
				this[method][i].call(el || this.element[0], ev, this, drag)
			}
		},
		/**
		 * Caches positions of draggable elements.  This should be called in dropinit.  For example:
		 * @codestart
		 * dropinit: function( el, ev, drop ) { drop.cache_position() }
		 * @codeend
		 */
		cache: function( value ) {
			this._cache = value != null ? value : true;
		},
		/**
		 * Prevents this drop from being dropped on.
		 */
		cancel: function() {
			this._canceled = true;
		}
	} )
})(jQuery);

//jquery.event.drag.scroll.js

(function($){ //needs drop to determine if respondable

/**
 * @add jQuery.Drag.prototype
 */
$.Drag.prototype.
	/**
	 * Will scroll elements with a scroll bar as the drag moves to borders.
	 * @plugin jquery/event/drag/scroll
	 * @download jquery/dist/jquery.event.drag.scroll.js
	 * @param {jQuery} elements to scroll.  The window can be in this array.
	 */
	scrolls = function(elements){
		for(var i = 0 ; i < elements.length; i++){
			this.constructor.responder._responders.push( new $.Scrollable(elements[i]) )
		}
	},
	
$.Scrollable = function(element){
	this.element = jQuery(element);
}
$.extend($.Scrollable.prototype,{
	init: function( element ) {
		this.element = jQuery(element);
	},
	callHandlers: function( method, el, ev, drag ) {
		this[method](el || this.element[0], ev, this, drag)
	},
	dropover: function() {
		
	},
	dropon: function() {
		this.clear_timeout();
	}, 
	dropout: function() {
		this.clear_timeout();
	},
	dropinit: function() {
		
	},
	dropend: function() {},
	clear_timeout: function() {
		if(this.interval){
			clearTimeout(this.interval)
			this.interval = null;
		}
	},
	distance: function( diff ) {
		return (30 - diff) / 2;
	},
	dropmove: function( el, ev, drop, drag ) {
		
		//if we were about to call a move, clear it.
		this.clear_timeout();
		
		//position of the mouse
		var mouse = ev.vector(),
		
		//get the object we are going to get the boundries of
			location_object = $(el == document.documentElement ? window : el),
		
		//get the dimension and location of that object
			dimensions = location_object.dimensionsv(),
			position = location_object.offsetv(),
		
		//how close our mouse is to the boundries
			bottom = position.y()+dimensions.y() - mouse.y(),
			top = mouse.y() - position.y(),
			right = position.x()+dimensions.x() - mouse.x(),
			left = mouse.x() - position.x(),
		
		//how far we should scroll
			dx =0, dy =0;

		
		//check if we should scroll
		if(bottom < 30)
			dy = this.distance(bottom);
		else if(top < 30)
			dy = -this.distance(top)
		if(right < 30)
			dx = this.distance(right);
		else if(left < 30)
			dx = -this.distance(left);
		
		//if we should scroll
		if(dx || dy){
			//set a timeout that will create a mousemove on that object
			var self = this;
			this.interval =  setTimeout( function(){
				self.move($(el), drag.movingElement, dx, dy, ev, ev.clientX, ev.clientY, ev.screenX, ev.screenY)
			},15)
		}
	},
	/**
	 * Scrolls an element then calls mouse a mousemove in the same location.
	 * @param {HTMLElement} scroll_element the element to be scrolled
	 * @param {HTMLElement} drag_element
	 * @param {Number} dx how far to scroll
	 * @param {Number} dy how far to scroll
	 * @param {Number} x the mouse position
	 * @param {Number} y the mouse position
	 */
	move: function( scroll_element, drag_element, dx, dy, ev/*, x,y,sx, sy*/ ) {
		scroll_element.scrollTop( scroll_element.scrollTop() + dy);
		scroll_element.scrollLeft(scroll_element.scrollLeft() + dx);
		
		drag_element.trigger(
			$.event.fix({type: "mousemove", 
					 clientX: ev.clientX, 
					 clientY: ev.clientY, 
					 screenX: ev.screenX, 
					 screenY: ev.screenY,
					 pageX:   ev.pageX,
					 pageY:   ev.pageY}))
		//drag_element.synthetic('mousemove',{clientX: x, clientY: y, screenX: sx, screenY: sy})
	}
})

})(jQuery);
