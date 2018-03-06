"use strict";

define([
  "wget"
  ], function (wget) {
    var param = {
      fun : wget
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
          winWidth : "50",
          winHeight : "50",
          arrowSize : "30",
          radial : "20",
          url : "http://github.com",
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
    return {
      getPos : getPos,
      result : result
    }
});