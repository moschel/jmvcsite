steal.plugins('mxui/scrollable_table','mxui/resizer').then(function($){
	
	
	$.Controller.extend("Mxui.Grid2",{},
	{
		init : function(){
			//create the scrollable table
			this.element.html(
				[	"<table><thead>",
					this.options.thead,
					"</thead><tbody>",
					this.options.tbody,
					"</tbody>"].join(''))
			
			this.element.children('table').mxui_scrollable_table()
			this.scrollable = this.element.children(":first").controller(Mxui.ScrollableTable);
			
			this.scrollable.cache.thead.mxui_resizer({selector: "th"});
			this.element.addClass("grid");
			this.callback('setFixedAndColumns')
		},
		"th resize:start" : function(el, ev){
			$("#mxui_resizer")
				.outerWidth(el.outerWidth())
				.height(this.element.outerHeight());
			ev.preventDefault();
			ev.stopPropagation();
		},
		setFixedAndColumns : function(){
			var tbody = this.scrollable.cache.tbody,
				table = this.scrollable.cache.table,
				tr = tbody.children(":first"),
				children = tr.children(),
				fragment = document.createDocumentFragment();
			for(var i =0; i< children.length-1; i++){
				fragment.appendChild( $("<col/>").width(children.eq(i).outerWidth())[0]  )
			}
			table.prepend(fragment)
			table.css("tableLayout","fixed")
		}
	})
})
