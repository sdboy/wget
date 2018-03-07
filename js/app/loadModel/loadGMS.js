"use strict";
/**
 * 建筑模型加载模块，用于加载模型，并返回图层对象
 */
define([
], function() {
  /**
   * 加载建筑模型
   * @author jg
   * @param { Object } mapObj 地图对象
   * @param { String } url 模型数据地址
   * @param { String } serverName 模型服务名
   * @return { Object } layerObj 模型图层对象
   */
  var loadBuild = function(mapObj, url, serverName) {
    var layerObj = mapObj.loadGMS(url, serverName);
    return layerObj;
  };

  return {
    loadBuild : loadBuild
  };
  
});