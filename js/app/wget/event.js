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
    var result = {
      winObj : []
    };
    var flag = {
      flag : true
    };
    /**
     * 获取屏幕的x,y坐标，创建动态框
     * @method getPos
     * @author jg
     * @param { Number } x 屏幕x 
     * @param { Number } y 屏幕y
     * @return { Null }
     */
    var getPos = function (x, y) {
      /*jshint maxcomplexity: 2 */
      if(param.map){
        var pos = param.map.coordTransformation(3, {
          screenX : x,
          screenY : y
        });
        var obj = param.fun.createWindow(param.map, {
          lon : pos.split(",")[0],
          lat : pos.split(",")[1],
          height : pos.split(",")[2],
          winWidth : param.winWidth,
          winHeight : param.winHeight,
          arrowSize : param.arrowSize,
          radial : param.radial,
          url : param.url,
          closeButton : param.closeButton,
          arrowColor : param.arrowColor,
          closeButtonX : param.closeButtonX,
          closeButtonY : param.closeButtonY,
          closeButtonW : param.closeButtonW,
          closeButtonH : param.closeButtonH,
          param : param.param
        });
        result.winObj.unshift(obj);
      }
      param.map.delEvent("FireOnLButtonUp", getPos);
    };
    /**
     * 设置创建动态框的参数，添加地图左键点击监听
     * @method setParam
     * @author jg
     * @param { Object } map 地图对象 
     * @param { Object } opt 参数对象
     * @return { Null }
     */
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
    
    var removeWin = function () {
      /*jshint maxcomplexity:2 */
      if(result.winObj.length > 0){
        param.map.removeWget();
        result.winObj.pop();
      }
    };

    var updateWin = function (opt) {
      /*jshint maxcomplexity:2 */
      if(result.winObj.length > 0){
        param.map.updateWget(result.winObj[0], opt);
      }
    };

    var getParam = function (param) {
      /*jshint maxcomplexity:2 */
      if(result.winObj.length > 0){
        param.map.WgetParam(result.winObj[0], param);
      }     
    };

    var visibleWin = function () {
      /*jshint maxcomplexity:3 */
      if(result.winObj.length > 0){
        if(flag.flag){
          param.map.visibleWget(result.winObj[0], 0);
          flag.flag = !flag.flag;
        }else{
          param.map.visibleWget(result.winObj[0], 1);
          flag.flag = !flag.flag;
        }
      }
    };
    
    return {
      setParam : setParam,
      getPos : getPos,
      result : result,
      removeWin : removeWin,
      updateWin : updateWin,
      visibleWin : visibleWin,
      getParam : getParam
    };
});