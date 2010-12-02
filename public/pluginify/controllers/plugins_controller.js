$.Controller.extend('Pluginify.Controllers.Plugins',
{
	onDocument: true
},
{
 /**
  * Load dependencies file
  */
 load: function(){
 	this.dependencies = [];
	$.getJSON('/jquery/dist/standalone/dependencies.json', 
		this.callback('plugins'));
 },
 plugins: function(data){
 	this.pluginData = data;
 	$('#plugins').append(this.view());
 },
 'input[type=checkbox] change': function(el, ev){
 	this.dependencies = [];
 	var $form = el.closest('form'),
		params = $form.formParams(), i;
	for(i=0; i<params.plugins.length; i++){
		this._pushPlugins(this._getDependencies(params.plugins[i]));
	}
	$('#pluginForm input[type=checkbox]').attr('checked', false);
	for(i=0; i<this.dependencies.length; i++){
		$('input[value='+this.dependencies[i]+']').attr('checked', true);
	}
 },
 'form submit': function(el, ev){
 	ev.preventDefault();
	// perform request and download
	window.location.href = '/pluginify?'+jQuery.param(el.formParams());
 },
 /**
  * Push a list of plugins to the current list.  If there's a duplicate, 
  * delete the other one first.
  * @param {Object} dependencies an array of plugins to add to the list
  */
 _pushPlugins: function(dependencies){
 	var dep, i, index;
 	for(i=0; i<dependencies.length; i++){
		dep = dependencies[i];
		index = this.dependencies.indexOf(dep);
		if(index != -1) {
			this.dependencies.splice(index, 1);
		}
		this.dependencies.push(dep);
	}
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