"use strict";

require.config({
  baseUrl : "./js",
  paths : {
    init : "app/init",
    async : "lib/require/async",
    domReady : "lib/require/domReady",
    text : "lib/require/text",
    jquery : "lib/jquery/jquery-1.4.4",
    Map3D : "lib/coorun/Map3D",
    CooMap : "lib/coorun/Class",
    Util : "lib/coorun/Util",
    webdialog : "lib/app/wget/webdialog"
  },
  shim: {
    'BMap': {
      deps: ['jquery'],
      exports: 'BMap'
    },
    'Map3D': {
      deps: ['CooMap', 'Util'],
      exports: 'Map3D'
    }
  }
    
});

require([
  "jquery",
  "require",
  "domReady!",
  "init"
  ], function($, require, doc, init) {
  init.initialize("map");
  var map = init.map.mapObj;
  require([
    "webdialog"
    ], function(webdialog) {
      var webObj = null;
      $("#createWeb").click(function() {
        webObj = webdialog.createWeb(map, {
          url : "http://www.baidu.com",
          left : "200",
          top : "200",
          width : "320",
          height : "320"
        });
      });
      $("#destroyWeb").click(function() {
        if(webObj !== null){
          webdialog.removeWeb(map, webObj);
        }
      });
      $("#updateWeb").click(function() {
        if(webObj !== null){
          webdialog.updateWeb(map, webObj, "sdddd");
        }
      });
  });
});