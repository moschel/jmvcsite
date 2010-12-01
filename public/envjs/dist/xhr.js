/*
 * Envjs xhr.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation originally written by Yehuda Katz.
 * 
 * This file simply provides the global definitions we need to 
 * be able to correctly implement to core browser (XML)HTTPRequest 
 * interfaces.
 */

//Make these global to avoid namespace pollution in tests.
/*var Location,
    XMLHttpRequest;*/

/*
 * Envjs xhr.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * @todo: document
 */
__extend__(Document.prototype,{
    load: function(url){
        if(this.documentURI == 'about:html'){
            this.location.assign(url);
        }else if(this.documentURI == url){
            this.location.reload(false);
        }else{
            this.location.replace(url);
        }
    },
    get location(){
        return this.ownerWindow.location;
    },
    set location(url){
        //very important or you will go into an infinite
        //loop when creating a xml document
        this.ownerWindow.location = url;
    }
});

/**
 * Location
 *
 * Mozilla MDC:
 * https://developer.mozilla.org/En/DOM/Window.location
 * https://developer.mozilla.org/en/DOM/document.location
 *
 * HTML5: 6.10.4 The Location interface
 * http://dev.w3.org/html5/spec/Overview.html#location
 *
 * HTML5: 2.5.3 Interfaces for URL manipulation
 * http://dev.w3.org/html5/spec/Overview.html#url-decomposition-idl-attributes
 * All of section 2.5 is worth reading, but 2.5.3 contains very
 * detailed information on how getters/setter should work
 *
 * NOT IMPLEMENTED:
 *  HTML5: Section 6.10.4.1 Security -- prevents scripts from another domain
 *   from accessing most of the 'Location'
 *  Not sure if anyone implements this in HTML4
 */

