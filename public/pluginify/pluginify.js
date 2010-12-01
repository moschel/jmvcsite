steal.plugins(	
	'jquery/controller',			// a widget factory
    'jquery/controller/view',
	'jquery/view/ejs',				// client side templates
	'jquery/dom/form_params')		// form data helper
	
	.css('pluginify')	// loads styles

	.controllers('plugins')		// loads files in controllers folder

	.views()						// adds views to be added to build
