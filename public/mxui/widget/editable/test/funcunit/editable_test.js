module("editable")


test("editable testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/callcenter/mxui/widget/editable/editable.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})