Location = function(url, doc, history) {
    //console.log('Location url %s', url);
    var $url = url,
        $document = doc ? doc : null,
        $history = history ? history : null;

    var parts = Envjs.urlsplit($url);

    return {
        get hash() {
            return parts.fragment ? '#' + parts.fragment : parts.fragment;
        },
        set hash(s) {
            if (s[0] === '#') {
                parts.fragment = s.substr(1);
            } else {
                parts.fragment = s;
            }
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'hash');
            }
        },

        get host() {
            return parts.netloc;
        },
        set host(s) {
            if (!s || s === '') {
                return;
            }

            parts.netloc = s;
            $url = Envjs.urlunsplit(parts);

            // this regenerates hostname & port
            parts = Envjs.urlsplit($url);

            if ($history) {
                $history.add( $url, 'host');
            }
            this.assign($url);
        },

        get hostname() {
            return parts.hostname;
        },
        set hostname(s) {
            if (!s || s === '') {
                return;
            }

            parts.netloc = s;
            if (parts.port != '') {
                parts.netloc += ':' + parts.port;
            }
            parts.hostname = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add( $url, 'hostname');
            }
            this.assign($url);
        },

        get href() {
            return $url;
        },
        set href(url) {
            $url = url;
            if ($history) {
                $history.add($url, 'href');
            }
            this.assign($url);
        },

        get pathname() {
            return parts.path;
        },
        set pathname(s) {
            if (s[0] === '/') {
                parts.path = s;
            } else {
                parts.path = '/' + s;
            }
            $url = Envjs.urlunsplit(parts);

            if ($history) {
                $history.add($url, 'pathname');
            }
            this.assign($url);
        },

        get port() {
            // make sure it's a string
            return '' + parts.port;
        },
        set port(p) {
            // make a string
            var s = '' + p;
            parts.port = s;
            parts.netloc = parts.hostname + ':' + parts.port;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add( $url, 'port');
            }
            this.assign($url);
        },

        get protocol() {
            return parts.scheme + ':';
        },
        set protocol(s) {
            var i = s.indexOf(':');
            if (i != -1) {
                s = s.substr(0,i);
            }
            parts.scheme = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'protocol');
            }
            this.assign($url);
        },

        get search() {
            return (parts.query) ? '?' + parts.query : parts.query;
        },
        set search(s) {
            if (s[0] == '?') {
                s = s.substr(1);
            }
            parts.query = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'search');
            }
            this.assign($url);
        },

        toString: function() {
            return $url;
        },

        assign: function(url, /*non-standard*/ method, data) {
            var _this = this,
                xhr,
                event;
			method = method||"GET";
			data = data||null;
            //console.log('assigning %s',url);

            //we can only assign if this Location is associated with a document
            if ($document) {
                //console.log('fetching %s (async? %s)', url, $document.async);
                xhr = new XMLHttpRequest();
				
		        xhr.setRequestHeader('Referer', $document.location);
				//console.log("REFERER: %s", $document.location);
                // TODO: make async flag a Envjs paramter
                xhr.open(method, url, false);//$document.async);

                // TODO: is there a better way to test if a node is an HTMLDocument?
                if ($document.toString() === '[object HTMLDocument]') {
                    //tell the xhr to not parse the document as XML
                    //console.log('loading html document');
                    xhr.onreadystatechange = function() {
                        //console.log('readyState %s', xhr.readyState);
                        if (xhr.readyState === 4) {
							switch(xhr.status){
							case 301:
							case 302:
							case 303:
							case 305:
							case 307:
								//console.log('status is not good for assignment %s', xhr.status);
								break;
                       		default:
								//console.log('status is good for assignment %s', xhr.status);
	                        	if (xhr.readyState === 4) {// update closure upvars
					            	$url = xhr.url;
						            parts = Envjs.urlsplit($url);
	                            	//console.log('new document baseURI %s', xhr.url);
	                            	Envjs.exchangeHTMLDocument($document, xhr.responseText, xhr.url);
	                        	}
							}
                        }
                    };
					try{
                    	xhr.send(data, false);//dont parse html
					}catch(e){
						console.log('failed to load content %s', e);
						Envjs.exchangeHTMLDocument($document, "\
							<html><head><title>Error Loading</title></head><body>"+e+"</body></html>\
						", xhr.url);
					}
                } else {
                    //Treat as an XMLDocument
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
							console.log('exchanging xml content %s', e);
                            $document = xhr.responseXML;
                            $document.baseURI = xhr.url;
                            if ($document.createEvent) {
                                event = $document.createEvent('Event');
                                event.initEvent('DOMContentLoaded');
                                $document.dispatchEvent( event, false );
                            }
                        }
                    };
                    xhr.send();
                }

            };

        },
        reload: function(forceget) {
            //for now we have no caching so just proxy to assign
            //console.log('reloading %s',$url);
            this.assign($url);
        },
        replace: function(url, /*non-standard*/ method, data) {
            this.assign(url, method, data);
        }
    };
};


/**
 *
 * @class XMLHttpRequest
 * @author Originally implemented by Yehuda Katz
 *
 */

// this implementation can be used without requiring a DOMParser
// assuming you dont try to use it to get xml/html documents
var domparser;

XMLHttpRequest = function(){
    this.headers = {};
    this.responseHeaders = {};
    this.aborted = false;//non-standard
};

// defined by the standard: http://www.w3.org/TR/XMLHttpRequest/#xmlhttprequest
// but not provided by Firefox.  Safari and others do define it.
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPEN = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

