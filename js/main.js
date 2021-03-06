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
    event : "app/wget/event",
    loadGMS : "app/loadModel/loadGMS",
    loadWin : "app/iframe/loadWin",
    removeIframe : "app/iframe/removeIframe"
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
  var SDKpath = init.map.SDKpath;
  // var SDKevent = init.map.SDKevent;
  require([
    "loadGMS"
    ], function (loadGMS) {
    var model = loadGMS.loadBuild(map, "http://192.168.10.34:9502/HaiKang", 
      "HaiKang_Compressed");
    map.flyPosition(120.2161886949898, 30.21208647541144, 63.70232508983463,
      4.351113551310101, -0.6722756375833641, 528.9511815746299, 3);
  });
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
          url : "http://192.168.10.194:8081/wget/html/dynamicWin.html",
          left : "" + x,
          top : "" + y,
          width : "240",
          height : "80"
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
    "event"
    ], function (event) {
      $("#createWin").click(function () {
        event.setParam(map, {
          "winWidth" : "260",
          "winHeight" : "100",
          "arrowSize" : "30",
          "radial" : "20",
          "url" : "http://192.168.10.194:8081/wget/html/dynamicWin.html",
          "closeButton" : "true",
          "arrowColor" : "65, 177, 255",
          "closeButtonX" : "220",
          "closeButtonY" : "0",
          "closeButtonW" : "20",
          "closeButtonH" : "20",
          "param" : "kkkkk"
        });
      });
      $("#removeWin").click(function () {
        event.removeWin();
      });
      $("#updateWin").click(function () {
        event.updateWin({
          "winWidth" : "120"
        });
      });
      $("#getParam").click(function () {
        event.getParam("xxx");
      });
      $("#visibleWin").click(function () {
        event.visibleWin();
      });
  });

  require([
    "loadWin"
    ], function (loadWin) {
      $("#createIframe").click(function () {
        var root = $("body");
        loadWin.createIframe(root, "./html/resultList.html", "resultList", 
          "true", {
          "width" : "220px",
          "height" : "220px",
          "position" : "absolute",
          "padding" : "0",
          "margin" : "0",
          "left" : "80px",
          "top" : "40px",
          "zIndex" : "999",
          "backgroundColor" : "transparent"
        });
      });
      $("#removeIframe").click(function () {
        /*jshint maxcomplexity: 2 */
        var iframe = $("#resultList");
        if(iframe.length > 0){
          loadWin.destroyIframe(iframe);
        }
      });
  });
});