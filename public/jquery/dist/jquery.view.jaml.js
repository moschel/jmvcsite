// jquery/view/view.js

(function($){


	// converts to an ok dom id
	var toId = function( src ) {
		return src.replace(/^\/\//, "").replace(/[\/\.]/g, "_");
	},
		// used for hookup ids
		id = 1;

	/**
	 * @class jQuery.View
	 * @tag core
	 * @plugin jquery/view
	 * @test jquery/view/qunit.html
	 * 
	 * View provides a uniform interface for using templates with 
	 * jQuery. When template engines [jQuery.View.register register] 
	 * themselves, you are able to:
	 * 
	 * <ul>
	 *  <li>Use views with jQuery extensions [jQuery.fn.after after], [jQuery.fn.append append],
	 *   [jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
	 *      [jQuery.fn.replace replace], [jQuery.fn.replaceWith replaceWith], [jQuery.fn.text text] like:
	 * @codestart
	 * $('.foo').html("//path/to/view.ejs",{})
	 * @codeend
	 *  </li>
	 *  <li>Compress processed views with [steal.static.views].</li>
	 *  <li>Use the [jQuery.Controller.prototype.view controller/view] plugin to auto-magically
	 *  lookup views.</li>
	 *  <li>Hookup jquery plugins directly in the template.</li>
	 *  
	 * </ul>
	 * 
	 * ## Supported Template Engines
	 * 
	 * JavaScriptMVC comes with the following template languages:
	 * 
	 *  - [jQuery.EJS EJS] - provides an ERB like syntax: <code>&lt;%= %&gt;</code>
	 *  - [Jaml] - A functional approach to JS templates.
	 *  - [Micro] - A very lightweight template similar to EJS.
	 *  - [jQuery.tmpl] - A very lightweight template similar to EJS.
	 * 
	 * There are 3rd party plugins that provide other template
	 * languages.
	 * 
	 * ## Use
	 * 
	 * Views provide client side templating.  When you use a view, you're
	 * almost always wanting to insert the rendered content into the page.
	 * 
	 * For this reason, the most common way to use a views is through
	 * jQuery modifier functions like [jQuery.fn.html html].  The view
	 * plugin overwrites these functions so you can render a view and
	 * insert its contents into the page with one convenient step.
	 * 
	 * The following renders the EJS template at 
	 * <code>//app/view/template.ejs</code> with the second parameter used as data.
	 * It inserts the result of the template into the 
	 * <code>'#foo'</code> element.
	 * 
	 * @codestart
	 * $('#foo').html('//app/view/template.ejs',
	 *                {message: "hello world"})
	 * @codeend
	 * 
	 * <code>//app/view/template.ejs</code> might look like:
	 * 
	 * @codestart xml
	 * &lt;h2>&lt;%= message %>&lt;/h2>&lt;/div>
	 * @codeend
	 * 
	 * The resulting output would be:
	 * 
	 * @codestart xml
	 * &lt;div id='foo'>&lt;h2>hello world&lt;/h2>&lt;/div>
	 * @codeend
	 * 
	 * The specifics of each templating languages are covered in their
	 * individual documentation pages.
	 * 
	 * ### Template Locations
	 * 
	 * In the example above, we used 
	 * <code>//app/view/template.ejs</code> as the location of
	 * our template file. Using // at the start of a path
	 * references the template from the root JavaScriptMVC directory.
	 * 
	 * If there is no // at the start of the path, the view is looked up
	 * relative to the current page.
	 * 
	 * It's recommended that you use paths rooted from the JavaScriptMVC
	 * directory.  This will make your code less likely to change.
	 * 
	 * You can also use the [jQuery.Controller.prototype.view controller/view]
	 * plugin to make looking up templates a little easier.
	 * 
	 * ### Using $.View
	 * 
	 * Sometimes you want to get the string result of a view and not
	 * insert it into the page right away.  Nested templates are a good
	 * example of this.  For this, you can use $.View.  The following
	 * iterates through a list of contacts, and inserts the result of a
	 * sub template in each:
	 * 
	 * @codestart xml
	 * &lt;% for(var i =0 ; i < contacts.length; i++) { %>
	 *   &lt;%= $.View("//contacts/contact.ejs",contacts[i]) %>
	 * &lt;% } %>
	 * @codeend
	 * 
	 * ## Compress Views with Steal
	 * 
	 * Steal can package processed views in the production 
	 * file. Because 'stolen' views are already
	 * processed, they don't rely on eval and are much faster. Here's 
	 * how to steal them:
	 * 
	 * @codestart
	 * steal.views('//views/tasks/show.ejs');
	 * @codeend
	 * 
	 * Read more about [steal.static.views steal.views].
	 * 
	 * 
	 * <h2>$.View</h2>
	 * 
	 * Looks up a template, processes it, caches it, then renders the template
	 * with data and optional helpers.
	 * 
	 * With [stealjs StealJS], views are typically bundled in the production build.
	 * This makes it ok to use views synchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"})
	 * @codeend
	 * 
	 * If you aren't using StealJS, it's best to use views asynchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"}, function(result){
	 *   // do something with result
	 * })
	 * @codeend
	 * 
	 * @param {String} view The url or id of an element to use as the template's source.
	 * @param {Object} data The data to be passed to the view.
	 * @param {Object} [helpers] Optional helper functions the view might use. Not all
	 * templates support helpers.
	 * @param {Object} [callback] Optional callback function.  If present, the template is 
	 * retrieved asynchronously.  This is a good idea if you aren't compressing the templates
	 * into your view.
	 * @return {String} The rendered result of the view.
	 */

	var $view, render, checkText, get;

	$view = $.View = function( view, data, helpers, callback ) {
		var suffix = view.match(/\.[\w\d]+$/),
			type, el, id, renderer, url = view;
		if ( typeof helpers === 'function' ) {
			callback = helpers;
			helpers = undefined;
		}
		//if there is no suffix, add one
		if (!suffix ) {
			suffix = $.View.ext;
			url = url + $.View.ext;
		}

		//convert to a unique and valid id
		id = toId(url);

		//if a absolute path, use steal to get it
		if ( url.match(/^\/\//) ) {
			url = steal.root.join(url.substr(2)); //can steal be removed?
		}

		//get the template engine
		type = $.View.types[suffix];

		//get the renderer function
		renderer =
		$.View.cached[id] ? // is it cached?
		$.View.cached[id] : // use the cached version
		((el = document.getElementById(view)) ? //is it in the document?
		type.renderer(id, el.innerHTML) : //use the innerHTML of the elemnt
		get(type, id, url, data, helpers, callback) //do an ajax request for it
		);
		// we won't always get a renderer (if async ajax)
		return renderer && render(renderer, type, id, data, helpers, callback);
	};
	// caches the template, renders the content, and calls back if it should
	render = function( renderer, type, id, data, helpers, callback ) {
		var res, stub;
		if ( $.View.cache ) {
			$.View.cached[id] = renderer;
		}
		res = renderer.call(type, data, helpers);
		stub = callback && callback(res);
		return res;
	};
	// makes sure there's a template
	checkText = function( text, url ) {
		if (!text.match(/[^\s]/) ) {
			throw "$.View ERROR: There is no template or an empty template at " + url;
		}
	};
	// gets a template, if there's a callback, renders and calls back its;ef
	get = function( type, id, url, data, helpers, callback ) {
		if ( callback ) {
			$.ajax({
				url: url,
				dataType: "text",
				error: function() {
					checkText("", url);
				},
				success: function( text ) {
					checkText(text, url);
					render(type.renderer(id, text), type, id, data, helpers, callback);
				}
			});
		} else {
			var text = $.ajax({
				async: false,
				url: url,
				dataType: "text",
				error: function() {
					checkText("", url);
				}
			}).responseText;
			checkText(text, url);
			return type.renderer(id, text);
		}

	};


	$.extend($.View, {
		/**
		 * @attribute hookups
		 * @hide
		 * A list of pending 'hookups'
		 */
		hookups: {},
		/**
		 * @function hookup
		 * Registers a hookup function to be called back after the html is put on the page
		 * @param {Function} cb a callback function to be called with the element
		 * @param {Number} the hookup number
		 */
		hookup: function( cb ) {
			var myid = ++id;
			$view.hookups[myid] = cb;
			return myid;
		},
		/**
		 * @attribute cached
		 * @hide
		 * Cached are put in this object
		 */
		cached: {},
		/**
		 * @attribute cache
		 * Should the views be cached or reloaded from the server. Defaults to true.
		 */
		cache: true,
		/**
		 * @function register
		 * Registers a template engine to be used with 
		 * view helpers and compression.  
		 * @param {Object} info a object of method and properties 
		 * that enable template integration:
		 * <ul>
		 *   <li>suffix - the view extension.  EX: 'ejs'</li>
		 *   <li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
		 *    used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
		 *   <li>renderer(id, text) - a function that takes the id of the template and the text of the template and
		 *    returns a render function.</li>
		 * </ul>
		 */
		register: function( info ) {
			this.types["." + info.suffix] = info;
		},
		types: {},
		/**
		 * @attribute ext
		 * The default suffix to use if none is provided in the view's url.  
		 * This is set to .ejs by default.
		 */
		ext: ".ejs",
		/**
		 * Returns the text that 
		 * @hide 
		 * @param {Object} type
		 * @param {Object} id
		 * @param {Object} src
		 */
		registerScript: function( type, id, src ) {
			return "$.View.preload('" + id + "'," + $.View.types["." + type].script(id, src) + ");";
		},
		/**
		 * @hide
		 * Called by a production script to pre-load a renderer function
		 * into the view cache.
		 * @param {String} id
		 * @param {Function} renderer
		 */
		preload: function( id, renderer ) {
			$.View.cached[id] = function( data, helpers ) {
				return renderer.call(data, data, helpers);
			};
		}

	});


	//---- ADD jQUERY HELPERS -----
	//converts jquery functions to use views	
	var convert, modify, isTemplate, getCallback, hookupView, funcs;

	convert = function( func_name ) {
		var old = jQuery.fn[func_name];

		jQuery.fn[func_name] = function() {
			var args = $.makeArray(arguments),
				callbackNum, callback, self = this;

			//check if a template
			if ( isTemplate(args) ) {

				// if we should operate async
				if ((callbackNum = getCallback(args))) {
					callback = args[callbackNum];
					args[callbackNum] = function( result ) {
						modify.call(self, [result], old);
						callback.call(self, result);
					};
					$.View.apply($.View, args);
					return this;
				}

				//otherwise do the template now
				args = [$.View.apply($.View, args)];
			}

			return modify.call(this, args, old);
		};
	};
	// modifies the html of the element
	modify = function( args, old ) {
		var res, stub;

		//check if there are new hookups
		for ( var hasHookups in jQuery.View.hookups ) {
			// Having arbitrary code in here makes JSLint pass
			if ( true ) {
				stub = true;
			}
		}

		//if there are hookups, get jQuery object
		if ( hasHookups ) {
			args[0] = $(args[0]);
		}
		res = old.apply(this, args);

		//now hookup hookups
		if ( hasHookups ) {
			hookupView(args[0]);
		}
		return res;
	};

	// returns true or false if the args indicate a template is being used
	isTemplate = function( args ) {
		var secArgType = typeof args[1];

		return typeof args[0] == "string" && (secArgType == 'object' || secArgType == 'function') && !args[1].nodeType && !args[1].jquery;
	};

	//returns the callback if there is one (for async view use)
	getCallback = function( args ) {
		return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
	};

	hookupView = function( els ) {
		//remove all hookups
		var hooks = jQuery.View.hookups,
			hookupEls, len, i = 0,
			id, func;
		jQuery.View.hookups = {};
		hookupEls = els.add("[data-view-id]", els);
		len = hookupEls.length;
		for (; i < len; i++ ) {
			if ( hookupEls[i].getAttribute && (id = hookupEls[i].getAttribute('data-view-id')) && (func = hooks[id]) ) {
				func(hookupEls[i], id);
				delete hooks[id];
				hookupEls[i].removeAttribute('data-view-id');
			}
		}
		//copy remaining hooks back
		$.extend(jQuery.View.hookups, hooks);
	};

	/**
	 *  @add jQuery.fn
	 */
	funcs = [
	/**
	 *  @function prepend
	 *  @parent jQuery.View
	 *  abc
	 */
	"prepend",
	/**
	 *  @function append
	 *  @parent jQuery.View
	 *  abc
	 */
	"append",
	/**
	 *  @function after
	 *  @parent jQuery.View
	 *  abc
	 */
	"after",
	/**
	 *  @function before
	 *  @parent jQuery.View
	 *  abc
	 */
	"before",
	/**
	 *  @function replace
	 *  @parent jQuery.View
	 *  abc
	 */
	"replace",
	/**
	 *  @function text
	 *  @parent jQuery.View
	 *  abc
	 */
	"text",
	/**
	 *  @function html
	 *  @parent jQuery.View
	 *  abc
	 */
	"html",
	/**
	 *  @function replaceWith
	 *  @parent jQuery.View
	 *  abc
	 */
	"replaceWith"];

	//go through helper funcs and convert
	for ( var i = 0; i < funcs.length; i++ ) {
		convert(funcs[i]);
	}


})(true);

// jquery/view/jaml/jaml.js

(function($){

	


/**
 * @class Jaml
 * @plugin jquery/view/jaml
 * @parent jQuery.View
 * @author Ed Spencer (http://edspencer.net)
 * Jaml is a simple JavaScript library which makes 
 * HTML generation easy and pleasurable.
 * 
 * Instead of magic tags, Jaml is pure JS.  It looks like:
 * 
 * @codestart
 * function(data) {
 *   h3(data.message);
 * }
 * @codeend
 * 
 * Jaml is integrated into jQuery.View so you can use it like:
 * 
 * @codestart
 * $("#foo").html('//app/views/template.jaml',{});
 * @codeend
 * 
 * ## Use
 * 
 * For more info check out:
 * 
 *  - [http://edspencer.net/2009/11/jaml-beautiful-html-generation-for-javascript.html introduction]
 *  - [http://edspencer.github.com/jaml examples]
 * 
 */
Jaml = function() {
  return {
    templates: {},
    helpers  : {},
    
    /**
     * Registers a template by name
     * @param {String} name The name of the template
     * @param {Function} template The template function
     */
    register: function(name, template ) {
      this.templates[name] = template;
    },
    
    /**
     * Renders the given template name with an optional data object
     * @param {String} name The name of the template to render
     * @param {Object} data Optional data object
     */
    render: function(name, data ) {
      var template = this.templates[name],
          renderer = new Jaml.Template(template);
          
      return renderer.render(data);
    },
    
    /**
     * Registers a helper function
     * @param {String} name The name of the helper
     * @param {Function} helperFn The helper function
     */
    registerHelper: function(name, helperFn ) {
      this.helpers[name] = helperFn;
    }
  };
}();



/**
 * @class
 * @constructor
 * @param {String} tagName The tag name this node represents (e.g. 'p', 'div', etc)
 */
Jaml.Node = function(tagName) {
  /**
   * @attribute tagName
   * @type String
   * This node's current tag
   */
  this.tagName = tagName;
  
  /**
   * @attribute attributes
   * @type Object
   * Sets of attributes on this node (e.g. 'cls', 'id', etc)
   */
  this.attributes = {};
  
  /**
   * @attribute children
   * @type Array
   * Array of rendered child nodes that will be steald as this node's innerHTML
   */
  this.children = [];
};

Jaml.Node.prototype = {
  /**
   * Adds attributes to this node
   * @param {Object} attrs Object containing key: value pairs of node attributes
   */
  setAttributes: function(attrs ) {
    for (var key in attrs) {
      //convert cls to class
      var mappedKey = key == 'cls' ? 'class' : key;
      
      this.attributes[mappedKey] = attrs[key];
    }
  },
  
  /**
   * Adds a child string to this node. This can be called as often as needed to add children to a node
   * @param {String} childText The text of the child node
   */
  addChild: function(childText ) {
    this.children.push(childText);
  },
  
  /**
   * Renders this node with its attributes and children
   * @param {Number} lpad Amount of whitespace to add to the left of the string (defaults to 0)
   * @return {String} The rendered node
   */
  render: function(lpad ) {
    lpad = lpad || 0;
    
    var node      = [],
        attrs     = [],
        textnode  = (this instanceof Jaml.TextNode),
        multiline = this.multiLineTag();
    
    for (var key in this.attributes) {
      attrs.push(key + '=' + this.attributes[key]);
    }
    
    //add any left padding
    if (!textnode) node.push(this.getPadding(lpad));
    
    //open the tag
    node.push("<" + this.tagName);
    
    //add any tag attributes
    for (var key in this.attributes) {
      node.push(" " + key + "=\"" + this.attributes[key] + "\"");
    }
    
    if (this.isSelfClosing()) {
      node.push(" />\n");
    } else {
      node.push(">");
      
      if (multiline) node.push("\n");
      
      for (var i=0; i < this.children.length; i++) {
        node.push(this.children[i].render(lpad + 2));
      }
      
      if (multiline) node.push(this.getPadding(lpad));
      node.push("</", this.tagName, ">\n");
    }
    
    return node.join("");
  },
  
  /**
   * Returns true if this tag should be rendered with multiple newlines (e.g. if it contains child nodes)
   * @return {Boolean} True to render this tag as multi-line
   */
  multiLineTag: function() {
    var childLength = this.children.length,
        multiLine   = childLength > 0;
    
    if (childLength == 1 && this.children[0] instanceof Jaml.TextNode) multiLine = false;
    
    return multiLine;
  },
  
  /**
   * Returns a string with the given number of whitespace characters, suitable for padding
   * @param {Number} amount The number of whitespace characters to add
   * @return {String} A padding string
   */
  getPadding: function(amount ) {
    return new Array(amount + 1).join(" ");
  },
  
  /**
   * Returns true if this tag should close itself (e.g. no </tag> element)
   * @return {Boolean} True if this tag should close itself
   */
  isSelfClosing: function() {
    var selfClosing = false;
    
    for (var i = this.selfClosingTags.length - 1; i >= 0; i--){
      if (this.tagName == this.selfClosingTags[i]) selfClosing = true;
    }
    
    return selfClosing;
  },
  
  /**
   * @attribute selfClosingTags
   * @type Array
   * An array of all tags that should be self closing
   */
  selfClosingTags: ['img', 'meta', 'br', 'hr']
};

Jaml.TextNode = function(text) {
  this.text = text;
};

Jaml.TextNode.prototype = {
  render: function() {
    return this.text;
  }
};

/**
 * Represents a single registered template. Templates consist of an arbitrary number
 * of trees (e.g. there may be more than a single root node), and are not compiled.
 * When a template is rendered its node structure is computed with any provided template
 * data, culminating in one or more root nodes.  The root node(s) are then joined together
 * and returned as a single output string.
 * 
 * The render process uses two dirty but necessary hacks.  First, the template function is
 * decompiled into a string (but is not modified), so that it can be eval'ed within the scope
 * of Jaml.Template.prototype. This allows the second hack, which is the use of the 'with' keyword.
 * This allows us to keep the pretty DSL-like syntax, though is not as efficient as it could be.
 */
Jaml.Template = function(tpl) {
  /**
   * @attribute tpl
   * @type Function
   * The function this template was created from
   */
  this.tpl = tpl;
  
  this.nodes = [];
};

Jaml.Template.prototype = {
  /**
   * Renders this template given the supplied data
   * @param {Object} data Optional data object
   * @return {String} The rendered HTML string
   */
  render: function(data ) {
    data = data || {};
    
    //the 'data' argument can come in two flavours - array or non-array. Normalise it
    //here so that it always looks like an array.
    if (data.constructor.toString().indexOf("Array") == -1) {
      data = [data];
    }
    
    with(this) {
      for (var i=0; i < data.length; i++) {
        eval("(" + this.tpl.toString() + ")(data[i])");
      };
    }
    
    var roots  = this.getRoots(),
        output = "";
    
    for (var i=0; i < roots.length; i++) {
      output += roots[i].render();
    };
    
    return output;
  },
  
  /**
   * Returns all top-level (root) nodes in this template tree.
   * Templates are tree structures, but there is no guarantee that there is a
   * single root node (e.g. a single DOM element that all other elements nest within)
   * @return {Array} The array of root nodes
   */
  getRoots: function() {
    var roots = [];
    
    for (var i=0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      
      if (node.parent == undefined) roots.push(node);
    };
    
    return roots;
  },
  
  tags: [
    "html", "head", "body", "script", "meta", "title", "link", "script",
    "div", "p", "span", "a", "img", "br", "hr",
    "table", "tr", "th", "td", "thead", "tbody",
    "ul", "ol", "li", 
    "dl", "dt", "dd",
    "h1", "h2", "h3", "h4", "h5", "h6", "h7",
    "form", "input", "label"
  ]
};

/**
 * Adds a function for each tag onto Template's prototype
 */
(function() {
  var tags = Jaml.Template.prototype.tags;
  
  for (var i = tags.length - 1; i >= 0; i--){
    var tagName = tags[i];
    
    /**
     * This function is created for each tag name and assigned to Template's
     * prototype below
     */
    var fn = function(tagName) {
      return function(attrs) {
        var node = new Jaml.Node(tagName);
        
        var firstArgIsAttributes =  (typeof attrs == 'object')
                                 && !(attrs instanceof Jaml.Node)
                                 && !(attrs instanceof Jaml.TextNode);

        if (firstArgIsAttributes) node.setAttributes(attrs);

        var startIndex = firstArgIsAttributes ? 1 : 0;

        for (var i=startIndex; i < arguments.length; i++) {
          var arg = arguments[i];

          if (typeof arg == "string" || arg == undefined) {
            arg = new Jaml.TextNode(arg || "");
          }
          
          if (arg instanceof Jaml.Node || arg instanceof Jaml.TextNode) {
            arg.parent = node;
          }

          node.addChild(arg);
        };
        
        this.nodes.push(node);
        
        return node;
      };
    };
    
    Jaml.Template.prototype[tagName] = fn(tagName);
  };
})();

$.View.register({
	suffix : "jaml",
	script: function(id, str ) {
		return "((function(){ Jaml.register("+id+", "+str+"); return function(data){return Jaml.render("+id+", data)} })())"
	},
	renderer: function(id, text ) {
		var func;
		eval("func = ("+text+")");
		Jaml.register(id, func);
		return function(data){
			return Jaml.render(id, data)
		}
	}
})



})(true);

