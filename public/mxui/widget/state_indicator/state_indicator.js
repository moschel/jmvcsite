steal.plugins('jquery/controller')
     .then(function(){
         $.Controller.extend("Mxui.StateIndicator",{
            listensTo : ['dirty','clean']
        },
        {
            dirty : function(el, ev){
                ev.stopPropagation();
                this.element.addClass('dirty');
            },
            clean : function(el, ev){
                ev.stopPropagation();          
                this.element.removeClass('dirty');                
            }
        })
        
     })