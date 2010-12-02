(function(){
(function($) {
    /** jQuery.toJSON( json-serializble )
        Converts the given argument into a JSON respresentation.

        If an object has a "toJSON" function, that will be used to get the representation.
        Non-integer/string keys are skipped in the object, as are keys that point to a function.

        json-serializble:
            The *thing* to be converted.
     **/
    $.toJSON = function(o, replacer, space, recurse)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o, replacer, space);

        if (!recurse && $.isFunction(replacer))
            o = replacer("", o);

        if (typeof space == "number")
            space = "          ".substring(0, space);
        space = (typeof space == "string") ? space.substring(0, 10) : "";
        
        var type = typeof(o);
    
        if (o === null)
            return "null";
    
        if (type == "undefined" || type == "function")
            return undefined;
        
        if (type == "number" || type == "boolean")
            return o + "";
    
        if (type == "string")
            return $.quoteString(o);
    
        if (type == 'object')
        {
            if (typeof o.toJSON == "function") 
                return $.toJSON( o.toJSON(), replacer, space, true );
            
            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();
                
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds + 
                             '.' + milli + 'Z"'; 
            }

            var process = ($.isFunction(replacer)) ?
                function (k, v) { return replacer(k, v); } :
                function (k, v) { return v; },
                nl = (space) ? "\n" : "",
                sp = (space) ? " " : "";

            if (o.constructor === Array) 
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push(( $.toJSON( process(i, o[i]), replacer, space, true ) || "null" ).replace(/^/gm, space));

                return "[" + nl + ret.join("," + nl) + nl + "]";
            }
        
            var pairs = [], proplist;
            if ($.isArray(replacer)) {
                proplist = $.map(replacer, function (v) {
                    return (typeof v == "string" || typeof v == "number") ?
                        v + "" :
                        null;
                });
            }
            for (var k in o) {
                var name, val, type = typeof k;

                if (proplist && $.inArray(k + "", proplist) == -1)
                    continue;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys
            
                val = $.toJSON( process(k, o[k]), replacer, space, true );
            
                if (typeof val == "undefined")
                    continue;  //skip pairs where the value is a function.
            
                pairs.push((name + ":" + sp + val).replace(/^/gm, space));
            }

            return "{" + nl + pairs.join("," + nl) + nl + "}";
        }
    };

    /** jQuery.evalJSON(src)
        Evaluates a given piece of json source.
     **/
    $.evalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    
    /** jQuery.secureEvalJSON(src)
        Evals JSON in a way that is *more* secure.
    **/
    $.secureEvalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    /** jQuery.quoteString(string)
        Returns a string-repr of a string, escaping quotes intelligently.  
        Mostly a support function for toJSON.
    
        Examples:
            >>> jQuery.quoteString("apple")
            "apple"
        
            >>> jQuery.quoteString('"Where are we going?", she asked.')
            "\"Where are we going?\", she asked."
     **/
    $.quoteString = function(string)
    {
        if (string.match(_escapeable))
        {
            return '"' + string.replace(_escapeable, function (a) 
            {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
})(jQuery);
})(jQuery);
(function() {
    // break
    /**
     * @function jQuery.cookie
     * @parent dom
     * @author Klaus Hartl/klaus.hartl@stilbuero.de
     *
     * <h3>Cookie plugin</h3>
     *
     *
	 *  <p>
	 *  Copyright (c) 2006 Klaus Hartl (stilbuero.de)<br />
	 *  Dual licensed under the MIT and GPL licenses:<br />
	 *  http://www.opensource.org/licenses/mit-license.php<br />
	 *  http://www.gnu.org/licenses/gpl.html
	 *  </p>
	 *  <p>
	 *  Create a cookie with the given name and value and other optional parameters.
	 *  / Get the value of a cookie with the given name.
	 *  </p>
	 *  <h3>Quick Examples</h3>
	 * 
	 *  Set the value of a cookie.
	 *  @codestart
	 *  * $.cookie('the_cookie', 'the_value');
	 *  @codeend
	 * 
	 *  Create a cookie with all available options.
	 *  @codestart
	 *  $.cookie('the_cookie', 'the_value',
	 *  { expires: 7, path: '/', domain: 'jquery.com', secure: true });
	 *  @codeend
	 * 
	 *  Create a session cookie.
	 *  @codestart
	 *  $.cookie('the_cookie', 'the_value');
	 *  @codeend
	 * 
	 *  Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
	 *  used when the cookie was set.
	 *  @codestart
	 *  $.cookie('the_cookie', null);
	 *  @codeend
	 * 
	 *  Get the value of a cookie.
	 *  @codestart
	 *  $.cookie('the_cookie');
	 *  @codeend
	 * 
     *
     * @param {String} [name] The name of the cookie.
     * @param {String} [value] The value of the cookie.
     * @param {Object} [options] An object literal containing key/value pairs to provide optional cookie attributes.<br />
     * @param {Number|Date} [expires] Either an integer specifying the expiration date from now on in days or a Date object.
     *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
     *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
     *                             when the the browser exits.<br />
     * @param {String} [path] The value of the path atribute of the cookie (default: path of page that created the cookie).<br />
     * @param {String} [domain] The value of the domain attribute of the cookie (default: domain of page that created the cookie).<br />
     * @param {Boolean} secure If true, the secure attribute of the cookie will be set and the cookie transmission will
     *                        require a secure protocol (like HTTPS).<br />
     * @return {String} or {undefined} when setting the cookie.
     */
    jQuery.cookie = function(name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options ||
            {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            if (typeof value == 'object' && jQuery.toJSON) {
                value = jQuery.toJSON(value);
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                }
                else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            // CAUTION: Needed to parenthesize options.path and options.domain
            // in the following expressions, otherwise they evaluate to undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        }
        else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            if (jQuery.evalJSON && cookieValue && cookieValue.match(/^\s*\{/)) {
                try {
                    cookieValue = jQuery.evalJSON(cookieValue);
                }
                catch (e) {
                }
            }
            return cookieValue;
        }
    };

})(jQuery);
(function($){
/**
 * @plugin jquery/model/list/local
 * @download jquery/dist/jquery.model.list.local.js
 * @parent jQuery.Model.List
 * Works exactly the same as [jQuery.Model.List.Cookie] except uses
 * a local store instead of cookies.
 */
$.Model.List.extend("jQuery.Model.List.Local",
{
	retrieve : function(name){
		// each also needs what they are referencd by ?
		var props = window.localStorage[ name ] || "[]",
			instances = [],
			Class = props.type ? $.Class.getObject(props.type) :  null;
		for(var i =0; i < props.ids.length;i++){
			var identity = props.ids[i],
				instanceData = window.localStorage[ identity ];
			instances.push( new Class(instanceData) )
		}
		this.push.apply(this,instances);
		return this;
	},
	store : function(name){
		//  go through and listen to instance updating
		var ids = [], days = this.days;
		this.each(function(i, inst){
			window.localStorage[inst.identity()] = instance.attrs();
			ids.push(inst.identity());
		});
		window.localStorage[name] = {
			type: this[0] && this[0].Class.fullName,
			ids: ids
		};
		return this;
	}
	
});
	
})(jQuery)