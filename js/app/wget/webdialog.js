"use strict";

define([''], 
  function() {
  var createWeb = function(obj) {
    obj.createWebDialog();
  };
  var removeWeb = function(obj) {
    obj.removeWebDialog();
  };
  var updateWeb = function(obj) {
    obj.updateWebDialog();
  };

  return {
    createWeb : createWeb,
    removeWeb : removeWeb,
    updateWeb : updateWeb
  }
});