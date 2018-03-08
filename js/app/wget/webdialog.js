"use strict";
/**
 * 网页弹出框模块，对网页弹出框进行处理，包括创建弹出框、删除弹出框、更新弹出框信息
 */
define([
  ], function() {
  var web = {
    webObj : null
  };
  var postParam = function(str, id) {
    var msg = web.webObj.GetToolsResult().GetConfigValueByKey("Param");
    alert("str:" + str);
    alert("id:" + id);
    alert("msg:" + msg);
  };
  var createWeb = function(mapObj, opt) {
    var obj = mapObj.createWebDialog(opt);
    web.webObj = obj;
    mapObj.addEvent("FireOnToolsNotify", postParam);
    return obj;
  };
  var removeWeb = function(mapObj, webObj) {
    mapObj.removeWebDialog(webObj);
  };
  var updateWeb = function(mapObj, webObj, param) {
    mapObj.updateWebDialog(webObj, param);
  };

  return {
    createWeb : createWeb,
    removeWeb : removeWeb,
    updateWeb : updateWeb,
    postParam : postParam,
    web : web
  };
});