"use strict";

define([
  "wget"
  ], function (wget) {
    var param = {
      map : null,
      fun : wget,
      winWidth : "",
      winHeight : "",
      arrowSize : "",
      radial : "",
      url : "",
      closeButton : "",
      arrowColor : "",
      closeButtonX : "",
      closeButtonY : "",
      closeButtonW : "",
      closeButtonH : "",
      param : "",
    };
    var result = {};
    var getPos = function (x, y) {
      /*jshint maxcomplexity: 2 */
      if(param.map){
        var pos = param.map.coordTransformation(3, {
          screenX : x,
          screenY : y
        });
        param.fun.createWindow(param.map, {
          lon : pos.split(",")[0],
          lat : pos.split(",")[1],
          height : pos.split(",")[2],
          winWidth : param.winWidth,
          winHeight : param.winHeight,
          arrowSize : param.arrowSize,
          radial : param.radial,
          url : param.url,
          closeButton : "true",
          arrowColor : "65, 177, 255",
          closeButtonX : "30",
          closeButtonY : "10",
          closeButtonW : "20",
          closeButtonH : "20",
          param : "kkkkk"
        });
      }
    };
    var setParam = function(map, opt) {
      param.map = map;
      param.winWidth = opt.winWidth;
      param.winHeight = opt.winHeight;
      param.arrowSize = opt.arrowSize;
      param.radial = opt.radial;
      param.url = opt.url;
      param.closeButton = opt.closeButton;
      param.arrowColor = opt.closeButton;
      param.closeButtonX = opt.closeButtonX;
      param.closeButtonY = opt.closeButtonY;
      param.closeButtonH = opt.closeButtonH;
      param.closeButtonW = opt.closeButtonW;
      param.param = opt.param;
      map.addEvent("FireOnLButtonUp", getPos);
    };
    
    return {
      setParam : setParam,
      getPos : getPos,
      result : result
    }
});