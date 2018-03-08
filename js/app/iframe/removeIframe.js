"use strict";

define([
  "jquery"
  ], function() {
    var removeIframe = function (iframe) {
      /*jshint maxcomplexity:4 */
      if(iframe instanceof Object){
        if(iframe[0]){
          $(iframe[0]).src="about:blank";
        }
      }
      
      try{
        $(iframe)[0].contentWindow.document.write("");
        $(iframe)[0].contentWindow.document.clear();
      }catch(exception){
        
      }
      iframe[0].parentNode.removeChild(iframe[0]);
    };

    return {
      removeIframe : removeIframe
    };
  
});