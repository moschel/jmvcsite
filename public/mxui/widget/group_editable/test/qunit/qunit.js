//we probably have to have this only describing where the tests are
steal
 .plugins("mxui/widget/group_editable")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("group_editable_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}