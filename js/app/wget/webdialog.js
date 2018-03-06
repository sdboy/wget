"use strict";

define([
  ], function() {
  var createWeb = function(mapObj, opt) {
    var obj = mapObj.createWebDialog(opt);
    return obj;
  };
  var removeWeb = function(mapObj, webObj) {
    mapObj.removeWebDialog(webObj);
  };
  var updateWeb = function(mapObj, webObj, param) {
    mapObj.updateWebDialog(webObj, param);
  };

  return {
    createWeb : createWeb,
    removeWeb : removeWeb,
    updateWeb : updateWeb
  }
});