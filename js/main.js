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
    webdialog : "app/wget/webdialog",
    wget : "app/wget/wget",
    event : "app/wget/event"
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
  "require",
  "domReady!",
  "init",
  "jquery"
  ], function(require, doc, init) {
  init.initialize("map");
  var map = init.map.mapObj;
  require([
    "webdialog"
    ], function(webdialog) {
      var webObj = [];
      var x = 0;
      var y = 0;
      $("#createWeb").click(function() {
        x += 10;
        y += 10;
        var obj = webdialog.createWeb(map, {
          url : "http://www.baidu.com",
          left : "" + x,
          top : "" + y,
          width : "320",
          height : "320"
        });
        // 将新创建的对象放在数组头部
        webObj.unshift(obj);
      });
      $("#destroyWeb").click(function() {
        /*jshint maxcomplexity: 2 */
        if(webObj.length > 0){
          // 从数组尾部取对象
          webdialog.removeWeb(map, webObj.pop());
        }
      });
      $("#updateWeb").click(function() {
        /*jshint maxcomplexity: 2 */
        if(webObj.length > 0){
          // 更新第一个对象
          webdialog.updateWeb(map, webObj[0], "sdddd");
        }
      });
  });
  require([
    "wget",
    "event"
    ], function (wget, event) {
      var winObj = [];
      $("#createWin").click(function () {
        event.param.map = map;
        map.addEvent("FireOnLButtonUp", event.getPos);
      });
      $("#removeWin").click(function () {

      });
      $("#updateWin").click(function () {

      });
      $("#visiableWin").click(function () {

      });
      ;
    });
});