XMLHttpRequest.prototype = {
    open: function(method, url, async, user, password){
        //console.log('openning xhr %s %s %s', method, url, async);
        this.readyState = 1;
        this.async = (async === false)?false:true;
        this.method = method || "GET";
        this.url = Envjs.uri(url);
        this.onreadystatechange();
    },
    setRequestHeader: function(header, value){
        this.headers[header] = value;
    },
    send: function(data, parsedoc/*non-standard*/, redirect_count){
        var _this = this;
		//console.log('sending request for url %s', this.url);
        parsedoc = (parsedoc === undefined)?true:!!parsedoc;
        redirect_count = (redirect_count === undefined) ? 0 : redirect_count;
        function makeRequest(){
            var cookie = Envjs.getCookies(_this.url),
				redirecting = false;
            if(cookie){
                _this.setRequestHeader('COOKIE', cookie);
            }
			if(window&&window.navigator&&window.navigator.userAgent)
	        	_this.setRequestHeader('User-Agent', window.navigator.userAgent);
            Envjs.connection(_this, function(){
                if (!_this.aborted){
                    var doc = null,
                        domparser,
                        cookie;
                    
                    try{
                        cookie = _this.getResponseHeader('SET-COOKIE');
                        if(cookie){
                            Envjs.setCookie(_this.url, cookie);
                        }
                    }catch(e){
                        console.warn("Failed to set cookie");
                    }
                    //console.log('status : %s', _this.status);
					switch(_this.status){
						case 301:
						case 302:
						case 303:
						case 305:
						case 307:
						if(_this.getResponseHeader('Location') && redirect_count < 20){
							//follow redirect and copy headers
							redirecting = true;
							//console.log('following %s redirect %s from %s url %s', 
							//	redirect_count, _this.status, _this.url, _this.getResponseHeader('Location'));
	                        _this.url = Envjs.uri(_this.getResponseHeader('Location'));
	                        //remove current cookie headers to allow the redirect to determine
	                        //the currect cookie based on the new location
	                        if('Cookie' in _this.headers ){
	                            delete _this.headers.Cookie;
	                        }
	                        if('Cookie2' in _this.headers ){
	                            delete _this.headers.Cookie2;
	                        }
							redirect_count++;
							if (_this.async){
					            //TODO: see TODO notes below
					            Envjs.runAsync(makeRequest);
					        }else{
					            makeRequest();
					        }
							return;
						}break;
						default:
						// try to parse the document if we havent explicitly set a
                        // flag saying not to and if we can assure the text at least
                        // starts with valid xml
                        if ( parsedoc && 
                            _this.getResponseHeader('Content-Type').indexOf('xml') > -1 &&
                            _this.responseText.match(/^\s*</) ) {
                            domparser = domparser||new DOMParser();
                            try {
                                //console.log("parsing response text into xml document");
                                doc = domparser.parseFromString(_this.responseText+"", 'text/xml');
                            } catch(e) {
                                //Envjs.error('response XML does not appear to be well formed xml', e);
                                console.warn('parseerror \n%s', e);
                                doc = document.implementation.createDocument('','error',null);
                                doc.appendChild(doc.createTextNode(e+''));
                            }
                        }else{
                            //Envjs.warn('response XML does not appear to be xml');
                        }

                        _this.__defineGetter__("responseXML", function(){
                            return doc;
                        });
							
					}
                }
            }, data);

            if (!_this.aborted  && !redirecting){
				//console.log('did not abort so call onreadystatechange');
                _this.onreadystatechange();
            }
        }

        if (this.async){
            //TODO: what we really need to do here is rejoin the
            //      current thread and call onreadystatechange via
            //      setTimeout so the callback is essentially applied
            //      at the end of the current callstack
            //console.log('requesting async: %s', this.url);
            Envjs.runAsync(makeRequest);
        }else{
            //console.log('requesting sync: %s', this.url);
            makeRequest();
        }
    },
    abort: function(){
        this.aborted = true;
    },
    onreadystatechange: function(){
        //Instance specific
    },
    getResponseHeader: function(header){
        //$debug('GETTING RESPONSE HEADER '+header);
        var rHeader, returnedHeaders;
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            returnedHeaders = [];
            for (rHeader in this.responseHeaders) {
                if (rHeader.match(new RegExp(header, "i"))) {
                    returnedHeaders.push(this.responseHeaders[rHeader]);
                }
            }

            if (returnedHeaders.length){
                //$debug('GOT RESPONSE HEADER '+returnedHeaders.join(", "));
                return returnedHeaders.join(", ");
            }
        }
        return null;
    },
    getAllResponseHeaders: function(){
        var header, returnedHeaders = [];
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            for (header in this.responseHeaders) {
                returnedHeaders.push( header + ": " + this.responseHeaders[header] );
            }
        }
        return returnedHeaders.join("\r\n");
    },
    async: true,
    readyState: 0,
    responseText: "",
    status: 0,
    statusText: ""
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
