$.Controller.extend('Pluginify.Controllers.Plugins',
{
	onDocument: true
},
{
 /**
  * Load dependencies file
  */
 load: function(){
	 $.getJSON('/jquery/dist/standalone/dependencies.json', 
	 	this.callback('plugins'));
 },
 plugins: function(data){
 	this.pluginData = data;
 	$('#plugins').append(this.view());
 },
 'form submit': function(el, ev){
 	ev.preventDefault();
 	var params = el.formParams(), 
		serverParams = [], 
		i, plugin; 
	for(i=0; i<params.plugins.length; i++){
		plugin = {
			name: params.plugins[i],
			value: this._getDependencies(params.plugins[i])
		}
		serverParams.push(plugin);
	}
	window.location.href = '/pluginify?'+jQuery.param(serverParams);
	
 },
 /**
  * Recursively gets the array of dependencies for each plugin
  * @param {String} name the name of the plugin
  * @param {Boolean} includeSelf whether it should return with its own 
  * plugin name included
  */
 _getDependencies: function(name){
 	var dependencies = this.pluginData[name],
		totalDependencies = [],
		lowerDependencies, i, j;
	if(!dependencies.length || 
		(dependencies.length == 1 && dependencies[0] == "jquery/jquery.js")) {
		return [name];
	}
 	for(i=0; i<dependencies.length; i++){
		lowerDependencies = this._getDependencies(dependencies[i]);
		for (j = 0; j < lowerDependencies.length; j++) {
			// TODO if you find a duplicate, remove the other one first
			totalDependencies.push(lowerDependencies[j])
		}
	}
	totalDependencies.push(name)
	return totalDependencies;
 }
});