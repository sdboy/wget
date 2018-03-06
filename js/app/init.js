"use strict";
/**
 * 地图初始化模块，初始化三维地图
 */
define(["Map3D"],
  function() {
    var map = {
      mapObj : null
    };
    var initialize = function(contentId) {
      map.mapObj = new CooMap.Map3D({
        id : contentId,
        width: "100%",
			  height: "700px"
      });
      map.mapObj.getLicence("192.168.10.34@9059@");
    };
    return {
      initialize : initialize,
      map : map
    };
  }
);