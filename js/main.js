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
    loadGMS : "app/loadModel/loadGMS"
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
    "event"
    ], function (event) {
      $("#createWin").click(function () {
        event.setParam(map, {
          "winWidth" : "395",
          "winHeight" : "240",
          "arrowSize" : "30",
          "radial" : "20",
          "url" : "http://baidu.com",
          "closeButton" : "true",
          "arrowColor" : "65, 177, 255",
          "closeButtonX" : "365",
          "closeButtonY" : "10",
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
        event.getParam("kkkkk");
      });
      $("#visibleWin").click(function () {
        event.visibleWin();
      });
    });
});