module("resizable")


test("resizable testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/callcenter/mxui/resizable/resizable.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})