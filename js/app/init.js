"use strict";
/**
 * 地图初始化模块，初始化三维地图
 */
define(["Map3D"],
  function() {
    var map = {
      mapObj : null,
      SDKpath : ""
    };
    var initialize = function(contentId) {
      map.mapObj = new CooMap.Map3D({
        id : contentId,
        width: "100%",
			  height: "700px"
      });
      map.mapObj.getLicence("192.168.10.34@9059@");
      // 获取SDK路径
      var path = map.mapObj.getSDKPath(); 
      map.SDKpath = path.substring(0, path.length - 4).replace(/\\/g, "\\\\");
    };
    return {
      initialize : initialize,
      map : map
    };
  }
);