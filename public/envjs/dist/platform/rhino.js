/*
 * Envjs rhino-env.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//Make these global to avoid namespace pollution in tests.
/*var __context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();*/
__context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();

Envjs.platform       = "Rhino";
Envjs.revision       = "1.7.0.rc2";

/*
 * Envjs rhino-env.1.2.35 
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
 * Writes message to system out.
 *
 * Some sites redefine 'print' as in 'window.print', so instead of
 * printing to stdout, you are popping open a new window, which might
 * call print, etc, etc,etc This can cause infinite loops and can
 * exhausing all memory.
 *
 * By defining this upfront now, Envjs.log will always call the native 'print'
 * function
 *
 * @param {Object} message
 */
Envjs.log = print;

Envjs.lineSource = function(e){
    return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
};
Envjs.eval = function(context, source, name){
    __context__.evaluateString(
        context,
        source,
        name,
        0,
        null
    );
};
Envjs.renderSVG = function(svgstring, url){
    //console.log("svg template url %s", templateSVG);
    // Create a JPEG transcoder
    var t = new Packages.org.apache.batik.transcoder.image.JPEGTranscoder();

    // Set the transcoding hints.
    t.addTranscodingHint(
        Packages.org.apache.batik.transcoder.image.JPEGTranscoder.KEY_QUALITY,
        new java.lang.Float(1.0));
    // Create the transcoder input.
    var input = new Packages.org.apache.batik.transcoder.TranscoderInput(
        new java.io.StringReader(svgstring));

    // Create the transcoder output.
    var ostream = new java.io.ByteArrayOutputStream();
    var output = new Packages.org.apache.batik.transcoder.TranscoderOutput(ostream);

    // Save the image.
    t.transcode(input, output);

    // Flush and close the stream.
    ostream.flush();
    ostream.close();
    
	var out = new java.io.FileOutputStream(new java.io.File(new java.net.URI(url.toString())));
	try{
    	out.write( ostream.toByteArray() );
	}catch(e){
		
	}finally{
    	out.flush();
    	out.close();
    }
};
//Temporary patch for parser module
Packages.org.mozilla.javascript.Context.
    getCurrentContext().setOptimizationLevel(-1);

Envjs.shell = new Packages.java.util.Scanner(Packages.java.lang.System['in']);
/**
 * Rhino provides a very succinct 'sync'
 * @param {Function} fn
 */
try{
    Envjs.sync = sync;
    Envjs.spawn = spawn;
} catch(e){
    //sync unavailable on AppEngine
    Envjs.sync = function(fn){
        //console.log('Threadless platform, sync is safe');
        return fn;
    };

    Envjs.spawn = function(fn){
        //console.log('Threadless platform, spawn shares main thread.');
        return fn();
    };
}

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){
    try{
        java.lang.Thread.currentThread().sleep(millseconds);
    }catch(e){
        console.log('Threadless platform, cannot sleep.');
    }
};

/**
 * provides callback hook for when the system exits
 */
Envjs.onExit = function(callback){
    var rhino = Packages.org.mozilla.javascript,
        contextFactory =  __context__.getFactory(),
        listener = new rhino.ContextFactory.Listener({
            contextReleased: function(context){
                if(context === __context__)
                    console.log('context released', context);
                contextFactory.removeListener(this);
                if(callback)
                    callback();
            }
        });
    contextFactory.addListener(listener);
};

/**
 * Get 'Current Working Directory'
 */
Envjs.getcwd = function() {
	// changed to support windows slashes (\)
    return (String (java.lang.System.getProperty('user.dir'))).replace(/\\/g,'/');
}

/**
 *
 * @param {Object} fn
 * @param {Object} onInterupt
 */
Envjs.runAsync = function(fn, onInterupt){
    ////Envjs.debug("running async");
    var running = true,
        run;

    try{
        run = Envjs.sync(function(){
            fn();
            Envjs.wait();
        });
        Envjs.spawn(run);
    }catch(e){
        console.log("error while running async operation", e);
        try{if(onInterrupt)onInterrupt(e)}catch(ee){};
    }
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){
    //Envjs.debug("writing text to url : " + url);
    var out = new java.io.FileWriter(
        new java.io.File(
            new java.net.URI(url.toString())));
    out.write( text, 0, text.length );
    out.flush();
    out.close();
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){
    //Envjs.debug("writing text to temp url : " + suffix);
    // Create temp file.
    var temp = java.io.File.createTempFile("envjs-tmp", suffix);

    // Delete temp file when program exits.
    temp.deleteOnExit();

    // Write to temp file
    var out = new java.io.FileWriter(temp);
    out.write(text, 0, text.length);
    out.close();
    return temp.getAbsolutePath().toString()+'';
};


