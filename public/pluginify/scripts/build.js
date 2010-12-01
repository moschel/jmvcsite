//steal/js pluginify/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('pluginify/scripts/build.html',{to: 'pluginify'});
});
