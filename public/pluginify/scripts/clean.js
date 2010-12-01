//steal/js pluginify/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/clean',function(){
	steal.clean('pluginify/pluginify.html',{indent_size: 1, indent_char: '\t'});
});
