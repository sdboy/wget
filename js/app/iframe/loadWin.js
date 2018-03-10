"use strict";

define([
  "removeIframe",
  "jquery"
  ], function(removeIframe) {
    var createIframe = function (dom, src, id, trans, styleObj) {
      var iframe = $("<iframe></iframe>");
      $(iframe).css("width", styleObj.width);
      $(iframe).css("height", styleObj.height);
      $(iframe).css("position", styleObj.position);
      $(iframe).css("padding", styleObj.padding);
      $(iframe).css("margin", styleObj.margin);
      $(iframe).css("left", styleObj.left);
      $(iframe).css("top", styleObj.top);
      $(iframe).css("z-index", styleObj.zIndex);
      $(iframe).css("background-color", styleObj.backgroundColor);
      $(iframe).attr("frameborder", "0");
      $(iframe).attr("scrolling", "no");
      // $(iframe).attr("allowTransparency", trans);
      $(iframe).attr("id", id);
      $(iframe).attr("src", src);
      $(dom).prepend(iframe);
      return iframe;
    };

    var destroyIframe = function (obj) {
      removeIframe.removeIframe(obj);
    };
  
    return {
      createIframe : createIframe,
      destroyIframe : destroyIframe
    };
});