/**
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function( url ){
    var fileReader = new java.io.FileReader(
        new java.io.File( 
            new java.net.URI( url )));
            
    var stringwriter = new java.io.StringWriter(),
        buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024),
        length;

    while ((length = fileReader.read(buffer, 0, 1024)) != -1) {
        stringwriter.write(buffer, 0, length);
    }

    stringwriter.close();
    return stringwriter.toString()+"";
};
    

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){
    var file = new java.io.File( new java.net.URI( url ) );
    file["delete"]();
};

/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){
    var url = java.net.URL(xhr.url),
        connection,
        header,
        outstream,
        buffer,
        length,
        binary = false,
        name, value,
        contentEncoding,
        instream,
        responseXML,
        i;
    
        
    if ( /^file\:/.test(url) ) {
        try{
            if ( "PUT" == xhr.method || "POST" == xhr.method ) {
                data =  data || "" ;
                Envjs.writeToFile(data, url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else if ( xhr.method == "DELETE" ) {
                Envjs.deleteFile(url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else {
                //try to add some canned headers that make sense
                xhr.readyState = 4;
                xhr.statusText = "ok";
                xhr.responseText = Envjs.readFromFile(xhr.url);
                try{
                    if(xhr.url.match(/html$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/html';
                    }else if(xhr.url.match(/.xml$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/xml';
                    }else if(xhr.url.match(/.js$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/javascript';
                    }else if(xhr.url.match(/.json$/)){
                        xhr.responseHeaders["Content-Type"] = 'application/json';
                    }else{
                        xhr.responseHeaders["Content-Type"] = 'text/plain';
                    }
                    //xhr.responseHeaders['Last-Modified'] = connection.getLastModified();
                    //xhr.responseHeaders['Content-Length'] = headerValue+'';
                    //xhr.responseHeaders['Date'] = new Date()+'';*/
                }catch(e){
                    console.log('failed to load response headers',e);
                }
            }
        }catch(e){
            console.log('failed to open file %s %s', url, e);
            connection = null;
            xhr.readyState = 4;
            xhr.statusText = "Local File Protocol Error";
            xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
        }
    } else {
        connection = url.openConnection();
        //handle redirects manually since cookie support sucks out of the box
        connection.setFollowRedirects(false);
        connection.setRequestMethod( xhr.method );

        // Add headers to Java connection
        for (header in xhr.headers){
            connection.addRequestProperty(header+'', xhr.headers[header]+'');
        }
        connection.addRequestProperty("Accept-Encoding", 'gzip');
        connection.addRequestProperty("Agent", 'gzip');

        //write data to output stream if required
        if(data){
            if(data instanceof Document){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream(),
                    xml = (new XMLSerializer()).serializeToString(data);
                    buffer = new java.lang.String(xml).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }else if(data.length&&data.length>0){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream();
                    buffer = new java.lang.String(data).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }
            connection.connect();
        }else{
            connection.connect();
        }
    }

    if(connection){
        try{
            length = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (i = 0; i < length; i++) {
                name = connection.getHeaderFieldKey(i);
                value = connection.getHeaderField(i);
                if (name)
                    xhr.responseHeaders[name+''] = value+'';
            }
        }catch(e){
            console.log('failed to load response headers \n%s',e);
        }

        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";

        contentEncoding = connection.getContentEncoding() || "utf-8";
        instream = null;
        responseXML = null;
        
        try{
            //console.log('contentEncoding %s', contentEncoding);
            if( contentEncoding.equalsIgnoreCase("gzip") ||
                contentEncoding.equalsIgnoreCase("decompress")){
                //zipped content
                binary = true;
                outstream = new java.io.ByteArrayOutputStream();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
                instream = new java.util.zip.GZIPInputStream(connection.getInputStream())
            }else{
                //this is a text file
                outstream = new java.io.StringWriter();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024);
                instream = new java.io.InputStreamReader(connection.getInputStream());
            }
        }catch(e){
            if (connection.getResponseCode() == 404){
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }else{
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }
            instream = connection.getErrorStream();
        }

        while ((length = instream.read(buffer, 0, 1024)) != -1) {
            outstream.write(buffer, 0, length);
        }

        outstream.close();
        instream.close();
        
        if(binary){
            xhr.responseText = new java.lang.String(outstream.toByteArray(), 'UTF-8')+'';
        }else{
            xhr.responseText = outstream.toString()+'';
        }

    }
    if(responseHandler){
        //Envjs.debug('calling ajax response handler');
        responseHandler();
    }
};

//Since we're running in rhino I guess we can safely assume
//java is 'enabled'.  I'm sure this requires more thought
//than I've given it here
Envjs.javaEnabled = true;

Envjs.homedir        = java.lang.System.getProperty("user.home");
Envjs.tmpdir         = java.lang.System.getProperty("java.io.tmpdir");
Envjs.os_name        = java.lang.System.getProperty("os.name");
Envjs.os_arch        = java.lang.System.getProperty("os.arch");
Envjs.os_version     = java.lang.System.getProperty("os.version");
Envjs.lang           = java.lang.System.getProperty("user.lang");


Envjs.gc = function(){ gc(); };

/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent) {
    try{
        if(scope+'' == '[object global]'){
            return scope
        }else{
            return  __context__.initStandardObjects();
        }
    }catch(e){
        console.log('failed to init standard objects %s %s \n%s', scope, parent, e);
    }

};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
