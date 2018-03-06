"use strict";

define([
  "jquery"
  ], function($) {
  var createWeb = function(mapObj, opt) {
    mapObj.createWebDialog(opt);
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