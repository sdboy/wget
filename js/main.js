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
    Util : "lib/coorun/Util"
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
  "domReady!",
  "init"
  ], function(doc, init) {
  init.initialize("map");
  var map = init.map.mapObj;
});