"use strict";
/**
 * 动态窗口模块，包括创建动态窗口、删除动态窗口、更新动态窗口信息、显隐动态窗口
 */
define([
], function() {
  var createWindow = function (mapObj, opt) {
    var obj = mapObj.createWget(opt);
    return obj;
  };

  var removeWindow = function (mapObj) {
      mapObj.removeWget();
  };

  var updateWindow = function (mapObj, winObj, param) {
    mapObj.updateWget(winObj, param);
  };

  var visiableWindow = function (mapObj, winObj, state) {
    mapObj.visiableWget(winObj, state);
  };

  return {
    createWindow : createWindow,
    removeWindow : removeWindow,
    updateWindow : updateWindow,
    visiableWindow : visiableWindow
  };
});