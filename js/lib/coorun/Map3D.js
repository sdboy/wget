"use strict";
//object标签对象
var content3d;
var licenece3d;
var tools;
//创建球面地图对象
var map;
//创建坐标转换对象
var translate;
var heightObj = [];
var imageCutIndex = 1;

var Map3D = CooMap.Class.extend({
	  "type" : "Map3D",
		/*
			"includes" : [CooMap["DomEvent"],CooMap["Conf"],CooMap["ClassEvent"]],
		*/
		/*
			+------------------------------------------------------------------------------
			* 函数: initialize
			* Map 入口初始化
			+------------------------------------------------------------------------------
			* handel : HTML DIV 容器对象
			* mapOptions : Array{}  地图初始化参数
			+------------------------------------------------------------------------------
		*/
    "initialize": function (option){
			/*jshint maxcomplexity:6 */
			this.option = option;
			this.option.stateFlag = this.option.stateFlag || true;
			content3d = document.createElement("object");
			// content3d.type = this.option.type || "application/x-CoorunAWP";
			content3d.classid = this.option.classid ||
			  "clsid:A1F1748A-2B6E-4616-954D-3F39B11DF57D";
			content3d.width=this.option.width || "100%";
			content3d.height=this.option.height || "100%";
			try{
				document.getElementById(this.option.id).appendChild(content3d);
			}catch(e){
				alert("请利用容器DIV创建地图");
			}
			// 创建地图对象
			map = content3d.GetIMapMgrPtr();
			// 创建坐标转换对象
	    translate = map.CreateTransformation();
			/*
			  这是一个bug,调用弹出框的时候必须使用,否则网页会提示类型不匹配,
				而且弹出框显示不出来
			 */
	    tools = content3d.GetIToolsCOMPtr();
	   	setTimeout(function(){
	   		var resp = map.CreateResponserOptions("UIStateResponser");
				// 字体格式文件路径
				resp.AddConfig("TextFont", "C:\\WINDOWS\\Fonts\\msyh.TTF");
				// 当前视点信息开关
				resp.AddConfig("StateCurrent", "false");
				// 当前鼠标信息开关
				resp.AddConfig("StateMouse", "true");
				// 当前高度信息开关
				resp.AddConfig("StateHeight", "true");
				// 鼠标位置文字
				resp.AddConfig("MouseShow", "");
				// 经度文字
				resp.AddConfig("LonShow", "经度: ");
				// 纬度文字
				resp.AddConfig("LatShow", "纬度: ");
				// 高程文字
				resp.AddConfig("HeightShow", "高度: ");
				// 创建状态栏响应器，必须为UIStateResponser
				var resState = map.CreateResponser("UIStateResponser", resp);
				map.AddResponser(resState);
	   	},1000);
		},
		/**
		 * 获取网络授权
		 * @method getLicence
		 * @author jg
		 * @param  { String } url 授权服务器地址和端口号
		 * @return { null }
		 * @version v6.0.6
		 */
		"getLicence":function(url){
			content3d.InitLic(url);
		},
		/*获取本地授权*/
		"getNativeLicence":function(){
			licenece3d.Init();
		},
		/**
		 * 飞行定位
		 * @method flyPosition
		 * @param  { String } lon     经度
		 * @param  { String } lat     纬度
		 * @param  { String } height  高度
		 * @param  { String } Azimuth 旋转角
		 * @param  { String } Pitch   俯仰角
		 * @param  { String } range   可视范围
		 * @param  { String } time    飞行时间
		 * @return { null }
		 */
		"flyPosition": function(lon,lat,height,Azimuth,Pitch,range,time){
			var navigation = map.CreateNavigation();
      var positions = map.CreatePosition(lon,lat,height);
			//参数都是弧度
      navigation.FlyToDest(positions, Azimuth, Pitch, range, time);
		},
		/**
		 * 加载GMS网络模型
		 * @method loadGMS
		 * @param  { String } url        模型所在的网络路径
		 * @param  { String } serverName 服务器上存放模型数据的文件夹名称
		 * @return { Object } 图层对象
		 */
		"loadGMS":function(url,serverName){
			// 服务器上存放模型数据的文件夹名称
			var tlo = map.CreateLayerOptions(serverName);
      tlo.AddConfig("LayerOptionsName","ModelLayerOptions");
      tlo.AddConfig("Visible", "true");
      tlo.AddConfig("Name", serverName);
	    tlo.AddConfig("DataSourceTypeName","gms");
	    tlo.AddConfig("Url",url);
	    var gmsLayer = map.CreateLayer("ModelLayer", tlo);
			map.AddLayer(gmsLayer);
	    return gmsLayer;
		},
		/**
		 * 加载单个模型
		 * @method loadSingleModel
		 * @param  { String } url 单个模型的路径
		 * @return { Object } 单个模型图层
		 */
		"loadSingleModel":function(url){
			// 创建singlemodel图层配置，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("singlemodel");
			// 创建配置类型, ModelLayerOptions代表模型数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "ModelLayerOptions");
			// 数据源类型,代表SINGLEMODEL插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "singlemodel");
			// 要加载的数据路径，此数据需为但wrl数据
      tlo.AddConfig("Url", url);
			// 创建模型图层，第一项参数必须为ModelLayer
      var singleModelLayer = map.CreateLayer("ModelLayer", tlo);
			// 添加模型图层
      map.AddLayer(singleModelLayer);
      return singleModelLayer;
		},
		/**
		 * 加载本地DOM数据
		 * @method loadNativeDOM
		 * @param  { String } dataURL  本地dom数据所在位置
		 * @param  { Array } rectangle 数组长度为4，依次是最小经度，最小纬度，最大经度
		 * 最大纬度
		 * @param  { Number } minLevel 最小层级
		 * @param  { Number } maxLevel 最大层级
		 * @return { Object } dom图层对象
		 */
		"loadNativeDOM":function(dataURL,rectangle,minLevel,maxLevel){
			// 创建dom图层配置，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("domlayer");
			// 创建配置类型, ImageLayerOptions代表影像数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "ImageLayerOptions");
			// 数据源类型,代表MTD插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "mtd");
			// 代表地形驱动，必须是此键值对
      tlo.AddConfig("Driver", "terrainquadtree");
      /*---------------以下部分可以通过图层信息获取获得相应的配置--------------*/
			// 要加载的数据路径，此数据必须是通过MTD切割工具生成的数据
      tlo.AddConfig("Url", dataURL);
			// 切割形成的数据格式
      tlo.AddConfig("Format", "png");
			// 数据的坐标参考
      tlo.AddConfig("Srs", "EPSG:4326");
			// 数据的范围X向最大值
      tlo.AddConfig("MaxX", rectangle[2]);
      tlo.AddConfig("MinX", rectangle[0]);
      tlo.AddConfig("MaxY", rectangle[3]);
      tlo.AddConfig("MinY", rectangle[1]);
			/*
			  切割数据的瓦片大小，可以往小于16的方向设置，但绝对不能往大于16的方向设置，
				但最好用切割的大小设置，否则会影响效率
			 */
      tlo.AddConfig("TileSize", "256");
      tlo.AddConfig("MinLevel", String(minLevel));
      tlo.AddConfig("MaxLevel", String(maxLevel));
			// 创建DEM图层，第一项参数必须为ImageLayer
      var mtddomlayer = map.CreateLayer("ImageLayer", tlo);
			//添加DOM图层
      map.AddLayer(mtddomlayer);
      return mtddomlayer;
		},
		/**
		 * 加载网络DOM服务数据
		 * @method loadNativeDOM
		 * @param  { String } dataURL  网络dom数据所在位置
		 * @param  { Array } rectangle 数组长度为4，依次是最小经度，最小纬度，最大经度
		 * 最大纬度
		 * @param  { Number } minLevel 最小层级
		 * @param  { Number } maxLevel 最大层级
		 * @return { Object } dom图层对象
		 */
		"loadDOM":function(dataURL,rectangle,minLevel,maxLevel){
			// 创建dom图层，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("domlayer");
			// 创建配置类型, ImageLayerOptions代表影像数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "ImageLayerOptions");
			// 数据源类型,代表MTDS插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "mtds");
			 // 代表地形驱动，必须是此键值对
      tlo.AddConfig("Driver", "terrainquadtree");

      /*--------------以下部分可以通过图层信息获取获得相应的配置------------*/
			// 要加载的数据路径，此数据必须是通过MTD切割工具生成的数据，并且进行了网络发布
			tlo.AddConfig("Url", dataURL);
			// 切割形成的数据格式
      tlo.AddConfig("Format", "png");
			// 数据的坐标参考
      tlo.AddConfig("Srs", "EPSG:4326");
     	tlo.AddConfig("MaxX", rectangle[2]);
      tlo.AddConfig("MinX", rectangle[0]);
      tlo.AddConfig("MaxY", rectangle[3]);
      tlo.AddConfig("MinY", rectangle[1]);
			/*
			  切割数据的瓦片大小，可以往小于16的方向设置，但绝对不能往大于16的方向设置，
				但最好用切割的大小设置，否则会影响效率
			 */
      tlo.AddConfig("TileSize", "256");
			// 数据显示的最小层级
      tlo.AddConfig("MinLevel", String(minLevel));
			// 数据显示的最大层级
      tlo.AddConfig("MaxLevel", String(maxLevel));
      // 创建DEM图层，第一项参数必须为ImageLayer
      var mtddomlayer = map.CreateLayer("ImageLayer", tlo);
			// 添加DOM图层
      map.AddLayer(mtddomlayer);
      return mtddomlayer;
		},
		/**
		 * 加载网络DEM服务数据
		 * @method loadDEM
		 * @author jg
		 * @param  { String } dataURL  网络dem数据所在位置
		 * @param  { Array } rectangle 数组长度为4，依次是最小经度，最小纬度，最大经度
		 * 最大纬度
		 * @param  { Number } minLevel 最小层级
		 * @param  { Number } maxLevel 最大层级
		 * @return { Object } dem图层对象
		 * @version v6.0.6
		 */
		"loadDEM":function(dataURL,rectangle,minLevel,maxLevel){
			// 创建dem图层，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("demlayer");
			// 创建配置类型,ElevationLayerOptions代表高程数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "ElevationLayerOptions");
			// 数据源类型,代表MTDS插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "mtds");
			// 代表地形驱动，必须是此键值对
      tlo.AddConfig("Driver", "terrainquadtree");
      /*---------------以下部分可以通过图层信息获取获得相应的配置--------------*/
			// 要加载的数据路径，此数据必须是通过MTD切割工具生成的数据，并且进行了网络发布
      tlo.AddConfig("Url", dataURL);
			// 切割形成的数据格式
      tlo.AddConfig("Format", "tif");
			// 数据的坐标参考
      tlo.AddConfig("Srs", "EPSG:4326");
      tlo.AddConfig("MaxX", rectangle[2]);
      tlo.AddConfig("MinX", rectangle[0]);
      tlo.AddConfig("MaxY", rectangle[3]);
      tlo.AddConfig("MinY", rectangle[1]);
			/*
			  切割数据的瓦片大小，可以往小于16的方向设置，但绝对不能往大于16的方向设置，
				但最好用切割的大小设置，否则会影响效率
			 */
      tlo.AddConfig("TileSize", "16");
      tlo.AddConfig("MinLevel", minLevel);
      tlo.AddConfig("MaxLevel", maxLevel);
      // 创建DEM图层，第一项参数必须为ElevationLayer
      var mtdsdemlayer = map.CreateLayer("ElevationLayer", tlo);
			// 添加DEM图层
      map.AddLayer(mtdsdemlayer);
      return mtdsdemlayer;
		},
		/**
		 * 设置地形透明0.0-1.0（注：0.0没效果）
		 * @method configTOpacity
		 * @param  { Number } opacity 透明度值0.0~1.0
		 * @return { Object } 地形操作对象
		 */
		"configTOpacity":function(opacity){
			// 创建配置类型,操作类型的配置
			var tlo = map.CreateOperationOptions("TerrainOption");
			// 地形配置项名称
      tlo.AddConfig("OptionsTypeName", "TerrainOption");
			// 添加操作类型为透明度操作
      tlo.AddConfig("Operation", "Opacity");
			// 透明度值0.0~1.0
      tlo.AddConfig("Opacity", opacity);
			// 根据配置创建模型调整操作，第一个参数为模型操作的类名
      var operationPtr = map.CreateOperation("TerrainOperation", tlo);
			// 加入操作并执行
      map.AddOperation(operationPtr);
      return  operationPtr;
		},
		"getSDKVersion":function(){
			return content3d.GetCurrentVer();
		},
		/**
		 * 更新透明值操作
		 * @param  { Object } operationPtr 地形操作对象
		 * @param  { Number } opacity      透明度值0.0~1.0
		 * @return { null }
		 */
		"updateTOpacity":function(operationPtr,opacity){
			// 创建配置类型,操作类型的配置
			var tlo = map.CreateOperationOptions("TerrainOption");
			// 创建添加配置项类型
      tlo.AddConfig("OptionsTypeName", "TerrainOption");
			// 添加透明度
      tlo.AddConfig("Opacity", opacity);
			// 更新透明度
      operationPtr.UpdateOperationOptions(tlo);
		},
		/**
		 * 加载本地矢量数据
		 * @method loadSphereShp
		 * @param  { String } url      设置数据的绝对路径
		 * @param  { String } Size     配置大小(0-10)
		 * @param  { String } Color    配置颜色RGBA
		 * @param  { String } TileSize 配置切片大小
		 * @param  { String } LiftUp   配置抬高值
		 * @param  { String } MinRange 配置最小显示范围，不为负值
		 * @param  { String } MaxRange 配置最大显示范围
		 * @param  { String } Stipple  线样式
		 * @param  { String } Width    线宽
		 * @return {[type]}     [description]
		 */
		"loadSphereShp": function(opt){
			/*jshint maxcomplexity:12 */
			this.opt = opt;
			var Url = this.opt.url;
			var Size = this.opt.Size || "10";
      var Color = this.opt.Color || "1.0,1.0,0.0,1.0";
      var TileSize = this.opt.TileSize || "100000";
      var LiftUp = this.opt.LiftUp || "10";
      var MinRange = this.opt.MinRange || "0.0";
      var MaxRange = this.opt.MaxRange || "1000000.0";
      var Stipple = this.opt.Stipple || "-1";
      var Width = this.opt.Width || "2";
			if(this.opt.type === 0){
				var pSymbol = map.CreateSymbol("PointSymbol");
				pSymbol.AddConfig("Size", Size);
				pSymbol.AddConfig("Color", Color);

				var pStyle = map.CreateStyle("Point");
				pStyle.SetName("point");
				pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig());
				pStyle.AddFilterName("BuildGeometryFilter");

				var tlo = map.CreateLayerOptions("shp");
				tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");
				tlo.AddConfig("DataSourceTypeName","fmgeom");
				tlo.AddConfig("Driver", "ESRI Shapefile");
				tlo.AddConfig("Url", Url);
				tlo.AddConfig("FeatureSourceType","ogr");
				tlo.AddConfig("TileSizeFactor","1.0");
				tlo.AddConfig("TileSize",TileSize);
				tlo.AddConfig("LiftUp",LiftUp);
				tlo.AddConfig("MaxRange",MaxRange);
				tlo.AddConfig("MinRange",MinRange);
        // 创建样式表
  			var styleSheet = map.CreateStyleSheet();
				// 将样式配置添加至样式表
     	 	styleSheet.AddStyle(pStyle.GetConfig());
				// 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      	tlo.AddConfig("StyleSheet", styleSheet.GetConfig());
        // 创建矢量图层，第一项参数必须为FeatureModelLayer字符串
        var pointShpLayer = map.CreateLayer("FeatureModelLayer", tlo);
				// 添加矢量图层
      	map.AddLayer(pointShpLayer);
        return pointShpLayer;
			}else if(this.opt.type === 1){
				// 线
				var lSymbol = map.CreateSymbol("LineSymbol");
				// -1 实线 1 虚线
			  lSymbol.AddConfig("Stipple", Stipple);
			  lSymbol.AddConfig("Width", Width);
			  lSymbol.AddConfig("Color", Color);
			  var lStyle = map.CreateStyle("Line");
			  lStyle.SetName("line");
			  lStyle.AddSymbol("LineSymbol", lSymbol.GetConfig());
			  lStyle.AddFilterName("BuildGeometryFilter");
			  var tlo = map.CreateLayerOptions("shp");
			  tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");
			  tlo.AddConfig("DataSourceTypeName","fmgeom");
			  tlo.AddConfig("Driver", "ESRI Shapefile");
			  tlo.AddConfig("Url", Url);
			  tlo.AddConfig("FeatureSourceType","ogr");
			  tlo.AddConfig("TileSizeFactor","1.0");
			  tlo.AddConfig("TileSize",TileSize);
			  tlo.AddConfig("LiftUp",LiftUp);
			  tlo.AddConfig("MaxRange",MaxRange);
			  tlo.AddConfig("MinRange",MinRange);
				// 创建样式表
			  var styleSheet = map.CreateStyleSheet();
				// 将样式配置添加至样式表
        styleSheet.AddStyle(lStyle.GetConfig());
				// 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
        tlo.AddConfig("StyleSheet", styleSheet.GetConfig());
        // 创建矢量图层，第一项参数必须为FeatureModelLayer
        var lineShpLayer = map.CreateLayer("FeatureModelLayer", tlo);
				// 添加矢量图层
        map.AddLayer(lineShpLayer);
				return lineShpLayer;
			}else if(this.opt.type === 2){
				// 面
				var pSymbol = map.CreateSymbol("PolygonSymbol");
			  pSymbol.AddConfig("Color", Color);
			  var pStyle = map.CreateStyle("Polygon");
			  pStyle.SetName("polygon");
			  pStyle.AddSymbol("PolygonSymbol", pSymbol.GetConfig());
			  pStyle.AddFilterName("BuildGeometryFilter");
			  var tlo = map.CreateLayerOptions("shp");
			  tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");
			  tlo.AddConfig("DataSourceTypeName","fmgeom");
			  tlo.AddConfig("Driver", "ESRI Shapefile");
			  tlo.AddConfig("Url", Url);
			  tlo.AddConfig("FeatureSourceType","ogr");
			  tlo.AddConfig("TileSizeFactor","1.0");
			  tlo.AddConfig("TileSize",TileSize);
			  tlo.AddConfig("LiftUp",LiftUp);
			  tlo.AddConfig("MaxRange",MaxRange);
			  tlo.AddConfig("MinRange",MinRange);
				// 创建样式表
		 	  var styleSheet = map.CreateStyleSheet();
				// 将样式配置添加至样式表
	      styleSheet.AddStyle(pStyle.GetConfig());
				// 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
	      tlo.AddConfig("StyleSheet", styleSheet.GetConfig());
				// 创建矢量图层，第一项参数必须为FeatureModelLayer
	      var polygonShpLayer = map.CreateLayer("FeatureModelLayer", tlo);
				// 添加矢量图层
	      map.AddLayer(polygonShpLayer);
				return polygonShpLayer;
			}
		},
		/**
		 * 图层显示控制
		 * @method showlayer
		 * @param  { Object } layer 要操作的图层对象
		 * @return { null }
		 */
		"showlayer": function(layer){
			/*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			else{
				layer.SetVisible(true);
			}
		},
		/**
		 * 图层隐藏控制
		 * @method hidelayer
		 * @param  { Object } layer 要操作的图层对象
		 * @return { null }
		 */
		"hidelayer": function(layer){
			/*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			else{
				layer.SetVisible(false);
			}
		},
		/**
		 * 图层移除
		 * @method removelayer
		 * @param  { Object } layer 要操作的图层对象
		 * @return { null }
		 */
		"removelayer": function(layer){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			else{
				map.RemoveLayer(layer);
			}
		},
		/**
		 * 路径漫游绘制
		 * @method drawRoamPath
		 * @return { Object } 路径对象
		 */
		"drawRoamPath": function(){
			// 创建图层配置信息
			var tlo = map.CreateLayerOptions("draw2dcircle");
			// 2D对象绘制必须设置为Draw2DObjectOptions
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
		  tlo.AddConfig("DataSourceTypeName", "as_draw2dobject");
		  tlo.AddConfig("IsImmediateMode", "true");
			// 点的颜色
			tlo.AddConfig("PointColor", "1, 0.8, 0.6,0.6");
			// 点的大小
			tlo.AddConfig("PointSize", "0");
			// 绘制图形外边框颜色
			tlo.AddConfig("DrawLineColor", "1,0.2,0,1");
			// 抬高高度
			tlo.AddConfig("LiftUp", "0.1");
			// 是否显示外边框
			tlo.AddConfig("VisiableLine", "true");
			// 是否显示填充面
			tlo.AddConfig("VisiableFace", "true");
			// 绘制线
			tlo.AddConfig("DrawType", "3");
			// 数据源类型,代表2D对象，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "as_draw2dobject");
			// 创建分析图层，第一项参数必须为AnalysisLayer
      var drawRoamPath = map.CreateLayer("AnalysisLayer", tlo);
      drawRoamPath.AddObserver();
			// 添加分析图层
      map.AddLayer(drawRoamPath);
      return drawRoamPath;
		},
		/**
		 * 清除路径漫游
		 * @param  { Object } layer 要清除的路径漫游图层
		 * @return { null }
		 */
		"clearRoamPath": function(layer){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			else{
				map.RemoveLayer(layer);
			}
		},
		"addRoamPath":function(coordStr,viewModel,state,speed){
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
			tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions"); /////动态路径配置信息 必须为DynamicPathLayerOptions
			tlo.AddConfig("Url", "");
			tlo.AddConfig("PlayerMode", "PLAYER_ONEWAY");
			tlo.AddConfig("ViewObjectMode",viewModel);
			tlo.AddConfig("KeyPoints", coordStr);
			tlo.AddConfig("LineWidth","2.0");
			tlo.AddConfig("LineStipple","65535");
			tlo.AddConfig("LineColor", "0.0,1.0,0.0");
			tlo.AddConfig("Velocity",speed);
			var dynamicPathLayer = map.CreateLayer("DynamicPathLayer", tlo);
			dynamicPathLayer.AddObserver();
			map.AddLayer(dynamicPathLayer);
			dynamicPathLayer.SetVisible(state);//路径隐藏
	    return dynamicPathLayer;
		},
		"playRoamPath": function(layer){  //播放路径
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLa" +
	    		"yerOptions");
	    tlo.AddConfig("PlayerState", "PLAYER_PLAY");
			layer.UpdateLayerOptions(tlo);
		},
		"pauseRoamPath": function(layer){  //暂停播放
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("PlayerState", "PLAYER_PAUSE");
	    layer.UpdateLayerOptions(tlo);
		},
		"stopRoamPath": function(layer){  //停止播放
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("PlayerState", "PLAYER_STOP");
	    layer.UpdateLayerOptions(tlo);
		},
		"getPointCount": function(){
			var pathPointCount = content3d.GetICameraPtr().GetRoamPathPointCount();  //获取路径绘制的点总个数
			return pathPointCount;
		},
		"getPointCoordinate": function(index){
			var pathPointCoordinate = content3d.GetICameraPtr().GetRoamPathPointCoordinate(index);   //获取路径播放经过的点坐标信息
			return pathPointCoordinate;
		},
		/*本地WRL模型操作*/

		"loadCPM":function(url){
			var tlo = map.CreateLayerOptions("cpm");                           // 创建cpm图层配置，给配置起个名称，任意名称
      tlo.addConfig("LayerOptionsName", "ModelLayerOptions");            // 创建配置类型, ModelLayerOptions代表模型数据配置，必须是此键值对
      tlo.Addconfig("DataSourceTypeName", "cpm");                        // 数据源类型,代表CPM插件，必须是此键值对
      tlo.addconfig("Url", url);                                         //要加载的数据路径，此数据需为CPM数据，不支持压缩数据
      var cpmLayer = map.CreateLayer("ModelLayer", tlo);                 //创建模型图层，第一项参数必须为ModelLayer
      map.AddLayer(cpmLayer);                                            //添加模型图层
			return  cpmLayer;
		},
		"modelPick":function(){//模型拾取
			content3d.GetIObjectPickPtr().SetScenePickParam(true, 1);
		},
		"stopModelPick":function(){//停止拾取
			content3d.GetIObjectPickPtr().SetScenePickParam(false, 1);
		},
		"modelSetHighlight":function(layer,state){//模型高亮显示
			layer.SetHighlight(state);
		},
		/*测量工具--距离、水平、垂直*/
		"addSphereMeasure": function(type){  //测量功能
      /*jshint maxcomplexity:7 */
			var Measurelayer;
			if(type === 0){//点测量
				//////创建图层配置信息
        var tlo = map.CreateLayerOptions("pointMeasure");            // 创建分析图层配置，给配置起个名称，任意名称
        tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");   // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
        tlo.AddConfig("PointColor", "0.0,0.0,1.0,1.0");              //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
        tlo.AddConfig("PointSize", "5");                             //设置点击点的大小
        tlo.AddConfig("TextVisible", "true");                        //文字是否被显示
        tlo.AddConfig("TextLiftUp", "0");                            //文字显示的抬高高度
        tlo.AddConfig("DataSourceTypeName", "as_point");             // 数据源类型,代表点测量，必须是此键值对

        /////创建文字符号
        var pSymbol = map.CreateSymbol("TextSymbol");                //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
        pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0");     //设置文字颜色（RGBA）
        pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.TTF");//设置字体类型,字体文件一定要存在
        pSymbol.AddConfig("Size", "40");                             //设置字体清晰度
        pSymbol.AddConfig("CharacterSize", "20"); 	                 //文字大小
        pSymbol.AddConfig("CharacterMode", "0");                     // 取值 1 -- 始终朝向相机
        pSymbol.AddConfig("AlignmentMode", "5");                     // 文字对齐方式
        pSymbol.AddConfig("AxisAlignment", "6");                     // 旋转轴 0 - 7 ， 6: 自动
        pSymbol.AddConfig("RemoveDuplicateLabels", "false");         // 去重复
        pSymbol.AddConfig("IsEmbolden", "false");                    //字体是否加粗
        pSymbol.AddConfig("IsTransform", "false");                   //字体是否为斜体
        pSymbol.AddConfig("IsUnderline", "false");                   //字体是否有下划线
        pSymbol.AddConfig("IsBack", "false");                        //是否设置背景色
        pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");               //背景颜色，是否设置背景色为true有效

        /////创建样式
        var pStyle = map.CreateStyle("Text");                        //创建Style，名字可以任意
        pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());         //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取

        //////////将样式添加到图层配置里
        tlo.AddConfig("Style", pStyle.GetConfig());                  //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
        Measurelayer = map.CreateLayer("AnalysisLayer", tlo);        //创建分析图层，第一项参数必须为AnalysisLayer
        map.AddLayer(Measurelayer);                                  //添加分析图层
			}
			else if(type === 1){//水平测量
			//////创建图层配置信息
        var tlo = map.CreateLayerOptions("horizontalMeasure");           // 创建分析图层配置，给配置起个名称，任意名称
        tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");       // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
        tlo.AddConfig("PointColor", "0.0,0.0,1.0,1.0");                  //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
        tlo.AddConfig("PointSize", "5");                                 //设置点击点的大小
        tlo.AddConfig("TextVisible", "true");                            //文字是否被显示
        tlo.AddConfig("HorizontalMeasureLineColor", "1.0,0.0,0.0,1.0");  //设置线的颜色（RGBA）
        tlo.AddConfig("LineWidth", "2");                                 //线宽
        tlo.AddConfig("TextLiftUp", "0");                                //文字显示的抬高高度
        tlo.AddConfig("MeasureUnit","0");		                             //0-米； 1-公里；2-海里
    		tlo.AddConfig("MeasureUnitLanguage", "1");                       //0-英文； 1-中文
    		tlo.AddConfig("IsDepthTest","true");	                           //是否开启深度测试。false不开启，结果会浮在场景上，true实际显示位置
        tlo.AddConfig("DataSourceTypeName", "as_horizontal");            // 数据源类型,代表水平距离测量，必须是此键值对

        /////创建文字符号
        var pSymbol = map.CreateSymbol("TextSymbol");                    //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
        pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0");         //设置文字颜色（RGBA）
        pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.TTF");    //设置字体类型,字体文件一定要存在
        pSymbol.AddConfig("Size", "40");                                 //设置字体大小
        pSymbol.AddConfig("CharacterSize", "6"); 	                       //文字大小
        pSymbol.AddConfig("CharacterMode", "0");                         // 取值 1 -- 始终朝向相机
        pSymbol.AddConfig("AlignmentMode", "5");                         // 文字对齐方式
        pSymbol.AddConfig("AxisAlignment", "6");                         // 旋转轴 0 - 7 ， 6: 自动
        pSymbol.AddConfig("RemoveDuplicateLabels", "false");             // 去重复
        pSymbol.AddConfig("IsEmbolden", "false");                        //字体是否加粗
        pSymbol.AddConfig("IsTransform", "false");                       //字体是否为斜体
        pSymbol.AddConfig("IsUnderline", "false");                       //字体是否有下划线
        pSymbol.AddConfig("IsBack", "false");                            //是否设置背景色
        pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");                   //背景颜色，是否设置背景色为true有效
        //pSymbol.AddConfig("FieldPrecision", "-20");                    //字段精度

        /////创建样式
        var pStyle = map.CreateStyle("Text");                            //创建Style，名字可以任意
        pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());             //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取

        //////////将样式添加到图层配置里
        tlo.AddConfig("Style", pStyle.GetConfig());                      //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
        Measurelayer = map.CreateLayer("AnalysisLayer", tlo);            //创建分析图层，第一项参数必须为AnalysisLayer
        map.AddLayer(Measurelayer);                                      //添加分析图层
			}else if(type === 2){//垂直测量
			  //////创建图层配置信息
        var tlo = map.CreateLayerOptions("verticalMeasure");             // 创建分析图层配置，给配置起个名称，任意名称
        tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");       // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
        tlo.AddConfig("PointColor", "0.0,0.0,1.0,1.0");                  //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
        tlo.AddConfig("PointSize", "5");                                 //设置点击点的大小
        tlo.AddConfig("TextVisible", "true");                            //文字是否被显示
        tlo.AddConfig("VerticalMeasureLineColor", "1.0,0.0,0.0,1.0");    //设置线的颜色（RGBA）
        tlo.AddConfig("LineWidth", "2");                                 //线宽
        tlo.AddConfig("TextLiftUp", "0");                                //文字显示的抬高高度
        tlo.AddConfig("MeasureUnit","0");		                             //0-米； 1-公里；2-海里
    	  tlo.AddConfig("MeasureUnitLanguage", "1");                       //0-英文； 1-中文
				tlo.AddConfig("IsDepthTest","true");	                           //是否开启深度测试。false不开启，结果会浮在场景上，true实际显示位置
        tlo.AddConfig("DataSourceTypeName", "as_vertical");              // 数据源类型,代表垂直距离测量，必须是此键值对

        /////创建文字符号
        var pSymbol = map.CreateSymbol("TextSymbol");                    //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
        pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0");         //设置文字颜色（RGBA）
        pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.ttf");    //设置字体类型,字体文件一定要存在
        pSymbol.AddConfig("Size", "40");                                 //设置字体大小
        pSymbol.AddConfig("CharacterSize", "6"); 	                       //文字大小
        pSymbol.AddConfig("CharacterMode", "0");                         // 取值 1 -- 始终朝向相机
        pSymbol.AddConfig("AlignmentMode", "5");                         // 文字对齐方式
        pSymbol.AddConfig("AxisAlignment", "6");                         // 旋转轴 0 - 7 ， 6: 自动
        pSymbol.AddConfig("RemoveDuplicateLabels", "false");             // 去重复
        pSymbol.AddConfig("IsEmbolden", "false");                        //字体是否加粗
        pSymbol.AddConfig("IsTransform", "false");                       //字体是否为斜体
        pSymbol.AddConfig("IsUnderline", "false");                       //字体是否有下划线
        pSymbol.AddConfig("IsBack", "false");                            //是否设置背景色
        pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");                   //背景颜色，是否设置背景色为true有效
        //pSymbol.AddConfig("FieldPrecision", "-20");                    //字段精度

        /////创建样式
        var pStyle = map.CreateStyle("Text");                            //创建Style，名字可以任意
        pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());             //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取

        //////////将样式添加到图层配置里
        tlo.AddConfig("Style", pStyle.GetConfig());                      //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
        Measurelayer = map.CreateLayer("AnalysisLayer", tlo);            //创建分析图层，第一项参数必须为AnalysisLayer
        map.AddLayer(Measurelayer);                                      //添加分析图层
			}else if(type === 3){//距离测量
			  //////创建图层配置信息
        var tlo = map.CreateLayerOptions("distanceMesure");              // 创建分析图层配置，给配置起个名称，任意名称
        tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");       // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
        tlo.AddConfig("PointColor", "0.0,0.0,1.0,1.0");                  //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
        tlo.AddConfig("PointSize", "5");                                 //设置点击点的大小
        tlo.AddConfig("TextVisible", "true");                            //文字是否被显示
        tlo.AddConfig("DistanceMeasureLineColor", "1.0,0.0,0.0,1.0");    //设置线的颜色（RGBA）
        //tlo.AddConfig("MeasureUnit","11");		                         //10-平方米； 11-公顷； 12-平方公里； 13-平方海里
        tlo.AddConfig("LineWidth", "2");                                 //线宽
        tlo.AddConfig("TextLiftUp", "0");                                //文字显示的抬高高度
        tlo.AddConfig("MeasureUnit","0");		                             //0-米； 1-公里；2-海里
  			tlo.AddConfig("MeasureUnitLanguage","1");		                     //0-英文； 1-中文
				tlo.AddConfig("IsDepthTest","true");	                           //是否开启深度测试。false不开启，结果会浮在场景上，true实际显示位置
        tlo.AddConfig("DataSourceTypeName", "as_distance");              // 数据源类型,代表距离测量，必须是此键值对

        /////创建文字符号
        var pSymbol = map.CreateSymbol("TextSymbol");                    //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
        pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0");         //设置文字颜色（RGBA）
        pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.TTF");    //设置字体类型,字体文件一定要存在
        pSymbol.AddConfig("Size", "40");                                 //设置字体大小
        pSymbol.AddConfig("CharacterSize", "6"); 	                       //文字大小
        pSymbol.AddConfig("CharacterMode", "0");                         // 取值 1 -- 始终朝向相机
        pSymbol.AddConfig("AlignmentMode", "5");                         // 文字对齐方式
        pSymbol.AddConfig("AxisAlignment", "6");                         // 旋转轴 0 - 7 ， 6: 自动
        pSymbol.AddConfig("RemoveDuplicateLabels", "false");             // 去重复
        pSymbol.AddConfig("IsEmbolden", "false");                        //字体是否加粗
        pSymbol.AddConfig("IsTransform", "false");                       //字体是否为斜体
        pSymbol.AddConfig("IsUnderline", "false");                       //字体是否有下划线
        pSymbol.AddConfig("IsBack", "false");                            //是否设置背景色
        pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");                   //背景颜色，是否设置背景色为true有效
        //pSymbol.AddConfig("FieldPrecision", "-20");                    //字段精度

        /////创建样式
        var pStyle = map.CreateStyle("Text");                            //创建Style，名字可以任意
        pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());             //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取

        //////////将样式添加到图层配置里
        tlo.AddConfig("Style", pStyle.GetConfig());                      //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
        Measurelayer = map.CreateLayer("AnalysisLayer", tlo);            //创建分析图层，第一项参数必须为AnalysisLayer
        map.AddLayer(Measurelayer);                                      //添加分析图层
			}else if(type === 4){//面积测量
			  //////创建图层配置信息
	      var tlo = map.CreateLayerOptions("areaMeasure ");                // 创建分析图层配置，给配置起个名称，任意名称
	      tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");       // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
	      tlo.AddConfig("PointColor", "0.0,0.0,1.0,1.0");                  //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
	      tlo.AddConfig("PointSize", "5");                                 //设置点击点的大小
	      tlo.AddConfig("TextVisible", "true");                            //文字是否被显示
	      tlo.AddConfig("AreaMeasureLineColor", "1.0,0.0,0.0,1.0");        //设置线的颜色（RGBA）
	      tlo.AddConfig("PolygonColor", "0,1.0,1.0,0.5");                  //设置线的颜色（RGBA）
	      tlo.AddConfig("MeasureUnit","10");		                           //10-平方米； 11-公顷； 12-平方公里； 13-平方海里
	      tlo.AddConfig("MeasureUnitLanguage", "1");		                   //0-英文； 1-中文
	      tlo.AddConfig("LineWidth", "2");                                 //线宽
	      tlo.AddConfig("TextLiftUp", "0");                                //文字显示的抬高高度
	      tlo.AddConfig("IsDepthTest","true");	                           //是否开启深度测试。false不开启，结果会浮在场景上，true实际显示位置
	      //tlo.AddConfig("LiftUp", "1");                                  //抬升高度，任意值
	      tlo.AddConfig("DataSourceTypeName", "as_area");                  // 数据源类型,代表面积测量，必须是此键值对
	      tlo.AddConfig("AreaMeasureType", "1");	                         // 0-空间面积测量； 1-水平面积测量； 2-地形面积测量（暂无）
	      /////创建文字符号
	      var pSymbol = map.CreateSymbol("TextSymbol");                    //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
	      pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0,1");            //设置文字颜色（RGBA）
	      pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.TTF");    //设置字体类型,字体文件一定要存在
	      pSymbol.AddConfig("Size", "40");                                 //设置字体大小
	      pSymbol.AddConfig("CharacterMode", "0");                         // 取值 1 -- 始终朝向相机
	      pSymbol.AddConfig("CharacterSize", "6"); 						             //文字大小
	      pSymbol.AddConfig("AlignmentMode", "5");                         // 文字对齐方式
	      pSymbol.AddConfig("AxisAlignment", "6");                         // 旋转轴 0 - 7 ， 6: 自动
	      pSymbol.AddConfig("RemoveDuplicateLabels", "false");             // 去重复
	      pSymbol.AddConfig("IsEmbolden", "false");                        //字体是否加粗
	      pSymbol.AddConfig("IsTransform", "false");                       //字体是否为斜体
	      pSymbol.AddConfig("IsUnderline", "false");                       //字体是否有下划线
	      pSymbol.AddConfig("IsBack", "false");                            //是否设置背景色
	      pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");                   //背景颜色，是否设置背景色为true有效
	      //pSymbol.AddConfig("FieldPrecision", "-20");                    //字段精度
	      /////创建样式
	      var pStyle = map.CreateStyle("Text");                            //创建Style，名字可以任意
	      pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());             //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取
        //////////将样式添加到图层配置里
	      tlo.AddConfig("Style", pStyle.GetConfig());                      //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
	      Measurelayer = map.CreateLayer("AnalysisLayer", tlo);            //创建分析图层，第一项参数必须为AnalysisLayer
	      map.AddLayer(Measurelayer);                                      //添加分析图层
			}else if(type === 5){ // 创建面积测量
				// 创建图层配置信息
				var mlo = map.CreateLayerOptions("areaMeasure");                 //创建分析图层配置，给配置起个名称，任意名称
				mlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");       //创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
				mlo.AddConfig("DataSourceTypeName","as_area");			             //数据源类型,代表垂直距离测量，必须是此键值对
				mlo.AddConfig("PointColor","0,0.3,0.8,1.0"); 			               //设置点击点的颜色透明度（RGBA） 1为不透明 0为透明
				mlo.AddConfig("PointSize","5"); 						                     //设置点击点的大小
				mlo.AddConfig("AreaMeasureLineColor","0,0.9,0.2,1.0");           //设置线的颜色（RGBA）
				mlo.AddConfig("PolygonColor","0,0.7,0.4,0.5"); 			             //设置面的颜色（RGBA）
				mlo.AddConfig("MeasureUnit","10"); 						                   //10-平方米； 11-公顷； 12-平方公里； 13-平方海里
				mlo.AddConfig("MeasureUnitLanguage", "1"); 				               //0-英文； 1-中文
				mlo.AddConfig("AreaMeasureType", "2"); 					                 //0-空间面积测量； 1-水平面积测量； 2-地表面积测量
				mlo.AddConfig("PolygonMode", "2" );                              //地表面积测量专有配置项 封闭区域显示方式选择 1,以多边形区域显示 2,以网格显示
			  mlo.AddConfig("PageLevel", "5" );                                //地表面积测量专有配置项 0~16 当前层级累加该数值并调度相应层级瓦片
		    mlo.AddConfig("GridLineColor", "1.0,1.0,0.0,1.0");               //地表面积测量专有配置项 格网线设置 当PolygonMode为2时选择
				// 创建文字符号
				var pSymbol = map.CreateSymbol("TextSymbol");                    //创建文字符号，必须为TextSymbol字符串
				pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0");       	 //设置文字颜色（RGBA）
				pSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.TTF");  	 //设置字体类型,字体文件一定要存在
				pSymbol.AddConfig("Size", "40"); 								                 //字体精度大小
				pSymbol.AddConfig("CharacterSize", "6"); 						             //文字大小
				pSymbol.AddConfig("CharacterMode", "0"); 						             //取值 1 -- 始终朝向相机
				pSymbol.AddConfig("AlignmentMode", "5");						             //文字对齐方式
				pSymbol.AddConfig("AxisAlignment", "6");						             //旋转轴 0 - 7 ， 6: 自动
				pSymbol.AddConfig("RemoveDuplicateLabels", "false");			       //去重复
				pSymbol.AddConfig("IsEmbolden", "false");						             //字体是否加粗
				pSymbol.AddConfig("IsTransform", "false");						           //字体是否为斜体
				pSymbol.AddConfig("IsUnderline", "false");						           //字体是否有下划线
				pSymbol.AddConfig("IsBack", "false");							               //是否设置背景色
				pSymbol.AddConfig("BackColor", "0,1.0,1.0,1");					         //背景颜色，是否设置背景色为true有效
				// 创建样式
				var pStyle = map.CreateStyle("Text");                            //创建Style，名字可以任意
				pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig());             //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取
				// 将样式添加到图层配置里
				mlo.AddConfig("Style", pStyle.GetConfig());                      //第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取
				Measurelayer = map.CreateLayer("AnalysisLayer", mlo);      //创建分析图层，第一项参数必须为AnalysisLayer
				map.AddLayer(Measurelayer);                                //添加分析图层
			}
			return Measurelayer;
		},
		/*关闭测量*/
		"closeMeasure":function(layer){
			var tlo = map.CreateLayerOptions("distanceMesure");          //创建分析图层配置，给配置起个名称，任意名称
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");   //创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			tlo.AddConfig("IsActive","false" );				                   //是否激活测量
			layer.UpdateLayerOptions(tlo); 	                             //更新参数设置项
		},
		/*设置视角类型 ，viewType为0左视角，1右视角，2前视角，3顶视角，4水平视角，5是45度视角*/
		"setViewType":function(viewType){
      /*jshint maxcomplexity:7 */
			var navagation = map.CreateRoam();
			///设置视图旋转模式
            ///参数1：是否绕视点旋转：true，按视点；false，按目标点
            ///参数2：目的俯仰角设置（绝对值）；范围-89到0，单位角度。当为0时，为默认取当前俯仰角，不进行垂直转动
            ///参数3：旋转角设置（相对值）：范围-180到180，单位角度，绕视点时，向左为负，向右为正；绕目标点时，向右为负，向左为正。为0时不进行水平转动
            ///参数4：转动时间，单位毫秒，范围1-无穷大。不可取0
			switch (viewType) {
			case 0: //左视角
				 navagation.SetViewRotateRoamMode(false, 0, -90, 1500); ///绕目标点，进行水平90度左转
				break;
			case 1: //右视角
				navagation.SetViewRotateRoamMode(false, 0, 90, 1500); ///绕目标点，进行水平90度右转
				break;
			case 2: //前视角
				navagation.SetViewRotateRoamMode(false, 0, 180, 1500); ///绕目标点，进行水平180度旋转
				break;
			case 3: //顶视角
				navagation.SetViewRotateRoamMode(false, -70, 0, 1500);///绕目标点进行俯仰角为-70度的垂直旋转
				break;
			case 4: //水平视角
				navagation.SetViewRotateRoamMode(false, -1, 0, 1500); ///绕目标点回归水平
				break;
			case 5: //45度视角
				navagation.SetViewRotateRoamMode(false, -45, 0, 1500); ///绕目标点进行俯仰角为-45度的垂直旋转
				break;
			default:
				break;
		}
		},
		/**
		 * 控高分析
		 * @method heightControl
		 * @author jg
		 * @param  { Number } height      控高分析的高度
		 * @param  { String } textVisible 文字显示状态，"true"为显示，"false"为不显示
		 * @param  { String } textSize    显示文字的大小
		 * @return { Object } 返回控高分析图层
		 * @version v6.0.6
		 */
		"heightControl":function(height){
			var fontPath = content3d.GetSDKPath().replace("\\bin","");
	    fontPath += "\\data\\Fonts\\msyh.ttf";//SDK路径下的字体
			var tlo = map.CreateLayerOptions("heightControl");// 创建分析图层配置，给配置起个名称，任意名称
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions"); // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			tlo.AddConfig("DataSourceTypeName", "as_heightcontrol"); /////// 数据源类型,代表控高分析，必须是此键值对
			tlo.AddConfig("PointColor", "0.0,0.0,1.0"); //设置点击点的颜色（RGB）
			tlo.AddConfig("PointSize", "5"); //设置点击点的大小
			tlo.AddConfig("TextVisible", "true"); ////文字是否被显示
			tlo.AddConfig("HeightControlLineColor", "0.0,0.0,1.0,1"); //设置线的颜色（RGB）
			tlo.AddConfig("TextLiftUp", "0"); /////文字显示的抬高高度
			tlo.AddConfig("AreaNum", "1"); /////绘制的区域个数 
			tlo.AddConfig("LayersID", "1"); ////要取消范围内模型现状的id集合，以逗号分隔，末尾不能有逗号 如：3,4,5
			tlo.AddConfig("Height",height); ///控高的高差
			tlo.AddConfig("TopColor", "0,1,0,0.5"); //设置控高顶面的颜色（RGBA）
			tlo.AddConfig("SideColor", "1,1,1,0.5"); //设置控高侧面的颜色（RGBA）
			tlo.AddConfig("RangeLineVisible", "false"); ////范围线是否显示

			/////创建文字符号
			var pSymbol = map.CreateSymbol("TextSymbol"); //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置 
			pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0"); //设置文字颜色（RGBA）
			pSymbol.AddConfig("Font", fontPath); //设置字体类型,字体文件一定要存在
			pSymbol.AddConfig("Size", "15"); ///设置字体大小
			pSymbol.AddConfig("CharacterMode", "1"); // 取值 1 -- 始终朝向相机
			pSymbol.AddConfig("AlignmentMode", "5"); // 文字对齐方式
			pSymbol.AddConfig("AxisAlignment", "6"); // 旋转轴 0 - 7 ， 6: 自动
			pSymbol.AddConfig("RemoveDuplicateLabels", "false"); // 去重复			
			pSymbol.AddConfig("IsEmbolden", "false"); //字体是否加粗
			pSymbol.AddConfig("IsTransform", "false"); //字体是否为斜体
			pSymbol.AddConfig("IsUnderline", "false"); //字体是否有下划线
			pSymbol.AddConfig("IsBack", "false"); //是否设置背景色
			pSymbol.AddConfig("BackColor", "0,1.0,1.0,1"); //背景颜色，是否设置背景色为true有效
			pSymbol.AddConfig("FieldPrecision", "-20"); //字段精度

			/////创建样式
			var pStyle = map.CreateStyle("Text"); /////创建Style，名字可以任意
			pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig()); ///添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息，通过 pSymbol.GetConfig()获取

			//////////将样式添加到图层配置里
			tlo.AddConfig("Style", pStyle.GetConfig()); ////第一参必须为Style字符串，第二参为上面创建的Style的配置信息，通过 pStyle.GetConfig()获取

			var heightControl = map.CreateLayer("AnalysisLayer", tlo); ////创建分析图层，第一项参数必须为AnalysisLayer
			map.AddLayer(heightControl); ///添加分析图层
	    return heightControl;
		},
		
		"updateHeightControl":function(layer,height){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerOption();
			var points = opt.GetConfigValueByKey("Points");//起始点的坐标
			var pointsIndex = opt.GetConfigValueByKey("PointsIndex");
			var mlo3 = map.CreateLayerOptions("");
			// mlo3.AddConfig("LayerOptionsName", "HeightControlOptions")
		  // mlo3.AddConfig("Points",points);
		  // mlo3.AddConfig("PointsIndex",pointsIndex);
		  // mlo3.AddConfig("Height",height);
		  // mlo3.AddConfig("IsLoad","true");		    
			mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
			mlo3.AddConfig("DataSourceTypeName", "as_heightcontrol");
			mlo3.AddConfig("Height", height); //高差
			/////更新控高分析点坐标，当更新点时必须设置IsLoad配置项为true
			layer.UpdateLayerOptions(mlo3); ////更新视域分析
			
			//var id = layer.GetLayerID();
		  // map.UpdateAnalysis(id, mlo3);
		  return layer;
		},
		/*获取控高分析的起始点坐标*/
		"getHeightControlPos":function(layer){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerOption();
			var points = opt.GetConfigValueByKey("Points");                   //起始点的坐标
			return points;
		},
		/*视域分析---根据坐标点添加的视域分析*/
		"viewShed":function(VAngle,HAngle,EyePos,ArmPos){
	    var mlo3 = map.CreateLayerOptions("");
      mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");     //视域分析必须设置为ViewShedAnalysisOptions
      mlo3.AddConfig("DataSourceTypeName", "as_viewshed");
	    mlo3.AddConfig("VAngle",VAngle);
	    mlo3.AddConfig("HAngle",HAngle);
	    mlo3.AddConfig("EyePos",EyePos);                                  //观察点坐标(起始点坐标)
	    mlo3.AddConfig("ArmPos", ArmPos);                                 //目标点坐标(目标点坐标)   注意:这是场景坐标-2768163.3659590534,3196156.3096583206,-4767988.168168
		  mlo3.AddConfig("IsLoad", "true");
		  mlo3.AddConfig("IsActive", "false");
	    //mlo3.AddConfig("IsImmediateMode","true");
	    mlo3.AddConfig("DrawLineColor","0,1,0,1");
	    mlo3.AddConfig("DrawViewColor","1,0,0,1");
	    mlo3.AddConfig("DrawViewLookColor","1,1,0,1");
	    //mlo3.AddConfig("IsDepthTest","true");
	    var view = map.CreateLayer("AnalysisLayer", mlo3);
	    map.AddLayer(view);
	    return view;
		},
		/*视域分析---老版本SDK支持*/
		"updateViewShedAnalysis":function(layer,VAngle,HAngle,ArmPos){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerOption();
			var eyePos = opt.GetConfigValueByKey("EyePos");                //获取观察点坐标(起始点坐标)

			var mlo3 = map.CreateLayerOptions("");
			mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
			mlo3.AddConfig("VAngle", VAngle);
			mlo3.AddConfig("HAngle", HAngle);
			mlo3.AddConfig("EyePos", eyePos);
			mlo3.AddConfig("ArmPos", ArmPos);
			mlo3.AddConfig("IsLoad", "true");
			layer.UpdateLayerOptions(mlo3);
		},
		"sightAnalysis":function(VAngle,HAngle){
			var mlo3 = map.CreateLayerOptions("");
		  mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions"); ///视域分析必须设置为ViewShedAnalysisOptions
		  mlo3.AddConfig("DataSourceTypeName", "as_viewshed");
			mlo3.AddConfig("VAngle",VAngle);
			mlo3.AddConfig("HAngle",HAngle);
			// mlo3.AddConfig("IsImmediateMode","true");
			mlo3.AddConfig("DrawLineColor","0,1,0,1");
//			mlo3.AddConfig("DrawViewColor","1,0,0,1");
//			mlo3.AddConfig("DrawViewLookColor","1,1,0,1");
			// mlo3.AddConfig("IsDepthTest","true");
			var layer = map.CreateLayer("AnalysisLayer", mlo3);
			map.AddLayer(layer);
			return layer;
		},
//		/*获取视域分析的观察点坐标*/
//		"getViewShedPos":function(layer){
//			if(layer == null || layer == undefined){
//				return;
//			}
//			var opt = layer.GetLayerOption();
//			var eyePos = opt.GetConfigValueByKey("EyePos");                //观察点坐标
//			return eyePos;
//		},
		/*获取视域分析的观察点坐标*/
		"getViewShedPos":function(layer){
      /*jshint maxcomplexity:4 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerResult();
			if(opt.GetConfigValueByKey("DataSourceTypeName") === "as_viewshed"){
				var eyePos = opt.GetConfigValueByKey("EyePoint");
			}
			return eyePos;
		},
		/*获取视域分析的目标点坐标*/
		"getViewAimPos":function(layer){
      /*jshint maxcomplexity:4 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerResult();
			if(opt.GetConfigValueByKey("DataSourceTypeName") === "as_viewshed"){
				var aimPos = opt.GetConfigValueByKey("AimPoint");
			}
			return aimPos;
		},
		"createLineOfSight":function (StartPoint,EndPoints) {
			var fontPath = content3d.GetSDKPath().replace("\\bin","");
		    fontPath += "\\data\\Fonts\\msyh.ttf";//SDK路径下的字体
			var mlo3 = map.CreateLayerOptions("lineOfSight ");//创建分析图层配置，给配置起个名称，任意名称
			mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions"); //创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			mlo3.AddConfig("DataSourceTypeName", "as_linesight"); //数据源类型,代表通视分析，必须是此键值对
			mlo3.AddConfig("StartColor", "0,0,1,1"); 		//设置起始点颜色（RGBA）
			mlo3.AddConfig("EndColor", "0,0,1,1"); 			//设置目标点颜色（RGBA）
			mlo3.AddConfig("HitColor", "1,1,0,1"); 			//设置视线碰撞点颜色（RGBA）
			mlo3.AddConfig("StartPointSize", "7"); 			//设置起始点的大小
			mlo3.AddConfig("EndPointSize", "7"); 			//设置目标点的大小
			mlo3.AddConfig("HitPointSize", "10"); 			//设置视线碰撞点的大小
			//mlo3.AddConfig("LineWidth", "2.0"); 			//线宽
			mlo3.AddConfig("LineOfSightColor", "0,1,0,1"); 	//设置通视线颜色
			mlo3.AddConfig("InvisiblePartColor", "1,0,0,1");//设置视线不可视部分颜色（RGBA）
			mlo3.AddConfig("VisiblePartColor", "1,1,0,1"); 	//设置视线可视部分颜色（RGBA）
			mlo3.AddConfig("TextVisible", "false" );       	//是否显示文字
			mlo3.AddConfig("TextLiftUp", "10" );       		//文字抬高高度
			mlo3.AddConfig("IsActive","false" );
			mlo3.AddConfig("IsLoad","true" );          	//true表示从外部加载点列数据，false为不加载                               
			mlo3.AddConfig("StartPoint",StartPoint); //起始视点配置项
			mlo3.AddConfig("EndPoints",EndPoints); //终止点配置项
			
			//创建文字符号
			var pSymbol = map.CreateSymbol("TextSymbol"); //创建文字符号，必须为TextSymbol字符串，当上面设置TextVisible设置为 true才创建并进行相应配置
			pSymbol.AddConfig("FillingColor", "1.0, 0.0, 0.0, 1.0"); //设置文字颜色（RGBA）
			pSymbol.AddConfig("Font", fontPath); //设置字体类型,字体文件一定要存在
			pSymbol.AddConfig("Size", 15); 			//字体精度大小
			//pSymbol.AddConfig("CharacterSize", "15"); 	//文字大小
			pSymbol.AddConfig("CharacterMode", "1"); 	//取值 1 -- 始终朝向相机
			pSymbol.AddConfig("AlignmentMode", "5"); 	//文字对齐方式
			pSymbol.AddConfig("AxisAlignment", "6"); 	//旋转轴 0 - 7，6: 自动
			pSymbol.AddConfig("RemoveDuplicateLabels", "false"); //去重复			
			pSymbol.AddConfig("IsEmbolden", "false"); 	//字体是否加粗
			pSymbol.AddConfig("IsTransform", "false"); 	//字体是否为斜体
			pSymbol.AddConfig("IsUnderline", "false"); 	//字体是否有下划线
			pSymbol.AddConfig("IsBack", "false"); 		//是否设置背景色
			pSymbol.AddConfig("BackColor", "0,1.0,1.0,1"); //背景颜色，是否设置背景色为true有效

			//创建样式
			var pStyle = map.CreateStyle("Text"); //创建Style，名字可以任意
			pStyle.AddSymbol("TextSymbol", pSymbol.GetConfig()); //添加文字符号到Style里，第一参必须为TextSymbol字符串，第二参为上面创建的文字符号的配置信息
			//将样式添加到图层配置里
			mlo3.AddConfig("Style", pStyle.GetConfig()); //第一参必须为Style字符串，第二参为上面创建的Style的配置信息

			var lineOfSight = map.CreateLayer("AnalysisLayer", mlo3); //创建分析图层，第一项参数必须为AnalysisLayer
			map.AddLayer(lineOfSight); //添加分析图层
			
			//layermap[lineOfSight.GetLayerID()] = lineOfSight;
			//lineOfSight.AddObserver();
			return lineOfSight;
		},
		/*通视分析*/
		"lineOfSight":function(){
			var mlo3 = map.CreateLayerOptions("");
        mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");    //通视分析必须设置为LineOfSightOptions
        mlo3.AddConfig("DataSourceTypeName", "as_linesight");
        mlo3.AddConfig("StartColor","0,0,1,1");
	    mlo3.AddConfig("EndColor","0,0,1,1");
	    mlo3.AddConfig("HitColor","1,1,0,1");
	    mlo3.AddConfig("StartPointSize","7");
	    mlo3.AddConfig("EndPointSize","7");
	    mlo3.AddConfig("HitPointSize","10");
	    mlo3.AddConfig("IsImmediateMode","true");
	    mlo3.AddConfig("LineOfSightColor","0,1,0,1");
	    mlo3.AddConfig("InvisiblePartColor","1,0,0,1");
	    mlo3.AddConfig("VisiblePartColor","1,1,0,1");
	    mlo3.AddConfig("IsDepthTest","true");
	    var layer = map.CreateLayer("AnalysisLayer", mlo3);
	    map.AddLayer(layer);
	    return layer;
		},
		/*更新通视分析*/
		"updateLineOfSight":function(layer,statPos,endPos){
			/*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var mlo3 = map.CreateLayerOptions("");
			mlo3.AddConfig("LayerOptionsName", "LineOfSightOptions");
			mlo3.AddConfig("EndColor","1,0,1");
			mlo3.AddConfig("HitColor","1,1,1");
			mlo3.AddConfig("StartPoint",statPos);
			mlo3.AddConfig("EndPoints",endPos);
		  mlo3.AddConfig("IsLoad","true");
			var id = layer.GetLayerID();
			map.UpdateAnalysis(id, mlo3);
		},
	
		/*获取通视分析的观察点坐标*/
		"getLineOfSightStartPos":function(layer){
      /*jshint maxcomplexity:4 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerResult();
			if(opt.GetConfigValueByKey("DataSourceTypeName") === "as_linesight"){
				var StartPoint = opt.GetConfigValueByKey("StartPoint");
			}
			return StartPoint;
		},
		/*获取通视分析的目标点坐标*/
		"getLineOfSightEndPos":function(layer){
      /*jshint maxcomplexity:4 */
			if(layer === null || layer === undefined){
				return;
			}
			var opt = layer.GetLayerResult();
			if(opt.GetConfigValueByKey("DataSourceTypeName") === "as_linesight"){
				var EndPoints = opt.GetConfigValueByKey("EndPoints");
			}
			return EndPoints;
		},
		
		/*常用工具--坐标转换（经纬度转场景、场景转经纬度、屏幕转经纬度）、获取当前视点（经纬度、经纬度+旋转角）、获取SDK路径*/
		"coordTransformation":function(type,opt){
			/*jshint maxcomplexity:5 */
			this.opt = opt;
			var PosX = this.opt.posX;                                                   //场景坐标X
			var PosY = this.opt.posY;                                                   //场景坐标Y
			var PosZ = this.opt.posZ;                                                   //场景坐标H
			var lon = this.opt.Lon;                                                     //经度
			var lat = this.opt.Lat;                                                     //纬度
			var height = this.opt.Height;                                               //高度
			var ScreenX = this.opt.screenX;                                             //屏幕坐标X
			var ScreenY = this.opt.screenY;                                             //屏幕坐标Y
			var coordContent;
			if(type === 1){//经纬度转场景坐标
				var positions = map.CreatePosition(lon,lat,height);                       //获取点对象
				var convert = translate.ConvertLongLatHeightToXYZ(positions);
				coordContent = convert.GetX()+","+convert.GetY()+","+convert.GetZ()+";";
			}else if(type === 2){//场景坐标转经纬度
				var positions = map.CreatePosition(PosX,PosY,PosZ);                       //获取点对象
				var convert = translate.ConvertXYZToLongLatHeight(positions);
			  coordContent = convert.GetX()+","+convert.GetY()+","+convert.GetZ();
			}else if(type === 3){                                                        //屏幕坐标转经纬度
				var convert = translate.ScreenPosToWorldPos(ScreenX,ScreenY);
				coordContent = convert.GetX()+","+convert.GetY()+","+convert.GetZ();
			}else if(type === 4){                                                        //经纬度转屏幕坐标
				var positions = map.CreatePosition(lon,lat,height);
			 	var sPos = translate.WorldPosToScreenPos(positions);
			  coordContent = sPos.GetX()+","+sPos.GetY();
			}
			return coordContent;
		},
		/**
		 * 获取当前视点
		 * @method getViewPoint
		 * @return { String } 当前视点参数
		 */
		"getViewPoint":function(){
			var viewPoints = map.CreateNavigation().GetViewPoint();
			return viewPoints;
		},
		/**
		 * 获取sdk路径
		 * @method getSDKPath
		 * @return { String } sdk的绝对路径
		 */
		"getSDKPath":function(){
			var path = content3d.GetSDKPath();
			return path;
		},
		/**
		 * 注册事件
		 * @method sdkEvent
		 * @return { Object } 地图对象
		 */
		"sdkEvent":function(){
			var eve = content3d;
			return eve;
		},
		/**
		 * 创建文字标注图层
		 * @method createTextLabelLayer
		 * @author zwn
		 * @param  { String } liftUp     标注抬高的高度
		 * @param  { String } shpUrl     标注图层要保存的位置
		 * @param  { String } fontColor  文字颜色（RGBA），颜色值0-1，
		 * 最后一位代表透明度，0为透明，1为不透
		 * @param  { String } rotateMode 字符大小变化模式，0：随对象变化显示，
		 * 1:随相机远近变化，2：随相机远近变化，同时不超过上限值
		 * @param  { String } fontSize   字体的大小
		 * @param  { String } backColor  文字背景色（RGBA）
		 * @param  { String } lineState  是否开启接地线"0"为关闭，"1"为开启
		 * @return { Object } 文字标注图层对象
		 * @version v6.0.6
		 */
		"createTextLabelLayer":function(opt){
      /*jshint maxcomplexity:8 */
			this.opt = opt;
			var liftUp = this.opt.liftUp || "0";
			var shpUrl = this.opt.shpUrl || "";
			var fColor = this.opt.fontColor || "1.0, 1.0, 0.0, 1.0";
			var rotateMode = this.opt.rotateMode || "0";
			var fSize = this.opt.fontSize || 8;
			var bColor = this.opt.backColor || "1.0,0.0,0.0,0.6";
			var lState = this.opt.lineState || "0";
      // 创建类型为PointSymbol的符号，必须为PointSymbol字符串
			var pSymbol = map.CreateSymbol("PointSymbol");
			// 点大小，范围0-10
      pSymbol.AddConfig("Size", "5");
			// 颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透
      pSymbol.AddConfig("Color", "1.0,1.0,0.0,1");
      // 创建类型为TextSymbol的符号，必须为TextSymbol字符串
			var tSymbol = map.CreateSymbol("TextSymbol");
			// 文字颜色（RGBA），颜色值0-1，最后一位代表透明度，0为透明，1为不透
      tSymbol.AddConfig("FillingColor", fColor);
			/*
        文字字体，从系统字体目录中取，字体文件必须存在，配置一些参数时，
				如果没生效可能与字体文件相关，例如中文
			 */
      tSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.ttf");
      // 设置字体清晰度
      tSymbol.AddConfig("Size", "60");                             
			// 文字大小
      tSymbol.AddConfig("CharacterSize", String(fSize));
			/*
			  字符大小变化模式，0：随对象变化显示，1:随相机远近变化，
				2：随相机远近变化，同时不超过上限值
			 */
      tSymbol.AddConfig("CharacterMode", rotateMode);
			// 设置文字位于要素的位置
      tSymbol.AddConfig("Align", "4");
			// 设置文字旋转模式0 - 7 ， 6: 自动
      tSymbol.AddConfig("AxisAlignment", "6");
			// 是否移除重复的多重标注
      tSymbol.AddConfig("RemoveDuplicateLabels", "false");
			// 是否加粗
      tSymbol.AddConfig("IsEmbolden", "true");
			// 是否斜体
      tSymbol.AddConfig("IsTransform", "false");
			// 是否加下划线
      tSymbol.AddConfig("IsUnderline", "false");
			// 是否有背景
      tSymbol.AddConfig("IsBack", "true");
			// 设置文字背景色
      tSymbol.AddConfig("BackColor", bColor);
			// 背景图片地址
      tSymbol.AddConfig("ImageURL", "");
			// 接地线颜色
      tSymbol.AddConfig("LineColor", "1,1,1,1");
			// 是否开启接地线
      tSymbol.AddConfig("IsAddGroundLine",lState);
			// 接地线抬升值(配置该项接地线将是文字到点之间，否则是文字、点到地底)
      tSymbol.AddConfig("FeatureLiftUp",liftUp);
			// []里代表矢量的某字段名称----这个配置必须有
      tSymbol.AddConfig("Content", "[textname]");
      // 背景边框左边大小
      tSymbol.AddConfig("BackdropMarginLeft", "3");
      // 背景边框右边大小
      tSymbol.AddConfig("BackdropMarginRight", "3");
      // 背景边框上边大小
      tSymbol.AddConfig("BackdropMarginUp", "3");
      // 背景边框下边大小
      tSymbol.AddConfig("BackdropMarginDown", "3");
      // 创建名称为Point的样式，名称任意
      var pStyle = map.CreateStyle("Point");
			// 将符号配置添加到该样式，第一参必须为TextSymbol字符串
      pStyle.AddSymbol("TextSymbol", tSymbol.GetConfig());
			// 设置文字构建器符号为BuildTextFilter，必须为BuildGeometryFilter字符串
      pStyle.AddFilterName("BuildTextFilter");
			// 设置别名point
   	  pStyle.SetName("point");
			// 将点符号配置添加到该样式
   	  // pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig());
   	  // 设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
  	  // pStyle.AddFilterName("BuildGeometryFilter");
      /*--------------此部分是文字在场景中显示的配置--------------------*/
			// 创建样式表
      var styleSheet = map.CreateStyleSheet();
			// 将样式配置添加至样式表
      styleSheet.AddStyle(pStyle.GetConfig());
      // 创建图层配置对象
      var tlo = map.CreateLayerOptions("shp");
			// 创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");
			// 数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom");
			// 数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Driver", "ESRI Shapefile");
			// 初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("Url", shpUrl);
			// 要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("FeatureSourceType", "ogr");
			// 创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("Fields", "Name:String:100:0,textname:String:100:0," +
			  "lon:String:100:0,lat:String:100:0,height:String:100:0");
			/*
                            几何类型     Point为点 Polyline为线 Polygon为面
				此项配置不能少或字符串一定不能错误，否则保存文件不成功
			 */
      tlo.AddConfig("GeometryType", "Point");
			// 瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSizeFactor", "1.0");
			// 瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("TileSize", "0");
			// 抬升高度，任意值
      tlo.AddConfig("LiftUp", "0");
			// 最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MaxRange", "1000.0");
			// 最小显示范围，0-无穷大
      tlo.AddConfig("MinRange", "0.0");
      /* 
                           调度优先级 = priority * PriorityScale + PriorityOffset;
                           其中priority由vp根据PagedNode结点的范围(minExtent, maxExtent)、其距离视点的距离、
        LOD层级mLODScale计算得到， 调度优先级越大，优先调度并显示 
       */
      // 结点调度优先级的缩放值PriorityScale,默认为1
      tlo.AddConfig("PriorityScale","1.0");
      // 结点调度优先级的偏移值PriorityOffset,
      tlo.AddConfig("PriorityOffset","1.0");
			// 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig());
      var shpLayer = map.CreateLayer("FeatureModelLayer", tlo);
      map.AddLayer(shpLayer);
	    return shpLayer;
		},
		"loadLineShp":function(LayerName,shpServer){// 加载路网(带图符号)
			var fontPath = content3d.GetSDKPath().replace("\\bin", "");
			fontPath += "\\data\\Fonts\\msyh.ttf";// SDK路径下的字体
			var tSymbol = map.CreateSymbol("TextSymbol"); // 创建类型为TextSymbol的符号，必须为TextSymbol字符串
			tSymbol.AddConfig("FillingColor", "1.0,1.0,0.0, 1.0"); // 文字颜色（RGBA），颜色值0-1，最后一位代表透明度，0为透明，1为不透
			tSymbol.AddConfig("Font", fontPath); // 文字字体，从系统字体目录中取，字体文件必须存在，配置一些参数时，如果没生效可能与字体文件相关，例如中文
			tSymbol.AddConfig("Size", "40"); // 字体精度大小
			tSymbol.AddConfig("CharacterSize", "8"); // 文字大小
			tSymbol.AddConfig("CharacterMode", "1"); // 字符大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值
			tSymbol.AddConfig("AlignmentMode", "4"); // 设置文字位于要素的位置
			tSymbol.AddConfig("AxisAlignment", "6"); // 设置文字旋转模式0 - 7 ， 6: 自动
			tSymbol.AddConfig("RemoveDuplicateLabels", "false"); // 是否移除重复的多重标注
			tSymbol.AddConfig("IsEmbolden", "false"); // 是否加粗
			tSymbol.AddConfig("IsTransform", "false"); // 是否斜体
			tSymbol.AddConfig("IsUnderline", "false"); // 是否加下划线
			tSymbol.AddConfig("IsHorizontal", "true"); // 是否水平排列
			tSymbol.AddConfig("HorizonSpacingSize", "1.0"); // 字符水平间隔距离
			tSymbol.AddConfig("IsBack", "false"); // 是否有背景
			tSymbol.AddConfig("BackColor", "0.88,0.87,0.76,1"); // 设置文字背景色
			tSymbol.AddConfig("LineColor", "0.6,0.6,0.6,1.0"); // 接地线颜色
			tSymbol.AddConfig("IsAddGroundLine", "false"); // 是否开启接地线
			tSymbol.AddConfig("Content", "[NAME]"); // []里代表矢量的某字段名称
			tSymbol.AddConfig("LibraryName", "Library"); // 设置资源库名称
			tSymbol.AddConfig("BackdropMarginLeft", "2.0"); // 背景边框左边大小
			tSymbol.AddConfig("BackdropMarginRight", "4.0"); // 背景边框右边大小
			tSymbol.AddConfig("BackdropMarginUp", "2.0"); // 背景边框上边大小
			tSymbol.AddConfig("BackdropMarginDown", "4.0"); // 背景边框下边大小

			var lSymbol = map.CreateSymbol("LineSymbol"); // //创建类型为LineSymbol的符号，必须为LineSymbol字符串
			lSymbol.AddConfig("Stipple", "-1"); // //线条类型，-1 实线 1 虚线
			lSymbol.AddConfig("Width", "2"); // //线宽 0-10
			lSymbol.AddConfig("Color", "1.0,1.0,0.0,0.0"); // //颜色值（RGBA）0-1，最后一位代表透明度，0为透明，1为不透

			var lStyle = map.CreateStyle("Line"); // //创建名称为Line的样式，名称任意
			lStyle.SetName("line"); // //设置别名line
			lStyle.AddSymbol("LineSymbol", lSymbol.GetConfig()); // //将符号配置添加到该样式，第一参必须为LineSymbol字符串
			lStyle.AddFilterName("BuildGeometryFilter"); // //设置构建器符号为BuildGeometryFilter必须为BuildGeometryFilter字符串
			lStyle.AddSymbol("TextSymbol", tSymbol.GetConfig()); // 将符号配置添加到该样式，第一参必须为TextSymbol字符串
			lStyle.AddFilterName("BuildTextFilter");

			var tlo = map.CreateLayerOptions("wfs"); // //创建图层配置对象，名称任意
			tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); // //创建配置类型,
																			// FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
			tlo.AddConfig("DataSourceTypeName", "fmgeom"); // //数据源类型,代表fmgeom插件，必须是此键值对

			// ////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////
			tlo.AddConfig("Url", shpServer); // //数据存放位置，此为网络路径，在浏览器中查看，
			tlo.AddConfig("FeatureSourceType", "wfs"); // //要素数据源类型，针对wfs数据源wfs
			tlo.AddConfig("LayerName", LayerName); // //wfs图层名称，可通过图层信息获取接口获得到
			// ////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////

			tlo.AddConfig("TileSizeFactor", "1.0"); // //瓦片大小的影响因子，建议是1.0
			tlo.AddConfig("TileSize", "3000"); // //瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
			tlo.AddConfig("LiftUp", "15"); // //抬升高度，任意值
			tlo.AddConfig("MaxRange", "15000.0"); // //最大显示范围，大于最小显示范围-无穷大
			tlo.AddConfig("MinRange", "15.0"); // //最小显示范围，0-无穷大

			tlo.AddConfig("PriorityOffset", "200");
			tlo.AddConfig("PriorityScale", "1");

			var styleSheet = map.CreateStyleSheet(); // //创建样式表
			styleSheet.AddStyle(lStyle.GetConfig()); // //将样式配置添加至样式表
			tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); // //将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

			var wfsshpLayer2D = map.CreateLayer("FeatureModelLayer", tlo); // //创建矢量图层，第一项参数必须为FeatureModelLayer
			map.AddLayer(wfsshpLayer2D); // //添加矢量图层
			return wfsshpLayer2D;
		},
		"loadAreaShp":function(LayerName,shpServer){
			var polygonSymbol = map.CreateSymbol("PolygonSymbol"); // //创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
			polygonSymbol.AddConfig("Color", "1, 1.0, 1.0, 1"); // //颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

			var extruSymbol = map.CreateSymbol("PolygonExtrusionSymbol"); // //创建类型为PolygonExtrusionSymbol的符号,为面挤出符号，必须为PolygonExtrusionSymbol字符串
			extruSymbol.AddConfig("HeightExpression", "[楼层] * 3"); // //挤出面的高度，可以直接传值，也可以[]中设置相应的属性字段，会根据属性字段进行拉伸高度
			extruSymbol.AddConfig("RoofStyleName", "PolygonStyle"); // //拉伸体块整体的颜色，通过此关键字RoofStyleName关联面符号，第二参必须与面符号所在样式名称一致

			var pStyle = map.CreateStyle("PolygonStyle"); // //创建名称为PolygonStyle的样式，名称任意
			pStyle.AddSymbol("PolygonSymbol", polygonSymbol.GetConfig()); // //将面符号配置添加到该样式，第一参必须为PolygonSymbol字符串

			var eStyle = map.CreateStyle("ExtruStyle"); // //创建名称为ExtruStyle的样式，名称任意
			eStyle.AddSymbol("PolygonExtrusionSymbol", extruSymbol.GetConfig()); // //将面挤出符号配置添加到该样式，第一参必须为PolygonExtrusionSymbol字符串
			eStyle.AddFilterName("ExtrudeBuildingsFilter"); // //设置挤出构建器符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串

			// ////整体体块外围轮廓线的颜色及样式
			var lSymbol = map.CreateSymbol("LineSymbol"); // //创建类型为LineSymbol的符号，必须为LineSymbol字符串
			lSymbol.AddConfig("Stipple", "-1"); // //线条类型，-1 实线 1 虚线 暂不起作用
			lSymbol.AddConfig("Width", "5"); // //线宽 0-10 暂不起作用
			lSymbol.AddConfig("Color", "0.0,0.0,0.0,1.0"); // //颜色值（RGBA）0-1，最后一位代表透明度，0为透明，1为不透

			eStyle.AddSymbol("LineSymbol", lSymbol.GetConfig()); // //将符号配置添加到存放挤出符号的样式中，第一参必须为LineSymbol字符串

			var styleSheet = map.CreateStyleSheet(); // //创建样式表
			styleSheet.AddStyle(pStyle.GetConfig()); // //将样式配置添加至样式表
			styleSheet.AddStyle(eStyle.GetConfig()); // //将样式配置添加至样式表

			var tlo = map.CreateLayerOptions("wfs"); // //创建图层配置对象，名称任意
			tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); // //创建配置类型,
																			// FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
			tlo.AddConfig("DataSourceTypeName", "fmgeom"); // //数据源类型,代表fmgeom插件，必须是此键值对

			// ////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////
			tlo.AddConfig("Url", shpServer); // //数据存放位置，此为网络路径，在浏览器中查看，
			tlo.AddConfig("FeatureSourceType", "wfs"); // //要素数据源类型，针对wfs数据源wfs
			tlo.AddConfig("LayerName", LayerName); // //wfs图层名称，可通过图层信息获取接口获得到
			// ////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////

			tlo.AddConfig("TileSizeFactor", "1.0"); // //瓦片大小的影响因子，建议是1.0
			tlo.AddConfig("TileSize", "300"); // //瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
			tlo.AddConfig("LiftUp", "50"); // //抬升高度，任意值
			tlo.AddConfig("MaxRange", "4000.0"); // //最大显示范围，大于最小显示范围-无穷大
			tlo.AddConfig("MinRange", "0.0"); // //最小显示范围，0-无穷大

			tlo.AddConfig("PriorityOffset", "100");
			tlo.AddConfig("PriorityScale", "1");

			tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); // //将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

			var wfsshpLayer3D = map.CreateLayer("FeatureModelLayer", tlo); // //创建矢量图层，第一项参数必须为FeatureModelLayer
			map.AddLayer(wfsshpLayer3D); // //添加矢量图层
			return wfsshpLayer3D;
		},

		/**
		 * 创建文字标注
		 * @method addTextLabel
		 * @author zwn
		 * @param  { Object } layer  要添加标注的图层
		 * @param  { String } name   标注要显示的信息
		 * @param  { String } Lon    标注所在经度
		 * @param  { String } Lat    标注所在纬度
		 * @param  { String } Height 标注所在高度
		 * @return { null }
		 * @version v6.0.6
		 */
		"addTextLabel":function(layer,name,Lon,Lat,Height){
      /*jshint maxcomplexity:2 */
			var Name = name || "default";
			// 获取图层id
	  	var id = layer.GetLayerID();
			// 获取矢量图层
      var editLayer = map.GetFeatureModelLayer(id);
      // 创建要素对象
    	var addFeature = map.CreateFeature();
			// 多结构要素
			addFeature.SetGeometryType(1);
			// 添加点
			addFeature.AddPoint(Lon, Lat, Height);
			//添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
			addFeature.AddAttribute("textname", Name, 5);
			addFeature.AddAttribute("lon", Lon, 5);
	    addFeature.AddAttribute("lat", Lat, 5);
		  addFeature.AddAttribute("height", Height, 5);
			// 获取矢量图层要素最大ID
			var featureId = editLayer.GetMaxFeatureID();
			// 设置FeatureID
			addFeature.SetFeatureId(featureId + 1);
			editLayer.AddFeature(addFeature);
			return addFeature;
		},
		/**
		 * 更新文字标注
		 * @method updateTextLabel
		 * @author jg
		 * @param  { Object } oldLabel 要更新的标注
		 * @param  { Object } layer    标注所在的图层
		 * @param  { String } name     新的标注信息
		 * @param  { String } Lon      新的经度
		 * @param  { String } Lat      新的纬度
		 * @param  { String } Height   新的高度
		 * @return { Object } 返回更新后的标注对象
		 * @version v6.0.6
		 */
		"updateTextLabel":function(oldLabel, layer, name, Lon, Lat, Height){
      /*jshint maxcomplexity:2 */
			var Name = name || "default";
	  	var id = layer.GetLayerID();                                   //获取图层id
      var editLayer = map.GetFeatureModelLayer(id);                  //获取矢量图层
      /*创建文字要素*/
    	var addFeature = map.CreateFeature();	          							 //创建要素对象
			addFeature.SetGeometryType(1);	                               //多结构要素
			addFeature.AddPoint(Lon, Lat, Height);                         //添加点
			//为文字标注添加属性
			addFeature.AddAttribute("textname", Name, 5);					         //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
			addFeature.AddAttribute("lon", Lon, 5);
	    addFeature.AddAttribute("lat", Lat, 5);					               //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  addFeature.AddAttribute("height", Height, 5);
			var featureId = editLayer.GetMaxFeatureID();					         //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						           //设置FeatureID
			editLayer.UpdateFeatureByNew(oldLabel, addFeature);
			return addFeature;
		},
		//拾取更新文字标注
		"pickUpdateTextLabel":function(opt){
      /*jshint maxcomplexity:5 */
			this.opt = opt;
			var FeatureObj = this.opt.featureObj;
			var content = FeatureObj.GetResponserResult();                //此处的layer是创建标注拾取响应器返回的layer
			var OperateLayer = this.opt.operateLayer;
			var OldName = content.GetConfigValueByKey("textname");
			var OldLon = content.GetConfigValueByKey("lon");
			var OldLat = content.GetConfigValueByKey("lat");
			var OldHeight = content.GetConfigValueByKey("height");
			var NewName = this.opt.newName || OldName;
			var NewLon = this.opt.newLon || OldLon;
			var NewLat = this.opt.newLat || OldLat;
			var NewHeight = this.opt.newHeight || OldHeight;

			var oldId = OperateLayer.GetLayerID();                              //获取图层id
      var oldEditLayer = map.GetFeatureModelLayer(oldId);          //获取矢量图层
      /*创建文字要素*/
    	var oldFeature = map.CreateFeature();
    	oldEditLayer.GetFeatureByPick(oldFeature);	            				 //创建要素对象
			oldFeature.SetGeometryType(1);	                             //多结构要素
			oldFeature.AddPoint(OldLon, OldLat, OldHeight);              //添加点
			//为文字标注添加属性
			oldFeature.AddAttribute("textname", OldName, 5);					   //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
			oldFeature.AddAttribute("lon", OldLon, 5);
	    oldFeature.AddAttribute("lat", OldLat, 5);					         //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  oldFeature.AddAttribute("height", OldHeight, 5);

			var id = OperateLayer.GetLayerID();                              //获取图层id
      var editLayer = map.GetFeatureModelLayer(id);                //获取矢量图层
      /*创建文字要素*/
    	var addFeature = map.CreateFeature();							           //创建要素对象
			addFeature.SetGeometryType(1);	                             //多结构要素
			addFeature.AddPoint(NewLon, NewLat, NewHeight);              //添加点
			//为文字标注添加属性
			addFeature.AddAttribute("textname", NewName, 5);					   //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
			addFeature.AddAttribute("lon", NewLon, 5);
	    addFeature.AddAttribute("lat", NewLat, 5);					         //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  addFeature.AddAttribute("height", NewHeight, 5);
			var featureId = editLayer.GetMaxFeatureID();					       //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						         //设置FeatureID
			editLayer.UpdateFeatureByNew(oldFeature, addFeature);
		},
		//保存标注文件
		"saveLabelFile":function(layer){
			var id = layer.GetLayerID();                       //获取图层id
      var pointeditLayer = map.GetFeatureModelLayer(id); //获取矢量图层
			pointeditLayer.SaveLayer();                        //编辑面图层保存，一般用于首次创建保存
		},
		//标注拾取后删除
		"deleteLabelByPick":function(layer){
      /*jshint maxcomplexity:3 */
			//layer表示的是一个数组，用来存放不同类型的文字标注
			var lay = "";
  		for(var i = 0;i<layer.length;i++){
		  	lay += layer[i].getlayerid() + ",";
		  }
	 		var la = lay.substring(0, lay.length -1).split(",");
	 		for(var j = 0;j<la.length;j++){
	      var pointeditLayer = map.GetFeatureModelLayer(la[j]);  //获取矢量图层
				pointeditLayer.DeleteFeature();
	 		}
		},
		//通过坐标删除要素
		"deleteLabel":function(layer,lon,lat,height){
			var id = layer.GetLayerID();                           //获取图层id
      var pointeditLayer = map.GetFeatureModelLayer(id);     //获取矢量图层
			pointeditLayer.DeleteFeatureByGeoPos(lon,lat,height);
		},
		/**
     * 根据要素id删除要素
     * @method deleteTextById
     * @author jg
     * @param  { Object } feature 待删除的要素
     * @param  { Object } layer   要素所在的图层
     * @return { null }
     * @version v6.0.7
     */
    "deleteTextById":function(opt){
      this.opt = opt;
      var Feature = this.opt.feature;
      var Layer = this.opt.layer;
      var id = Layer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
      // 创建要素对象
      var addFeature = map.CreateFeature();
      // addFeature若为NULL则为删除id为某值的要素
      editLayer.UpdateFeatureById(Feature.GetFeatureId(), addFeature);
    },
		//创建一个图片标注图层
		"createImageLabelLayer":function(opt){
      /*jshint maxcomplexity:9 */
			this.opt = opt;
			var IconUrl = this.opt.iconUrl;
			var LiftUp = this.opt.liftUp || 0;
			var ShpUrl = this.opt.shpUrl || "";
			var XScale = this.opt.xScale || 0.5;
			var YScale = this.opt.yScale || 0.5;
			var ZScale = this.opt.zScale || 0.5;
			var Direction = this.opt.direction || "0";
			var Align = this.opt.align || "4";
			var MaxRange = this.opt.maxRange || "10000";
			var pSymbol = map.CreateSymbol("PointSymbol");                          //创建类型为PointSymbol的符号，必须为PointSymbol字符串
      pSymbol.AddConfig("Size", "10");                                        //点大小，范围0-10
      pSymbol.AddConfig("Color", "1.0,1.0,0.0,1.0");                          //颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透
      var tSymbol = map.CreateSymbol("IconSymbol");                           //创建类型为IconSymbol的符号，必须为IconSymbol字符串
      tSymbol.AddConfig("Align", Align);                                      //设置图片与要素的相对位置
      tSymbol.AddConfig("AxisAlignmentType", Direction);                      //设置图片旋转模式,0始终朝向观察点,1固定模式
      tSymbol.AddConfig("CharacterMode", "2");                                //图片大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值Scale
      tSymbol.AddConfig("Scale", "1");                                        //图片大小变化上限值
      tSymbol.AddConfig("XScale", String(XScale));                            //图片x方向放大比例
      tSymbol.AddConfig("YScale", String(YScale));                            //图片y方向放大比例
      tSymbol.AddConfig("ZScale", String(ZScale));                            //图片z方向放大比例
      tSymbol.AddConfig("LineColor", "1,1,1,1");                              //接地线颜色
      tSymbol.AddConfig("IsAddGroundLine", "0");                              //是否开启接地线
      tSymbol.AddConfig("FeatureLiftUp", String(LiftUp)); 				            //接地线抬升值(配置该项接地线将是文字到点之间，否则是文字、点到地底)
      tSymbol.AddConfig("Url", IconUrl);                                      //图标资源路径
      tSymbol.AddConfig("LibraryName", "reslib");                             //资源名称

      var res = map.CreateResource("IconSymbol");                             //创建图标资源，此处必须为IconSymbol
      res.AddConfig("Uri", IconUrl);                                          //图标资源路径
      var reslib = map.CreateResourceLibrary("reslib");                       //创建资源库，名称和图层配置LibraryName设置的名称对应
      reslib.AddResource(res);                                                //将资源添加至资源库
      /////////////////////此部分是图片在场景中显示的配置/////////////////

      var pStyle = map.CreateStyle("Point");                                  //创建名称为Point的样式，名称任意
      //pStyle.SetName("point");                                              //设置别名point
      //pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig());                 //将点符号配置添加到该样式，第一参必须为PointSymbol字符串
      pStyle.AddFilterName("BuildGeometryFilter");                            //设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
      pStyle.AddSymbol("IconSymbol", tSymbol.GetConfig());                    //将图片符号配置添加到该样式，第一参必须为IconSymbol字符串
      pStyle.AddFilterName("SubstituteModelFilter");                          //设置图片构建器符号为SubstituteModelFilter，此为图标符号化和模型符号化共有

      var styleSheet = map.CreateStyleSheet();                                //创建样式表
      styleSheet.AddStyle(pStyle.GetConfig());                                //将样式配置添加至样式表
      styleSheet.AddResLib(reslib.GetConfig());                               //将资源库添加至样式表

      var tlo = map.CreateLayerOptions("shp");                                //创建图层配置对象
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");          //创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom");                          //数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile");                              //数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", ShpUrl);                                           //初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("FeatureSourceType", "ogr");                              //要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("Fields", "Name:String:100:0,imageValue:String:100:0,lon:String:100:0,lat:String:100:0,height:String:100:0"); //创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("GeometryType", "Point");                                 //几何类型     Point为点 Polyline为线 Polygon为面 此项配置不能少或字符串一定不能错误，否则保存文件不成功
      tlo.AddConfig("TileSizeFactor", "1.0");                                 //瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "0");                                      //瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0");                                           //抬升高度，任意值
      tlo.AddConfig("MaxRange", MaxRange);                                   //最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0");                                         //最小显示范围，0-无穷大
      /* 
        调度优先级 = priority * PriorityScale + PriorityOffset;
				其中priority由vp根据PagedNode结点的范围(minExtent, maxExtent)、其距离视点
				的距离、LOD层级mLODScale计算得到， 调度优先级越大，优先调度并显示 
       */
      // 结点调度优先级的缩放值PriorityScale,默认为1
      tlo.AddConfig("PriorityScale","1.0");
      // 结点调度优先级的偏移值PriorityOffset,
      tlo.AddConfig("PriorityOffset","1.0");
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig());                    //将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
    	var shpLayer = map.CreateLayer("FeatureModelLayer", tlo);
    	map.AddLayer(shpLayer);
     	return shpLayer;
		},
		/*创建图片标注*/
		"addImageLabel":function(layer,imageValue,Lon,Lat,Height){
      /*jshint maxcomplexity:2 */
			var ImageValue = imageValue || "default";
      var id = layer.GetLayerID();                              //获取图层id
 	    var editLayer = map.GetFeatureModelLayer(id);             //获取矢量图层
 	    var addFeature = map.CreateFeature();								      //创建要素对象
		  addFeature.SetGeometryType(1);	                          //设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    addFeature.AddPoint(Lon, Lat, Height);
	    addFeature.AddAttribute("imageValue", ImageValue, 5);
	    addFeature.AddAttribute("lon", Lon, 5);
	    addFeature.AddAttribute("lat", Lat, 5);					          //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  addFeature.AddAttribute("height", Height, 5);
	    var featureId = editLayer.GetMaxFeatureID();					    //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						      //设置FeatureID
			editLayer.AddFeature(addFeature);
			return addFeature;
		},
		/*更新图片标注*/
		"updateImageLabel":function(oldLabel, layer, imageValue, Lon, Lat, Height){
      /*jshint maxcomplexity:2 */
			var ImageValue = imageValue || "default";
      var id = layer.GetLayerID();                                                  //获取图层id
 	    var editLayer = map.GetFeatureModelLayer(id);                                 //获取矢量图层
 	    var addFeature = map.CreateFeature();								                          //创建要素对象
		  addFeature.SetGeometryType(1);	                                              //设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    addFeature.AddPoint(Lon, Lat, Height);
	    addFeature.AddAttribute("imageValue", ImageValue, 5);
	    addFeature.AddAttribute("lon", Lon, 5);
	    addFeature.AddAttribute("lat", Lat, 5);					                              //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  addFeature.AddAttribute("height", Height, 5);
	    var featureId = editLayer.GetMaxFeatureID();					                        //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						                          //设置FeatureID
			editLayer.UpdateFeatureByNew(oldLabel, addFeature);
			return addFeature;
		},
		"pickUpdateImageLabel":function(opt){
      /*jshint maxcomplexity:2 */
			this.opt = opt;
			var FeatureObj = this.opt.featureObj;
			var content = FeatureObj.GetResponserResult();              //此处的layer是创建标注拾取响应器返回的layer
			var OldLayer = this.opt.oldLayer;
			var OldImageValue = content.GetConfigValueByKey("imagevalue");
			var OldLon = content.GetConfigValueByKey("lon");
			var OldLat = content.GetConfigValueByKey("lat");
			var OldHeight = content.GetConfigValueByKey("height");
			var NewLayer = this.opt.newLayer;
			var NewImageValue = this.opt.newImageValue || OldImageValue;
			var NewLon = this.opt.newLon;
			var NewLat = this.opt.newLat;
			var NewHeight = this.opt.newHeight;

			var oldId = OldLayer.GetLayerID();                          //获取图层id
 	    var oldEditLayer = map.GetFeatureModelLayer(oldId);         //获取矢量图层
 	    var oldFeature = map.CreateFeature();								        //创建要素对象
		  oldFeature.SetGeometryType(1);	                            //设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    oldFeature.AddPoint(OldLon, OldLat, OldHeight);
	    oldFeature.AddAttribute("imageValue", OldImageValue, 5);
	    oldFeature.AddAttribute("lon", OldLon, 5);
	    oldFeature.AddAttribute("lat", OldLat, 5);					        //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  oldFeature.AddAttribute("height", OldHeight, 5);
	    var oldFeatureId = oldEditLayer.GetMaxFeatureID();					//获取矢量图层要素最大ID
			oldFeature.SetFeatureId(oldFeatureId + 1); 						      //设置FeatureID
			oldEditLayer.AddFeature(oldFeature);

			var id = NewLayer.GetLayerID();                             //获取图层id
 	    var editLayer = map.GetFeatureModelLayer(id);               //获取矢量图层
 	    var addFeature = map.CreateFeature();								        //创建要素对象
		  addFeature.SetGeometryType(1);	                            //设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    addFeature.AddPoint(NewLon, NewLat, NewHeight);
	    addFeature.AddAttribute("imageValue", NewImageValue, 5);
	    addFeature.AddAttribute("lon", NewLon, 5);
	    addFeature.AddAttribute("lat", NewLat, 5);					         //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
		  addFeature.AddAttribute("height", NewHeight, 5);
	    var featureId = editLayer.GetMaxFeatureID();					       //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						         //设置FeatureID
			editLayer.UpdateFeatureByNew(oldFeature, addFeature);
		},
		/*开启标注拾取*/
		"labelPick":function(layer){
      /*jshint maxcomplexity:2 */
			var pOption = map.CreateResponserOptions("123");
			var lay = "";
  		for(var i = 0;i<layer.length;i++){
			  lay += layer[i].getlayerid() + ",";
			}
 			var la = lay.substring(0, lay.length -1);
 			pOption.AddConfig("PickLayerIdList",la);                        //拾取图层id
      pOption.AddConfig("PickColor", "1.0,0,0,1.0");
      pOption.AddConfig("IsChangeColor", "true");
      pickResp = map.CreateResponser("PickVectorResponser", pOption); //创建矢量拾取响应器，第一参必须为PickVectorResponser字符串
      pickResp.AddObserver();
      map.AddResponser(pickResp);
			return pickResp;
		},
		/**
     * 根据要素id删除要素
     * @method deleteImageById
     * @author jg
     * @param  { Object } feature 待删除的要素
     * @param  { Object } layer   要素所在的图层
     * @return { null }
     * @version v6.0.7
     */
    "deleteImageById":function(opt){
      this.opt = opt;
      var Feature = this.opt.feature;
      var Layer = this.opt.layer;
      var id = Layer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
      // 创建要素对象
      var addFeature = map.CreateFeature();
      // addFeature若为NULL则为删除id为某值的要素
      editLayer.UpdateFeatureById(Feature.GetFeatureId(), addFeature);
    },
		/*标注拾取销毁*/
		"destroyLabelPick":function(){
			map.RemoveResponser("PickVectorResponser");
		},
		/*获取标注拾取的属性*/
		"getLabelValue":function(layer){
	    var content = layer.GetResponserResult();//此处的layer是创建标注拾取响应器返回的layer
	    var modelId = content.GetConfigValueByKey("name");
	    var imageValue = content.GetConfigValueByKey("imagevalue");
	    var textName = content.GetConfigValueByKey("textname");
	    var points = content.GetConfigValueByKey("lon")+","+content.GetConfigValueByKey("lat")+","+content.GetConfigValueByKey("height");
	    var result = {
		   	modelId:modelId,
		   	imageValue:imageValue,
		   	textName:textName,
		   	points:points
	    }
	    return result;
		},
		"updatePickLabel":function(layer,pickResp){
		  var pOption = map.CreateResponserOptions("123"); 				//创建响应器配置，参数任意名称
		  pOption.AddConfig("PickLayerIdList", layer.GetLayerID());//拾取图层id
		  pickResp.UpdateResponserOptions(pOption);
		},

		addResForPoint:function(option,type){
      /*jshint maxcomplexity:8 */
			this.option = option;
			var ModelUrl = this.option.modelUrl;//模型路径
			var IconUrl = this.option.iconUrl;//图片路径
			var ShpUrl = this.option.shpUrl || "";//矢量文件的路径
			var State = this.option.state || true;
			var Height = this.option.height || 0;
			var Name = this.option.name || "NAME"
			var pSymbol = map.CreateSymbol("PointSymbol"); ////创建类型为PointSymbol的符号，必须为PointSymbol字符串
	    pSymbol.AddConfig("Size", "1"); ////点大小，范围0-10
	    pSymbol.AddConfig("Color", "1.0,1.0,0.0,1.0"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透
	    if(type==="model"){
		  	var tSymbol = map.CreateSymbol("ModelSymbol"); ////创建类型为ModelSymbol的符号，必须为ModelSymbol字符串
		    tSymbol.AddConfig("Heading", "0"); ////绕Z轴(世界坐标系方向相同 far->near)旋转,从far(-Z)向near(+Z)看去,逆时针为正，弧度表示
		    tSymbol.AddConfig("Pitch", "-0.8"); //////绕Y轴(世界坐标系方向相同 down(-Y)向up(Y))旋转,从down(-Y)向up(+Y)看去,逆时针为正，弧度表示
		    tSymbol.AddConfig("Roll", "0"); ////绕X轴(世界坐标系方向相同 left->right)旋转,从left(-X)向right(+X)看去,逆时针为正，弧度表示

		    tSymbol.AddConfig("XScale", "1"); ////模型x方向放大比例
		    tSymbol.AddConfig("YScale", "1"); ////模型y方向放大比例
		    tSymbol.AddConfig("ZScale", "1"); ////模型z方向放大比例
		    tSymbol.AddConfig("ModelOriginDir", "0,0,1"); ////模型原始轴向
		    tSymbol.AddConfig("Url", ModelUrl); ////模型资源路径
		    tSymbol.AddConfig("LibraryName", "reslib"); ////资源名称

		     var res = map.CreateResource("ModelSymbol"); ////创建模型资源，此处必须为ModelSymbol
		    res.AddConfig("Uri", ModelUrl); ////模型资源路径
		    var reslib = map.CreateResourceLibrary("reslib"); ////创建资源库，名称和图层配置LibraryName设置的名称对应
		    reslib.AddResource(res); ////将资源添加至资源库

		     var pStyle = map.CreateStyle("Point"); ////创建名称为Point的样式，名称任意
		    pStyle.SetName("point"); ////设置别名point
		    pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); ////将点符号配置添加到该样式
		    pStyle.AddFilterName("BuildGeometryFilter"); //设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
		    pStyle.AddSymbol("ModelSymbol", tSymbol.GetConfig()); ////将符号配置添加到该样式，第一参必须为ModelSymbol字符串
		    pStyle.AddFilterName("SubstituteModelFilter"); ////设置构建器符号为SubstituteModelFilter，必须为SubstituteModelFilter字符串，此为图标符号化和模型符号化共有

		    var styleSheet = map.CreateStyleSheet(); ////创建样式表
		    styleSheet.AddStyle(pStyle.GetConfig()); ////将样式配置添加至样式表
		    styleSheet.AddResLib(reslib.GetConfig()); ////将资源库添加至样式表

			}else if(type === "text"){
				var tSymbol = map.CreateSymbol("TextSymbol"); ////创建类型为TextSymbol的符号，必须为TextSymbol字符串
	      tSymbol.AddConfig("FillingColor", "1.0, 1.0, 0.0, 1.0"); ////文字颜色（RGBA），颜色值0-1，最后一位代表透明度，0为透明，1为不透
	      tSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.ttf"); ////文字字体，从系统字体目录中取，字体文件必须存在，配置一些参数时，如果没生效可能与字体文件相关，例如中文
	      tSymbol.AddConfig("Size", "15"); ////文字大小
	      tSymbol.AddConfig("CharacterMode", "1"); ////字符大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值
	      tSymbol.AddConfig("AlignmentMode", "4"); ////设置文字位于要素的位置
	      tSymbol.AddConfig("AxisAlignment", "6"); ////设置文字旋转模式0 - 7 ， 6: 自动
	      tSymbol.AddConfig("RemoveDuplicateLabels", "false"); ////是否移除重复的多重标注
	      tSymbol.AddConfig("IsEmbolden", "true"); ////是否加粗
	      tSymbol.AddConfig("IsTransform", "false"); ////是否斜体
	      tSymbol.AddConfig("IsUnderline", "false"); ////是否加下划线
	      tSymbol.AddConfig("IsBack", "false"); ////是否有背景
	      tSymbol.AddConfig("BackColor", "0,1.0,1.0,1"); ////设置文字背景色
	      tSymbol.AddConfig("ImageURL", ""); ////背景图片地址
	      tSymbol.AddConfig("LineColor", "1,1,1,1"); ////接地线颜色
	      tSymbol.AddConfig("IsAddGroundLine", String(State)); ////是否开启接地线
	      tSymbol.AddConfig("FeatureLiftUp", Height); 				//接地线抬升值(配置该项接地线将是文字到点之间，否则是文字、点到地底)
	      tSymbol.AddConfig("Content", "["+Name+"]"); ////[]里代表矢量的某字段名称

	      var pStyle = map.CreateStyle("Point"); ////创建名称为Point的样式，名称任意
	      pStyle.AddSymbol("TextSymbol", tSymbol.GetConfig()); ////将符号配置添加到该样式，第一参必须为TextSymbol字符串
	      pStyle.AddFilterName("BuildTextFilter"); ////设置文字构建器符号为BuildTextFilter，必须为BuildGeometryFilter字符串
	      /////////////////////此部分是文字在场景中显示的配置/////////////////

	      /////////////////////此部分是点在场景中显示的配置/////////////////
	      pStyle.SetName("point"); ////设置别名point
	      pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); ////将符号配置添加到该样式
	      pStyle.AddFilterName("BuildGeometryFilter");  ////设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
	      /////////////////////此部分是点在场景中显示的配置/////////////////

	      var styleSheet = map.CreateStyleSheet(); ////创建样式表
	       styleSheet.AddStyle(pStyle.GetConfig()); ////将样式配置添加至样式表
			}else if(type === "icon"){
				var tSymbol = map.CreateSymbol("IconSymbol"); ////创建类型为IconSymbol的符号，必须为IconSymbol字符串
	      tSymbol.AddConfig("Align", "-5"); ////设置图片与要素的相对位置
	      tSymbol.AddConfig("AxisAlignmentType", "0"); ////设置图片旋转模式
	      tSymbol.AddConfig("CharacterMode", "2"); ////图片大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值Scale
	      tSymbol.AddConfig("Scale", "1"); ////图片大小变化上限值
	      tSymbol.AddConfig("XScale", "0.5"); ////图片x方向放大比例
	      tSymbol.AddConfig("YScale", "0.5"); ////图片y方向放大比例
	      tSymbol.AddConfig("ZScale", "0.5"); ////图片z方向放大比例
	      tSymbol.AddConfig("LineColor", "1,1,1,1"); ////接地线颜色
	      tSymbol.AddConfig("IsAddGroundLine", String(State)); ////是否开启接地线
	      tSymbol.AddConfig("FeatureLiftUp", Height);
	      tSymbol.AddConfig("Url", IconUrl); ////图标资源路径
	      tSymbol.AddConfig("LibraryName", "reslib"); ////资源名称

	      var res = map.CreateResource("IconSymbol"); ////创建图标资源，此处必须为IconSymbol
	      res.AddConfig("Uri", IconUrl); ////图标资源路径
	      var reslib = map.CreateResourceLibrary("reslib"); ////创建资源库，名称和图层配置LibraryName设置的名称对应
	      reslib.AddResource(res); ////将资源添加至资源库
	      /////////////////////此部分是图片在场景中显示的配置/////////////////

	      var pStyle = map.CreateStyle("Point"); ////创建名称为Point的样式，名称任意
	      pStyle.SetName("point"); ////设置别名point
	      pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); ////将点符号配置添加到该样式，第一参必须为PointSymbol字符串
	      pStyle.AddFilterName("BuildGeometryFilter"); ////设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
	      pStyle.AddSymbol("IconSymbol", tSymbol.GetConfig()); ////将图片符号配置添加到该样式，第一参必须为IconSymbol字符串
	      pStyle.AddFilterName("SubstituteModelFilter"); ////设置图片构建器符号为SubstituteModelFilter，此为图标符号化和模型符号化共有

	      var styleSheet = map.CreateStyleSheet(); ////创建样式表
	      styleSheet.AddStyle(pStyle.GetConfig()); ////将样式配置添加至样式表
	      styleSheet.AddResLib(reslib.GetConfig()); ////将资源库添加至样式表*/
			}
      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", ShpUrl); ////初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("Fields", "Name:String:100:0,Height:Double:100:3,Width:Float:100:3"); ////创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("GeometryType", "Point"); ////几何类型     Point为点 Polyline为线 Polygon为面 此项配置不能少或字符串一定不能错误，否则保存文件不成功
      tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0"); ////抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      var resForPointLayer = map.CreateLayer("FeatureModelLayer", tlo);
			map.AddLayer(resForPointLayer);
			return resForPointLayer;
		},
		/**
	     * 在地图中添加文字符号
	     * @method showResForPoint
	     * @author jg
	     * @param { String } lon 经度
	     * @param { String } lat 纬度
	     * @param { String } height 高度
	     * @param { String } name 内容
	     * @param { Object } layer 要添加的图层
	     * @return { Null }
	     */
	    "showResForPoint":function (lon,lat,height,name,layer){
	      // 创建要素对象
	      var addFeature = map.CreateFeature();
	      // 设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)
				addFeature.SetGeometryType(1);
	      // 创建子几何类型（当GeometryType为5时生效）
				addFeature.SetComponentType(1);
	      // 向编辑图层添加坐标点信息
				addFeature.AddPoint(lon,lat,height);
	      // 添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
				addFeature.AddAttribute("Height", "43.5", 4);
	      // 添加属性值
				addFeature.AddAttribute("Name", name, 5);
	      // 添加属性值
				addFeature.AddAttribute("Width", "54", 3);
	      // 获取矢量图层要素最大ID
				var featureId = layer.GetMaxFeatureID();
	      // 设置FeatureID
				addFeature.SetFeatureId(featureId + 1);
	      // 添加到矢量图层
				layer.AddFeature(addFeature);
	    },
		"addGraphics":function(type,opt){
      /*jshint maxcomplexity:10 */
			this.opt = opt;
			var PointColor = this.opt.pointColor || "1, 0.8, 0.6,0.6";
			var PointSize  = this.opt.pointSize || "0";
			var DrawLineColor = this.opt.drawLineColor || "1,0.2,0,1";
			var DrawFaceColor = this.opt.drawFaceColor || "1,0.8,0.8,0.6";
			var LiftUp = this.opt.liftUp || "0.1";
			var VisiableLine = this.opt.visiableLine || "true";
			var VisiableFace = this.opt.visiableFace || "true";
			var LineWidth = this.opt.lineWidth || "2.0";
			var PointSet = this.opt.pointSet;
      var mlo3 = map.CreateLayerOptions("draw2dcircle");
      mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");///2D对象绘制必须设置为Draw2DObjectOptions
      mlo3.AddConfig("DataSourceTypeName", "as_draw2dobject");
	    mlo3.AddConfig("IsImmediateMode", "true");
	    mlo3.AddConfig("PointColor", PointColor);//点的颜色
	    mlo3.AddConfig("PointSize", PointSize);//点的大小
	    mlo3.AddConfig("DrawLineColor", DrawLineColor);//绘制图形外边框颜色
	    mlo3.AddConfig("DrawFaceColor", DrawFaceColor);//绘制图形填充的颜色
	    mlo3.AddConfig("LiftUp", LiftUp);//抬高高度
	    mlo3.AddConfig("VisiableLine", VisiableLine);//是否显示外边框
	    mlo3.AddConfig("VisiableFace", VisiableFace);//是否显示填充面
	    mlo3.AddConfig("LineWidth", LineWidth);  //线宽
	    mlo3.AddConfig("SplitPointNum", "40");
	    mlo3.AddConfig("DrawType", String(type));//绘制图形
	    if(PointSet !== "" && PointSet !== undefined && PointSet !== null){
	      mlo3.AddConfig("IsLoad", "true");//根据点集来画图
		  mlo3.AddConfig("IsActive", "false");//设置为false停止响应鼠标
	      mlo3.AddConfig("Points", PointSet);
	    }
	    var Draw2DObjectLayer = map.CreateLayer("AnalysisLayer", mlo3);
	    Draw2DObjectLayer.AddObserver();
	    map.AddLayer(Draw2DObjectLayer);
	    return Draw2DObjectLayer;
		},
		//更新图形
		"updateGraphics":function(layer){
			var mlo = map.CreateLayerOptions("rectangle "); //创建更新的配置参数
			mlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions"); //创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			mlo.AddConfig("DataSourceTypeName", "as_draw2dobject"); //数据源类型,代表2D对象，必须是此键值对
			mlo.AddConfig("IsActive", "false");
			layer.UpdateLayerOptions(mlo);
		},
		/**
		 * 在地图上添加动画路径图层对象
		 * @method createDynamicPath
		 * @author jg
		 * @param  { String } modelUrl    模型资源路径
		 * @param  { String } playMode    播放模式 有一次性播放"PLAYER_ONEWAY"
		 * 循环一次播放"PLAYER_ONEWAY_LOOP" 往返播放"PLAYER_ROUND_LOOP"
		 * @param  { String } viewObject  模型的观看视角，对象的格式为"1.57,-0.708,100",
		 * 第一个为视角方位角,第二个为视角俯仰角，第三个为视点到关键点距离
		 * @param  { String } coordStr    组成路径的点集
		 * @param  { String } pathWidth   路径的线的宽度
		 * @param  { String } pathColor   路径的颜色
		 * @param  { String } speed       模型移动的速度
		 * @param  { String } modelXScale X轴放大比例
		 * @param  { String } modelYScale Y轴放大比例
		 * @param  { String } modelZScale Z轴放大比例
		 * @return { Object } 动画路径图层
		 */
		"createDynamicPath":function(opt){
      /*jshint maxcomplexity:9 */
			this.opt = opt;
			var ModelUrl = this.opt.modelUrl;
			var PlayMode = this.opt.playMode || "PLAYER_ONEWAY";
			var ViewObject = this.opt.viewObject || "0.0,-0.838920733233321,80.0";
			var CoordStr = this.opt.coordStr;
			var PathWidth = this.opt.pathWidth || "2.0";
			var PathColor = this.opt.pathColor || "0.0,1.0,0.0,1.0";
			var Speed = this.opt.speed || "5.0";
			var ModelXScale = this.opt.modelXScale || "1";
			var ModelYScale = this.opt.modelYScale || "1";
			var ModelZScale = this.opt.modelZScale || "1";
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
			// 动态路径配置信息 必须为DynamicPathLayerOptions
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("Url", ModelUrl);
			//模型x轴缩放大小
			tlo.AddConfig("NodeXScale", ModelXScale);
			//模型Y轴缩放大小
			tlo.AddConfig("NodeYScale", ModelYScale);
			//模型Z轴缩放大小
			tlo.AddConfig("NodeZScale", ModelZScale);
			/*
        播放模式 有一次性播放"PLAYER_ONEWAY" 循环一次播放"PLAYER_ONEWAY_LOOP"
			  往返播放"PLAYER_ROUND_LOOP"
			 */
	    tlo.AddConfig("PlayerMode", PlayMode);
			/*
        视角对象;视角对象的格式为"1.57,-0.708,100",第一个为视角方位角,
			  第二个为视角俯仰角，第三个为视点到关键点距离
			 */
	    tlo.AddConfig("ViewObjectMode", ViewObject);
	    tlo.AddConfig("KeyPoints",CoordStr);
	    tlo.AddConfig("LineWidth",PathWidth);
	    tlo.AddConfig("LineStipple","65535");
	    tlo.AddConfig("LineColor", PathColor);
	    tlo.AddConfig("Velocity", Speed);
			// 拐弯处平滑半径(圆角)
			tlo.AddConfig("Radius", "5.0");
		  // 拐弯处速度变化比例(0-1之间)
			tlo.AddConfig("CornerSpeedScale", "0.3");     
			// 差值线线宽
			tlo.AddConfig("InterpLineWidth", "0.0");
			// 差值线线样式
	    tlo.AddConfig("InterpLineStipple", "65535");
			// 差值线颜色,不需要差值线去掉颜色
	    tlo.AddConfig("InterpLineColor", "0.0,1.0,1.0,0");
			// 抬高
	    tlo.AddConfig("LiftUp", "0");
			// 路径激活状态，与节点激活状态互斥
	    // tlo.AddConfig("PathActive", "true");
	    // 节点激活状态,当为true时可以跟随模型或路径移动，当前漫游不可用
	    // tlo.AddConfig("NodeActive", "true");
	    var dynamicPathLayer = map.CreateLayer("DynamicPathLayer", tlo);
	    map.AddLayer(dynamicPathLayer);
	    return dynamicPathLayer;
		},
		/*更新动画路径*/
		"updateDynamicPath":function(opt){
      /*jshint maxcomplexity:15 */
			this.opt = opt;
			var PathLayer = this.opt.pathLayer;
			var ModelUrl = this.opt.modelUrl || null;
			var PlayMode = this.opt.playMode || "";
			var ViewObject = this.opt.viewObject || "";
			var CoordStr = this.opt.coordStr || "";
			var PathWidth = this.opt.pathWidth || "";
			var PathColor = this.opt.pathColor || "";
			var Speed = this.opt.speed || "";

			var tlo = map.CreateLayerOptions("dynamicpathlayer");/////////创建更新的配置参数
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    if(ModelUrl !== null && ModelUrl !== undefined){
	    	tlo.AddConfig("Url", ModelUrl);
	    }
	    if(PlayMode !== "" && PlayMode !== undefined){
	    	tlo.AddConfig("PlayerMode", PlayMode);//播放模式 有一次性播放"PLAYER_ONEWAY" 循环一次播放"PLAYER_ONEWAY_LOOP" 往返播放"PLAYER_ROUND_LOOP"
	    }
	    if(ViewObject !== "" && ViewObject !== undefined){
	    	tlo.AddConfig("ViewObjectMode", ViewObject);//视角对象;视角对象的格式为"1.57,-0.708,100",第一个为视角方位角,第二个为视角俯仰角，第三个为视点到关键点距离
	    }
	    if(CoordStr !== "" && CoordStr !== undefined){
	    	tlo.AddConfig("KeyPoints",CoordStr);
	    }
	    if(PathWidth !== "" && PathWidth !== undefined){
	    	tlo.AddConfig("LineWidth",PathWidth);
	    }
	    if(PathColor !== "" && PathColor !== undefined){
	    	tlo.AddConfig("LineColor", PathColor);
	    }
	    if(Speed !== "" && Speed !== undefined){
	    	tlo.AddConfig("Velocity", Speed);
	    }
	    PathLayer.UpdateLayerOptions(tlo);
		},
		"operateDynamicPath":function(layer,opt){
      /*jshint maxcomplexity:4 */
			this.opt = opt;
			var PlayState = this.opt.playState;
			var FollowState = this.opt.followState || "false";
			/*播放--PLAYER_PLAY   暂停---PLAYER_PAUSE    停止---PLAYER_STOP*/
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("PlayerState", PlayState);
	    tlo.AddConfig("NodeActive", FollowState);//是否跟随
	    layer.UpdateLayerOptions(tlo);
		},
		"controlDynamicSpeed":function(layer,speed){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("Velocity", speed);
	    layer.UpdateLayerOptions(tlo);
		},
		"addDynamicFollow":function(layer){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("NodeActive", "true");
	    layer.UpdateLayerOptions(tlo);
		},
		"cancelDynamicFollow":function(layer){
      /*jshint maxcomplexity:3 */
			if(layer === null || layer === undefined){
				return;
			}
			var tlo = map.CreateLayerOptions("dynamicpathlayer");
	    tlo.AddConfig("LayerOptionsName", "DynamicPathLayerOptions");
	    tlo.AddConfig("NodeActive", "false");
	    layer.UpdateLayerOptions(tlo);
		},
		/**
		 * 图层组显隐控制部分
		 */
		"createLayerGroup":function(modelUrl){
			var pSymbol = map.CreateSymbol("PointSymbol"); ////创建类型为PointSymbol的符号，必须为PointSymbol字符串
      pSymbol.AddConfig("Size", "10"); ////点大小，范围0-10
      pSymbol.AddConfig("Color", "1.0,1.0,0.0,1.0"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      var tSymbol = map.CreateSymbol("ModelSymbol"); ////创建类型为ModelSymbol的符号，必须为ModelSymbol字符串
      tSymbol.AddConfig("Heading", "0"); ////绕Z轴(世界坐标系方向相同 far->near)旋转,从far(-Z)向near(+Z)看去,逆时针为正，弧度表示
      tSymbol.AddConfig("Pitch", "0"); //////绕Y轴(世界坐标系方向相同 down(-Y)向up(Y))旋转,从down(-Y)向up(+Y)看去,逆时针为正，弧度表示
      tSymbol.AddConfig("Roll", "0"); ////绕X轴(世界坐标系方向相同 left->right)旋转,从left(-X)向right(+X)看去,逆时针为正，弧度表示

      tSymbol.AddConfig("XScale", "1"); ////模型x方向放大比例
      tSymbol.AddConfig("YScale", "1"); ////模型y方向放大比例
      tSymbol.AddConfig("ZScale", "1"); ////模型z方向放大比例
      tSymbol.AddConfig("ModelOriginDir", "0,0,1"); ////模型原始轴向
      tSymbol.AddConfig("Url", modelUrl); ////模型资源路径
      tSymbol.AddConfig("LibraryName", "reslib"); ////资源名称

      var res = map.CreateResource("ModelSymbol"); ////创建模型资源，此处必须为ModelSymbol
      res.AddConfig("Uri", modelUrl); ////模型资源路径
      var reslib = map.CreateResourceLibrary("reslib"); ////创建资源库，名称和图层配置LibraryName设置的名称对应
      reslib.AddResource(res); ////将资源添加至资源库

      var pStyle = map.CreateStyle("Point"); ////创建名称为Point的样式，名称任意
      pStyle.SetName("point"); ////设置别名point
      pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); ////将点符号配置添加到该样式
      pStyle.AddFilterName("BuildGeometryFilter"); //设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
      pStyle.AddSymbol("ModelSymbol", tSymbol.GetConfig()); ////将符号配置添加到该样式，第一参必须为ModelSymbol字符串
      pStyle.AddFilterName("SubstituteModelFilter"); ////设置构建器符号为SubstituteModelFilter，必须为SubstituteModelFilter字符串，此为图标符号化和模型符号化共有

      var styleSheet = map.CreateStyleSheet(); ////创建样式表
      styleSheet.AddStyle(pStyle.GetConfig()); ////将样式配置添加至样式表
      styleSheet.AddResLib(reslib.GetConfig()); ////将资源库添加至样式表

      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", "C:\\test.shp"); ////初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("Fields", "Name:String:100:0,Height:Double:100:3,Width:Float:100:3"); ////创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("GeometryType", "Point"); ////几何类型     Point为点 Polyline为线 Polygon为面 此项配置不能少或字符串一定不能错误，否则保存文件不成功
      tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0.5"); ////抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
			var shpLayer = map.CreateLayer("FeatureModelLayer", tlo);
			return shpLayer;
		},
		"addGroupLayer":function(layer,name){
			 var layerGroup = map.AddLayerGroup(name);//创建管理图层的图层组对象
			layerGroup.AddLayer(layer);
			return layerGroup;
		},
		"showGroupLayer":function(layer){
			layer.SetVisible(true);
		},
		"hideGroupLayer":function(layer){
			layer.SetVisible(false);
		},
		/*截图*/
		"imageCut":function(savePath,imageName,imageMultiple){
      /*jshint maxcomplexity:2 */
			if(imageCutIndex>1){
				map.RemoveResponser("SceneshotResponser");
			}
			setTimeout(function(){
				var resp = map.CreateResponserOptions("SceneshotResponser");
        resp.AddConfig("FilePath", savePath);/////截图保存目录
        resp.AddConfig("FileName", imageName); /////截图保存名称
        resp.AddConfig("bIsOrtho", "false"); /////是否正交投影
        resp.AddConfig("bUseCache", "false"); /////是否保存缓存
        resp.AddConfig("ImageMultiple",imageMultiple ); /////截图倍数
        resp.AddConfig("JoinMultiple", imageMultiple); /////拼接倍数
        //resp.AddConfig("ImageWidth", "1024");/////图片宽度，不设及默认自动获取屏幕大小
        //resp.AddConfig("ImageHeight", "768");/////图片高度，不设及默认自动获取屏幕大小
        resp.AddConfig("LodScale", "1.0"); /////模型加载衰减
        var resSceneShot = map.CreateResponser("SceneshotResponser", resp);
        map.AddResponser(resSceneShot);
        resSceneShot.AddObserver();
			},100);
			imageCutIndex++;
            //return resSceneShot;
		},
		/*关闭截图响应器*/
		"RemoveResImagecut":function(){
			map.RemoveResponser("SceneshotResponser");
		},
		/*添加网页弹出框*/
		"showWegdit":function(opt){
      /*jshint maxcomplexity:4 */
			this.opt = opt;
			var positions = this.opt.position || "0.0,0.0,0.0";
			var width = this.opt.width || 300;
			var height = this.opt.height || 300;
			var url = this.opt.url;
			var pOption = map.CreateResponserOptions("123");
			pOption.AddConfig("Longitude", positions.split(",")[0]);
			pOption.AddConfig("Latitude", positions.split(",")[1]);
			pOption.AddConfig("PosHeight", positions.split(",")[2]);
			pOption.AddConfig("Widget", width);
			pOption.AddConfig("Height", height);
			pOption.AddConfig("Url", url);
			pOption.AddConfig("MoveDelay", "60");
			var webResp  = map.CreateResponser("TipsDialogResponser", pOption);
			map.AddResponser(webResp);
			return webResp;
		},
		/*销毁网页弹出框*/
		"hideWegdit":function(){
			map.RemoveResponser("TipsDialogResponser");
		},
		/*加载道路WFS服务*/
		"loadWFS":function(wfsUrl,layeName,fieldName){
      /*jshint maxcomplexity:2 */
			if(fieldName === ""){
            fieldName = "name";
			}
		  var lSymbol = map.CreateSymbol("LineSymbol");
	    lSymbol.AddConfig("Stipple", "-1");//-1 线 1 虚线
      lSymbol.AddConfig("Width", "3");//
      lSymbol.AddConfig("Color", "1.0,0.0,0.0,1");

			var tSymbol = map.CreateSymbol("TextSymbol");                     //创建类型为TextSymbol的符号，必须为TextSymbol字符串
      tSymbol.AddConfig("FillingColor", "1.0, 1.0, 0.0, 1.0");          //文字颜色（RGBA），颜色值0-1，最后一位代表透明度，0为透明，1为不透
      tSymbol.AddConfig("Font", "C:\\Windows\\Fonts\\STSONG.TTF");      //文字字体，从系统字体目录中取，字体文件必须存在，配置一些参数时，如果没生效可能与字体文件相关，例如中文
      //tSymbol.AddConfig("Size", "8");                                 //文字大小-----旧版本SDK支持
      tSymbol.AddConfig("CharacterSize", "6");                          //文字大小----新版本SDK支持
      tSymbol.AddConfig("CharacterMode", "1");                          //字符大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值
      tSymbol.AddConfig("AlignmentMode", "4");                          //设置文字位于要素的位置
      tSymbol.AddConfig("AxisAlignment", "6");                          //设置文字旋转模式0 - 7 ， 6: 自动
      tSymbol.AddConfig("RemoveDuplicateLabels", "false");              //是否移除重复的多重标注
      tSymbol.AddConfig("IsEmbolden", "true");                          //是否加粗
      tSymbol.AddConfig("IsTransform", "true");                         //是否斜体
      tSymbol.AddConfig("IsUnderline", "false");                        //是否加下划线
      tSymbol.AddConfig("IsBack", "false");                             //是否有背景
      tSymbol.AddConfig("BackColor", "0,1.0,1.0,1");                    //设置文字背景色
      tSymbol.AddConfig("ImageURL", "");                                //背景图片地址
      tSymbol.AddConfig("LineColor", "1,1,1,1");                        //接地线颜色
      tSymbol.AddConfig("IsAddGroundLine", "0");                        //是否开启接地线
      tSymbol.AddConfig("Content", "["+fieldName+"]");                  //[]里代表矢量的某字段名称

      var lStyle = map.CreateStyle("Line");                             //创建名称为Point的样式，名称任意
      lStyle.AddSymbol("TextSymbol", tSymbol.GetConfig());              //将符号配置添加到该样式，第一参必须为TextSymbol字符串
      lStyle.AddFilterName("BuildTextFilter");                          //设置文字构建器符号为BuildTextFilter，必须为BuildGeometryFilter字符串
      /////////////////////此部分是文字在场景中显示的配置/////////////////

      /////////////////////此部分是点在场景中显示的配置/////////////////
      lStyle.SetName("Line");                                           //设置别名point
      lStyle.AddSymbol("LineSymbol", lSymbol.GetConfig());              //将符号配置添加到该样式
      lStyle.AddFilterName("BuildGeometryFilter");                      //设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
      /////////////////////此部分是点在场景中显示的配置/////////////////

      var tlo = map.CreateLayerOptions("wfs");                          //创建图层配置对象，名称任意
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");    //创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom");                    //数据源类型,代表fmgeom插件，必须是此键值对

      //////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////
      tlo.AddConfig("Url", wfsUrl);                                     //数据存放位置，此为网络路径，在浏览器中查看，
      tlo.AddConfig("FeatureSourceType", "wfs");                        //要素数据源类型，针对wfs数据源wfs
      tlo.AddConfig("LayerName", layeName);                             //wfs图层名称，可通过图层信息获取接口获得到
      //////////////////////////////////////此部分有别于OGR数据源///////////////////////////////////////////////////

      tlo.AddConfig("TileSizeFactor", "1.0");                           //瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "50000");                               //瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "5");                                     //抬升高度，任意值
			tlo.AddConfig("MaxRange", "1000000");                             //最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0");                                   //最小显示范围，0-无穷大

    	var styleSheet = map.CreateStyleSheet();                          //创建样式表
      styleSheet.AddStyle(lStyle.GetConfig());                          //将样式配置添加至样式表
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig());              //将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

      var wfshpLayer = map.CreateLayer("FeatureModelLayer", tlo);       //创建矢量图层，第一项参数必须为FeatureModelLayer
      map.AddLayer(wfshpLayer);                                         //添加矢量图层
      // wfshpLayer.Locate();                                           //模型图层定位*/
      return wfshpLayer;
		},
		/*加载WMS服务*/
		"loadWMS":function(url,layerName,rectangle,version,srs){

 			var tlo = map.CreateLayerOptions("wms"); 	                        // 创建wms图层，给配置起个名称，任意名称
      tlo.AddConfig("LayerOptionsName", "ImageLayerOptions");           // 创建配置类型, ImageLayerOptions代表影像数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "wms");                       // 数据源类型,代表WMS插件，必须是此键值对
      tlo.AddConfig("Driver", "terrainquadtree");                       // 代表地形驱动，必须是此键值对
      tlo.AddConfig("Transparent", "true");                             //设置请求的数据透明通道是否透明
      tlo.AddConfig("TileSize", "256");                                 //数据的瓦片大小，建议设置大小为256
      tlo.AddConfig("MinLevel", "0");                                   //数据显示的最小层级
      tlo.AddConfig("MaxLevel", "19");                                  //数据显示的最大层级

      //////////////以下部分可以通过图层信息获取获得相应的配置////////////
			tlo.AddConfig("Url", url);                                        //要加载的数据服务路径
      tlo.AddConfig("LayerName",layerName);                             //图层名称
      tlo.AddConfig("Style", "default");                                //样式
      tlo.AddConfig("ImageFormat", "image/png");                        //Image的格式
      tlo.AddConfig("WmsVersion", version);                             //WMS服务版本号
      tlo.AddConfig("Srs", srs);                                        //数据的坐标参考

      //////此部分可以不配置，数据照样可以加载，但图层定位会有问题///////
      tlo.AddConfig("MaxX", rectangle[2]);                              //数据的范围X向最大值
      tlo.AddConfig("MinX", rectangle[0]);                              //数据的范围X向最小值
      tlo.AddConfig("MaxY", rectangle[3]);                              //数据的范围Y向最大值
      tlo.AddConfig("MinY", rectangle[1]);                              //数据的范围Y向最小值

     var wmslayer = map.CreateLayer("ImageLayer", tlo);                 //创建WMS图层，第一项参数必须为ImageLayer
      map.AddLayer(wmslayer);                                           //添加WMS图层
      //wmslayer.Locate();                                              //WMS图层定位
      return wmslayer;
		},
		"videoPlay":function(videoSource,Points){
			//var Points = "120.2163206250898,30.21108905740757,15.72113596089184;120.2164263470019,30.21093101099925,5.075216918252409;";
		  var mlo = map.CreateLayerOptions("Video");                 //服务器上存放模型数据的文件夹名称
      mlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions"); // 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
      mlo.AddConfig("DataSourceTypeName", "as_videoprj");
      mlo.AddConfig("CameraCountMax", "1");
      mlo.AddConfig("HAngles", "50;");                           //视域水平方向夹角
    	//     mlo.AddConfig("Scales", "1.738;");                  //视域水平比例;
      mlo.AddConfig("Scales", "1.238;");                         //视域水平比例;
	    mlo.AddConfig("VideoResources", videoSource);
      mlo.AddConfig("IsLoad", "true");
      mlo.AddConfig("Points", Points);

      var videoLayer = map.CreateLayer("AnalysisLayer", mlo);
      map.AddLayer(videoLayer);
      return videoLayer;
		},
		"loadOSGB":function(basePath,url,srcOrigin){
			var tlo = map.CreateLayerOptions("osgbs"); 	// 创建osgbs图层配置，给配置起个名称，任意名称
      tlo.AddConfig("LayerOptionsName", "ModelLayerOptions"); // 创建配置类型, ModelLayerOptions代表模型数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "smeshs"); // 数据源类型,代表SMESHS插件，必须是此键值对
			tlo.AddConfig("Compress", "true");

      //////////////以下部分可以通过图层信息获取获得相应的配置////////////
      tlo.AddConfig("Url", basePath+"/"+url); /////要加载的数据路径
      //tlo.AddConfig("Srs", "PROJCS[\"Transverse_Mercator\",GEOGCS[\"Geographic Coordinate System\",DATUM[\"WGS84\",SPHEROID[\"WGS84\",6378137,298.257223560493]],PRIMEM[\"Greenwich\",0],UNIT[\"degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"scale_factor\",1],PARAMETER[\"central_meridian\",120],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"Meter\",1]]"); /////数据的坐标参考
      tlo.AddConfig("Srs","EPSG:4549");
      tlo.AddConfig("OriginPoint", srcOrigin); /////数据的坐标偏移值
      tlo.AddConfig("BasePath", basePath); /////层级数据的路径，最后面没有斜线
      var osgsblayer = map.CreateLayer("ModelLayer", tlo); ////创建倾斜摄影图层，第一项参数必须为ModelLayer
      map.AddLayer(osgsblayer); ///添加倾斜摄影图层
      osgsblayer.Locate(); ////倾斜摄影图层定位
      return osgsblayer;
		},
		/*获取播放路径关键点*/
		"CalcBuffer":function(pos,keyPos){
			/*jshint maxcomplexity:2 */
			var buffer = 0.5;
			var mPos = pos.split(',');
			var tmp = keyPos.substring(0, keyPos.length - 1);
			var mKeyPos = tmp.split(',');

			var dis = (mPos[0] * 1 - mKeyPos[0] * 1) * 
				(mPos[0] * 1 - mKeyPos[0] * 1) + (mPos[1] * 1 - mKeyPos[1]) * 
				(mPos[1] * 1 - mKeyPos[1]) + (mPos[2] * 1 - mKeyPos[2]) * 
				(mPos[2] * 1 - mKeyPos[2]);
		  if(dis < buffer * buffer){
		    return true;
			}
		  return false;
		},
		/*检查现在位置是否是目标点*/
		"checkPosi":function(currentPosi,targetPosi){
			/*jshint maxcomplexity:2 */
			var buffer = 13;
			var mPos = currentPosi.split(',');
			var positions = targetPosi.split(',');
			var mKeyPos = map.CreatePosition(positions[0],positions[1],positions[2]);//获取点对象
			var convert = translate.ConvertLongLatHeightToXYZ(mKeyPos);
			var dis = (mPos[0] * 1 - convert.GetX() * 1) * 
				(mPos[0] * 1 - convert.GetX() * 1) + (mPos[1] * 1 - convert.GetY()) * 
				(mPos[1] * 1 - convert.GetY()) + (mPos[2] * 1 - convert.GetZ()) * 
				(mPos[2] * 1 - convert.GetZ());
		  if(dis < buffer * buffer){
		    return true;
		  }
		  return false;
		},
		/*添加罗盘响应器*/
		"addCompass":function(){
			var resp = map.CreateResponserOptions("UICompassResponser");
	    /* 设置罗盘响应器显隐状态。特别注意，罗盘响应器因为内部的关系，已经默认创建，
	     * 外部需要通过更新配置接口设置显隐状态，而不是通过添加的方式
	     */
      resp.AddConfig("Visible", "true");
      // 创建罗盘响应器，必须为UICompassResponser
      var resCompass = map.CreateResponser("UICompassResponser", resp); 
      // 当前罗盘位置偏移X坐标,右为正
      resp.AddConfig("TransX", "-7"); 
      // 当前罗盘位置偏移y坐标,上为正
      resp.AddConfig("TransY", "-40");
      // 更新罗盘响应器配置，这里必须这么处理
      resCompass.UpdateResponserOptions(resp); 
      return resp;
		},
		"deleteCompass":function(resp){
			resp.AddConfig("Visible", "false");
			var resCompass = map.CreateResponser("UICompassResponser", resp); /////创建罗盘响应器，必须为UICompassResponser
      resCompass.UpdateResponserOptions(resp); /////更新罗盘响应器配置，这里必须这么处理
		},
		//动态模型
		"createModelLabelLayer":function(shpUrl,modelUrl){
			var pSymbol = map.CreateSymbol("PointSymbol"); ////创建类型为PointSymbol的符号，必须为PointSymbol字符串
      pSymbol.AddConfig("Size", "1"); ////点大小，范围0-10
      pSymbol.AddConfig("Color", "1.0,1.0,0.0,0"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      var tSymbol = map.CreateSymbol("ModelSymbol"); ////创建类型为ModelSymbol的符号，必须为ModelSymbol字符串
    	tSymbol.AddConfig("Heading", "0");  	//绕Z轴(世界坐标系方向相同 far->near)旋转,从far(-Z)向near(+Z)看去,逆时针为正，弧度表示
    	tSymbol.AddConfig("Pitch", "[Pitch]");  //绕Y轴(世界坐标系方向相同 down(-Y)向up(Y))旋转,从down(-Y)向up(+Y)看去,逆时针为正，弧度表示
    	tSymbol.AddConfig("Roll", "0"); 		//绕X轴(世界坐标系方向相同 left->right)旋转,从left(-X)向right(+X)看去,逆时针为正，弧度表示

    	tSymbol.AddConfig("XScale", "[XScale]"); 		//模型x方向放大比例
    	tSymbol.AddConfig("YScale", "[YScale]"); 		//模型y方向放大比例
    	tSymbol.AddConfig("ZScale", "[ZScale]"); 		//模型z方向放大比例
    	tSymbol.AddConfig("IsAddGroundLine", "0"); ////是否开启接地线
 	    tSymbol.AddConfig("ModelOriginDir", "0,0,1"); ////模型原始轴向
 	    tSymbol.AddConfig("Url", modelUrl); ////模型资源路径
 	    tSymbol.AddConfig("LibraryName", "reslib"); ////资源名称

 	    var res = map.CreateResource("ModelSymbol"); ////创建模型资源，此处必须为ModelSymbol
 	    res.AddConfig("Uri", modelUrl); ////模型资源路径
 	    var reslib = map.CreateResourceLibrary("reslib"); ////创建资源库，名称和图层配置LibraryName设置的名称对应
      reslib.AddResource(res); ////将资源添加至资源库
      var pStyle = map.CreateStyle("Point"); ////创建名称为Point的样式，名称任意
      pStyle.SetName("point"); ////设置别名point
      //pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); ////将点符号配置添加到该样式
     //pStyle.AddFilterName("BuildGeometryFilter"); //设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
      pStyle.AddSymbol("ModelSymbol", tSymbol.GetConfig()); ////将符号配置添加到该样式，第一参必须为ModelSymbol字符串
      pStyle.AddFilterName("SubstituteModelFilter"); ////设置构建器符号为SubstituteModelFilter，必须为SubstituteModelFilter字符串，此为图标符号化和模型符号化共有

      var styleSheet = map.CreateStyleSheet(); ////创建样式表
      styleSheet.AddStyle(pStyle.GetConfig()); ////将样式配置添加至样式表
      styleSheet.AddResLib(reslib.GetConfig()); ////将资源库添加至样式表

      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", shpUrl); ////初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("Fields", "Name:String:100:0,XScale:Float:100:4,YScale:Float:100:4,ZScale:Float:100:4,Pitch:Float:100:4,lon:String:100:0,lat:String:100:0,height:String:100:0"); ////创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("GeometryType", "Point"); ////几何类型     Point为点 Polyline为线 Polygon为面 此项配置不能少或字符串一定不能错误，否则保存文件不成功
    	tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
    	tlo.AddConfig("TileSize", "0"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
    	tlo.AddConfig("LiftUp", "0"); ////抬升高度，任意值
   	 	tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
    	tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      /* 
                            调度优先级 = priority * PriorityScale + PriorityOffset;
                            其中priority由vp根据PagedNode结点的范围(minExtent, maxExtent)、其距离视点的距离、
        LOD层级mLODScale计算得到， 调度优先级越大，优先调度并显示 
       */
      // 结点调度优先级的缩放值PriorityScale,默认为1
      tlo.AddConfig("PriorityScale","1.0");
      // 结点调度优先级的偏移值PriorityOffset,
      tlo.AddConfig("PriorityOffset","10.0");
    	var shpLayer = map.CreateLayer("FeatureModelLayer", tlo);
    	map.AddLayer(shpLayer);
    	var id = shpLayer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
   		return shpLayer;
		},
		"addModelLabel":function(layer,opt){
			this.opt = opt;
			var modelID = this.opt.modelName || "default";
			var xScale = this.opt.xScale || 1;
			var yScale = this.opt.yScale || 1;
			var zScale = this.opt.zScale || 1;
			var pitch = this.opt.pitch || 0;
			var Lon = this.opt.lon;
			var Lat = this.opt.lat;
			var Height = this.opt.height;
			var id = layer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
      var addFeature = map.CreateFeature();								//创建要素对象								//设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    addFeature.SetGeometryType(1);
      addFeature.AddPoint(Lon, Lat, Height);
      addFeature.AddAttribute("Name", modelID, 5);
      addFeature.AddAttribute("XScale", xScale, 3);					//添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
	   	addFeature.AddAttribute("YScale", yScale, 3);					//添加属性值
	    addFeature.AddAttribute("ZScale", zScale, 3);					//添加属性值
	    addFeature.AddAttribute("Pitch", pitch, 3);				//添加属性值
	    addFeature.AddAttribute("lon", Lon, 5);
      addFeature.AddAttribute("lat", Lat, 5);					//添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
	   	addFeature.AddAttribute("height", Height, 5);
      var featureId = editLayer.GetMaxFeatureID();					//获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						//设置FeatureID
			editLayer.AddFeature(addFeature);
			return addFeature;
		},
		//更新模型标注
		"updateModelLabel":function(opt){
			this.opt=opt;
			var OldLabel = this.opt.oldLabel;
			var NewLayer = this.opt.newLayer;
			var ModelID = this.opt.modelId;
			var XScale = this.opt.xScale || 1;
			var YScale = this.opt.yScale || 1;
			var ZScale = this.opt.zScale || 1;
			var Pitch = this.opt.pitch || 3;
			var Lon = this.opt.lon;
			var Lat = this.opt.lat;
			var Height = this.opt.height;

      var id = NewLayer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
      var addFeature = map.CreateFeature();								//创建要素对象								//设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)----注:多结构的时候,三维场景会爆机
	    addFeature.SetGeometryType(1);
      addFeature.AddPoint(Lon, Lat, Height);
      addFeature.AddAttribute("Name", ModelID, 5);
      addFeature.AddAttribute("XScale", XScale, 3);					//添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
	   	addFeature.AddAttribute("YScale", YScale, 3);					//添加属性值
	    addFeature.AddAttribute("ZScale", ZScale, 3);					//添加属性值
	    addFeature.AddAttribute("Pitch", Pitch, 3);				//添加属性值
	    addFeature.AddAttribute("lon", Lon, 5);
      addFeature.AddAttribute("lat", Lat, 5);					//添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
	   	addFeature.AddAttribute("height", Height, 5);
      var featureId = editLayer.GetMaxFeatureID();					//获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						//设置FeatureID
			editLayer.UpdateFeatureByNew(OldLabel, addFeature);
			return addFeature;
		},
		/**
		 * 根据要素id删除要素
		 * @method deleteModelById
		 * @author jg
		 * @param  { Object } feature 待删除的要素
		 * @param  { Object } layer   要素所在的图层
		 * @return { null }
		 * @version v6.0.7
		 */
		"deleteModelById":function(opt){
			this.opt = opt;
			var Feature = this.opt.feature;
			var Layer = this.opt.layer;
			var id = Layer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
			// 创建要素对象
			var addFeature = map.CreateFeature();
			// addFeature若为NULL则为删除id为某值的要素
			editLayer.UpdateFeatureById(Feature.GetFeatureId(), addFeature);
		},
		/**
		 * 创建模型拾取
		 * @method createModelPick
		 * @author jg
		 * @param  { Array } layer 待拾取要素所在的图层
		 * @return { Object } 响应器对象
		 * @version v6.0.6
		 */
		"createModelPick":function(layer){
			var lay = "";
			for(var i = 0;i<layer.length;i++){
				lay += layer[i].getlayerid() + ",";
  		}
 			var la = lay.substring(0, lay.length -1);
			var pOption = map.CreateResponserOptions("123"); 				//创建响应器配置，参数任意名称
      pOption.AddConfig("PickLayerIdList", la);//拾取图层id
      pOption.AddConfig("PickColor", "1.0,0,0,1.0");
      pOption.AddConfig("IsChangeColor", "true");
      var pickResp = map.CreateResponser("PickVectorResponser", pOption); //创建矢量拾取响应器，第一参必须为PickVectorResponser字符串
      pickResp.AddObserver();
      map.AddResponser(pickResp);
      return pickResp;
		},
		"destroyModelPick":function(layer){
			//map.RemoveLayer(layer);
		  map.RemoveResponser("PickVectorResponser");
		},
		"getModelValue":function(layer){
			 var content = layer.GetResponserResult();//此处的layer是创建标注拾取响应器返回的layer
		   var modelId = content.GetConfigValueByKey("name");//获取模型的id信息（人为自定义）
		   var points = content.GetConfigValueByKey("lon")+","+content.GetConfigValueByKey("lat")+","+content.GetConfigValueByKey("height");//获取模型的id信息（人为自定义）
		   var result = {
		   	 modelId:modelId,
		   	 points:points
		   }
		   return result;
		},
		//模型拾取后删除
		"deleteMByPick":function(layer){
			var lay = "";
	  		for(var i = 0;i<layer.length;i++){
			  lay += layer[i].getlayerid() + ",";
			}
	 		var la = lay.substring(0, lay.length -1).split(",");
	 		for(var j = 0;j<la.length;j++){
	      var pointeditLayer = map.GetFeatureModelLayer(la[j]); ////获取矢量图层
				pointeditLayer.DeleteFeature();
	 		}
		},
		//通过坐标删除要素
		"deleteModel":function(layer,lon,lat,height){
			var id = layer.GetLayerID(); ////获取图层id
      var pointeditLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
			pointeditLayer.DeleteFeatureByGeoPos(lon,lat,height);
		},
		//通过坐标对模型标注进行高亮显示
		"heightModel":function(layer,lon,lat,height){
  		var tlo = map.CreateOperationOptions("123"); //创建配置类型,操作类型的配置
			tlo.AddConfig("OptionsTypeName", "FeatureIntersectOption");
      tlo.AddConfig("Operation", "GetFeature");
			tlo.AddConfig("FaultTolerant", "1");			// 是否启用容差模式
			tlo.AddConfig("FaultTolerantValue", "1");		// 容差大小
			tlo.AddConfig("Lon", lon);
			tlo.AddConfig("Lat", lat);
			tlo.AddConfig("Height", height);
			tlo.AddConfig("HightLight", "1");
			tlo.AddConfig("LayersID", layer.GetLayerID());
			var operateHeightPtr = map.CreateOperation("FeatureIntersectOperation", tlo); //根据配置创建模型调整操作
			operateHeightPtr.AddObserver();
      map.AddOperation(operateHeightPtr);
      heightObj[lon+","+lat+","+height] = operateHeightPtr;
		},
		//清除根据坐标高亮
		"clearHeightModel":function(lon,lat,height){
 			map.RemoveOperation(heightObj[lon+","+lat+","+height]);
		},
		//模型保存
		"saveModelFile":function(layer){
			var id = layer.GetLayerID(); ////获取图层id
      var pointeditLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
			pointeditLayer.SaveLayer(); ////编辑面图层保存，一般用于首次创建保存
		},
		/*已知坐标拉体块*/
		"createBlocklayer":function(Extrusion,color){
			////////墙体颜色配置
      var wallpolygonSymbol = map.CreateSymbol("PolygonSymbol"); ////创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      wallpolygonSymbol.AddConfig("Color", color); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      ////////屋顶颜色配置
      var roofpolygonSymbol = map.CreateSymbol("PolygonSymbol"); ////创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      roofpolygonSymbol.AddConfig("Color", color); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      var extruSymbol = map.CreateSymbol("PolygonExtrusionSymbol"); ////创建类型为PolygonExtrusionSymbol的符号,为面挤出符号，必须为PolygonExtrusionSymbol字符串
      extruSymbol.AddConfig("HeightExpression", String(Extrusion)); ////挤出面的高度，可以直接传值，也可以[]中设置相应的属性字段，会根据属性字段进行拉伸高度

      /////创建墙体样式，并添加墙体面符号
      var pwallStyle = map.CreateStyle("WallPolygonStyle"); ////创建名称为"WallPolygonStyle的样式，名称任意
      pwallStyle.AddSymbol("PolygonSymbol", wallpolygonSymbol.GetConfig()); ////将Wall面符号配置添加到该样式，第一参必须为PolygonSymbol字符串

      /////创建屋顶样式，并添加屋顶面符号
      var proofStyle = map.CreateStyle("RoofPolygonStyle"); ////创建名称为"RoofPolygonStyle的样式，名称任意
      proofStyle.AddSymbol("PolygonSymbol",roofpolygonSymbol.GetConfig()); ////将Roof面符号配置添加到该样式，第一参必须为PolygonSymbol字符串

      extruSymbol.AddConfig("WallStyleName", "WallPolygonStyle"); ////拉伸体块墙体颜色，通过此关键字WallStyleName关联墙体面符号，第二参必须与墙体面符号所在样式名称一致
      extruSymbol.AddConfig("RoofStyleName", "RoofPolygonStyle"); ////拉伸体块屋顶颜色，通过此关键字RoofStyleName关联屋顶面符号，第二参必须与屋顶面符号所在样式名称一致

      var eStyle = map.CreateStyle("ExtruStyle"); ////创建名称为ExtruStyle的样式，名称任意
      eStyle.AddSymbol("PolygonExtrusionSymbol", extruSymbol.GetConfig()); ////将面挤出符号配置添加到该样式，第一参必须为PolygonExtrusionSymbol字符串
      eStyle.AddFilterName("ExtrudeGeometryFilter"); ////设置挤出构建器符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串

      var styleSheet = map.CreateStyleSheet(); ////创建样式表
      styleSheet.AddStyle(pwallStyle.GetConfig()); ////将墙体样式配置添加至样式表
      styleSheet.AddStyle(proofStyle.GetConfig()); ////将屋顶样式配置添加至样式表
      styleSheet.AddStyle(eStyle.GetConfig()); ////将挤出面样式配置添加至样式表

      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象，名称任意
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", "C:\\test.shp"); ////数据存放位置，注意双斜杠
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0.0"); ////抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
			tlo.AddConfig("BuildSpatialIndex","true");
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

      var exshpLayer = map.CreateLayer("FeatureModelLayer", tlo); ////创建矢量图层，第一项参数必须为FeatureModelLayer
      map.AddLayer(exshpLayer); ////添加矢量图层
	 		return exshpLayer;
		},
		"addBlock":function(layer,arr){
			var id = layer.GetLayerID(); ////获取图层id
      var polygoneditLayer = map.GetFeatureModelLayer(id); ////获取矢量图层

      var addFeature = map.CreateFeature();								//创建要素对象
			addFeature.SetGeometryType(4);									//设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)

			for(var i = 0;i<arr.length;i++){
			addFeature.AddPoint(arr[i].split(",")[0],arr[i].split(",")[1],arr[i].split(",")[2]);////向编辑图层添加坐标点信息
			}
			var featureId = polygoneditLayer.GetMaxFeatureID();					//获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						//设置FeatureID
			polygoneditLayer.AddFeature(addFeature);
		},
		"deleteBlock":function(layer,arr){
			var id = layer.GetLayerID(); ////获取图层id
      var polygoneditLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
			polygoneditLayer.DeleteFeatureByGeoPos(arr[0].split(",")[0],arr[0].split(",")[1],arr[0].split(",")[2]);
		},
		/*手动添加坐标拉体块*/
		"createBlock_old":function(url,Extrusion){
			////////墙体颜色配置
      var wallpolygonSymbol = map.CreateSymbol("PolygonSymbol"); ////创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      wallpolygonSymbol.AddConfig("Color", "1.0, 0.0, 0.0, 1"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      ////////屋顶颜色配置
      var roofpolygonSymbol = map.CreateSymbol("PolygonSymbol"); ////创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      roofpolygonSymbol.AddConfig("Color", "1.0, 0.0, 0.0, 1"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      var extruSymbol = map.CreateSymbol("PolygonExtrusionSymbol"); ////创建类型为PolygonExtrusionSymbol的符号,为面挤出符号，必须为PolygonExtrusionSymbol字符串
      extruSymbol.AddConfig("HeightExpression", "50"); ////挤出面的高度，可以直接传值，也可以[]中设置相应的属性字段，会根据属性字段进行拉伸高度

      /////创建墙体样式，并添加墙体面符号
      var pwallStyle = map.CreateStyle("WallPolygonStyle"); ////创建名称为"WallPolygonStyle的样式，名称任意
      pwallStyle.AddSymbol("PolygonSymbol", wallpolygonSymbol.GetConfig()); ////将Wall面符号配置添加到该样式，第一参必须为PolygonSymbol字符串

      /////创建屋顶样式，并添加屋顶面符号
      var proofStyle = map.CreateStyle("RoofPolygonStyle"); ////创建名称为"RoofPolygonStyle的样式，名称任意
      proofStyle.AddSymbol("PolygonSymbol",roofpolygonSymbol.GetConfig()); ////将Roof面符号配置添加到该样式，第一参必须为PolygonSymbol字符串

      extruSymbol.AddConfig("WallStyleName", "WallPolygonStyle"); ////拉伸体块墙体颜色，通过此关键字WallStyleName关联墙体面符号，第二参必须与墙体面符号所在样式名称一致
      extruSymbol.AddConfig("RoofStyleName", "RoofPolygonStyle"); ////拉伸体块屋顶颜色，通过此关键字RoofStyleName关联屋顶面符号，第二参必须与屋顶面符号所在样式名称一致

      var eStyle = map.CreateStyle("ExtruStyle"); ////创建名称为ExtruStyle的样式，名称任意
      eStyle.AddSymbol("PolygonExtrusionSymbol", extruSymbol.GetConfig()); ////将面挤出符号配置添加到该样式，第一参必须为PolygonExtrusionSymbol字符串
      eStyle.AddFilterName("ExtrudeGeometryFilter"); ////设置挤出构建器符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串

      var styleSheet = map.CreateStyleSheet(); ////创建样式表
      styleSheet.AddStyle(pwallStyle.GetConfig()); ////将墙体样式配置添加至样式表
      styleSheet.AddStyle(proofStyle.GetConfig()); ////将屋顶样式配置添加至样式表
      styleSheet.AddStyle(eStyle.GetConfig()); ////将挤出面样式配置添加至样式表

      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象，名称任意
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Url", url); ////数据存放位置，注意双斜杠
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0.0"); ////抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
			tlo.AddConfig("BuildSpatialIndex","true");
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

      var exshpLayer = map.CreateLayer("FeatureModelLayer", tlo); ////创建矢量图层，第一项参数必须为FeatureModelLayer
      map.AddLayer(exshpLayer); ////添加矢量图层

      var id = exshpLayer.GetLayerID(); ////获取图层id
      var polygoneditLayer = map.GetFeatureModelLayer(id); ////获取矢量图层

      var addFeature = map.CreateFeature();								//创建要素对象
			addFeature.SetGeometryType(4);									//设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)

		/*鼠标绘制多边形并触发事件然后保存坐标*/
			var mlo3 = map.CreateLayerOptions("draw2dcircle");
      mlo3.AddConfig("LayerOptionsName", "AnalysisLayerOptions");///2D对象绘制必须设置为Draw2DObjectOptions
      mlo3.AddConfig("DataSourceTypeName", "as_draw2dobject");
	    mlo3.AddConfig("IsImmediateMode", "true");
	    mlo3.AddConfig("PointColor", "1, 0.8, 0.6,0.6");//点的颜色
	    mlo3.AddConfig("PointSize", "0");//点的大小
	    mlo3.AddConfig("DrawLineColor", "1,0.2,0,1");//绘制图形外边框颜色
	    mlo3.AddConfig("DrawFaceColor", "1,0.8,0.8,0.6");//绘制图形填充的颜色
	    mlo3.AddConfig("LiftUp", "0");//抬高高度
	    mlo3.AddConfig("VisiableLine", "true");//是否显示外边框
	    mlo3.AddConfig("VisiableFace", "true");//是否显示填充面
	    mlo3.AddConfig("SplitPointNum", "40");
	    mlo3.AddConfig("DrawType", "2");//绘制矩形

	    var Draw2DObjectLayer = map.CreateLayer("AnalysisLayer", mlo3);
	    Draw2DObjectLayer.AddObserver();
	    map.AddLayer(Draw2DObjectLayer);

	    var layermap = new Array();
	    layermap[Draw2DObjectLayer.GetLayerID()] = Draw2DObjectLayer;
	    content3d.attachEvent("FireOnLayerNotify", function(layerid,type){
				var layer = layermap[layerid];
			  var opt = layer.GetLayerResult();
        if(opt.GetConfigValueByKey("DataSourceTypeName") == "as_draw2dobject"){
          var points = opt.GetConfigValueByKey("Points");
          alert(points);
          map.RemoveLayer(Draw2DObjectLayer);
          var tt = points.substring(0,points.length-1).split(";");
					for(var i = 0;i<tt.length;i++){
						//alert(tt[i].split(",")[0]+","+tt[i].split(",")[1]+","+tt[i].split(",")[2]);
						//addFeature.AddPoint(tt[i].split(",")[0],tt[i].split(",")[1],tt[i].split(",")[2]);////向编辑图层添加坐标点信息
						addFeature.AddPoint(tt[i].split(",")[0],tt[i].split(",")[1],tt[i].split(",")[2]);////向编辑图层添加坐标点信息
					}
						var featureId = polygoneditLayer.GetMaxFeatureID();					//获取矢量图层要素最大ID
						addFeature.SetFeatureId(featureId + 1); 						//设置FeatureID
						polygoneditLayer.AddFeature(addFeature);
			  }
		  });
  		return polygoneditLayer;
		},
		//体块保存
		"saveBlock":function(layer){
			layer.SaveLayer();
		},
		//体块拾取
		"blockPick":function(layer){
			var pOption = map.CreateResponserOptions("123"); 				//创建响应器配置，参数任意名称
      pOption.AddConfig("PickLayerIdList", layer.GetLayerID());//拾取图层id
      pOption.AddConfig("PickColor", "1.0,0,0,1.0");
      pOption.AddConfig("IsChangeColor", "true");
      var pickResp = map.CreateResponser("PickVectorResponser", pOption); //创建矢量拾取响应器，第一参必须为PickVectorResponser字符串
      pickResp.AddObserver();
      map.AddResponser(pickResp);
      return pickResp;
		},
		//取消体块拾取
		"cancelBlockPick":function(){
			map.RemoveResponser("PickVectorResponser");
		},
			//创建一个气泡图层
		"createTipLayer":function(){
			var SDKpath = content3d.GetSDKPath();
			var path = SDKpath.substring(0, SDKpath.length - 4).replace(/\\/g, "\\\\");
			var pSymbol = map.CreateSymbol("PointSymbol"); ////创建类型为PointSymbol的符号，必须为PointSymbol字符串
      pSymbol.AddConfig("Size", "10"); ////点大小，范围0-10
      pSymbol.AddConfig("Color", "1.0,1.0,0.0,0.0"); ////颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透

      /////////////////////此部分是文字在场景中显示的配置/////////////////
      var tSymbol = map.CreateSymbol("TextSymbol"); ////创建类型为TextSymbol的符号，必须为TextSymbol字符串
      tSymbol.AddConfig("FillingColor", "0.17, 0.15, 0.15, 1.0"); ////文字颜色（RGBA），颜色值0-1，最后一位代表透明度，0为透明，1为不透
      tSymbol.AddConfig("Font", "C:\\WINDOWS\\Fonts\\msyh.ttf"); ////文字字体，从系统字体目录中取，字体文件必须存在，配置一些参数时，如果没生效可能与字体文件相关，例如中文
      tSymbol.AddConfig("Size", "40"); ////字体精度大小
      tSymbol.AddConfig("CharacterSize", "3"); ////文字大小
      tSymbol.AddConfig("CharacterMode", "0"); ////字符大小变化模式，0：随对象变化显示，1:随相机远近变化，2：随相机远近变化，同时不超过上限值
      tSymbol.AddConfig("AlignmentMode", "4"); ////设置文字位于要素的位置
      tSymbol.AddConfig("AxisAlignment", "6"); ////设置文字旋转模式0 - 7 ， 6: 自动
      tSymbol.AddConfig("RemoveDuplicateLabels", "false"); ////是否移除重复的多重标注
      tSymbol.AddConfig("IsEmbolden", "false"); ////是否加粗
      tSymbol.AddConfig("IsTransform", "false"); ////是否斜体
      tSymbol.AddConfig("IsUnderline", "false"); ////是否加下划线
      tSymbol.AddConfig("IsBack", "true"); ////是否有背景
      //tSymbol.AddConfig("BackColor", "0.88,0.87,0.76,1"); ////设置文字背景色
      tSymbol.AddConfig("LineColor", "1.0,1.0,1.0,0"); ////接地线颜色
      tSymbol.AddConfig("IsAddGroundLine", "1"); ////是否开启接地线
      tSymbol.AddConfig("Content", "[Name]"); ////[]里代表矢量的某字段名称

      //***********如果需要配置背景图片，则需要添加图片资源库*********/
      tSymbol.AddConfig("ImageURL", path+"data\\\\image\\\\bg3.png"); //背景图片地址
      tSymbol.AddConfig("LibraryName", "Library"); 			//设置资源库名称
      tSymbol.AddConfig("BackdropMarginLeft", "6.0"); 		//背景边框左边大小
      tSymbol.AddConfig("BackdropMarginRight", "8.0"); 		//背景边框右边大小
      tSymbol.AddConfig("BackdropMarginUp", "6.0"); 			//背景边框上边大小
      tSymbol.AddConfig("BackdropMarginDown", "8.0"); 		//背景边框下边大小
		//*图片资源库配置信息*/
			var res = map.CreateResource("TextSymbol"); ////创建图标资源，此处必须为TextSymbol
      res.AddConfig("Uri", path+"data\\\\image\\\\bg3.png"); ////图标资源路径
      var reslib = map.CreateResourceLibrary("Library"); ////创建资源库，名称和图层配置LibraryName设置的名称对应
      reslib.AddResource(res); ////将资源添加至资源库

      var pStyle = map.CreateStyle("Point"); 					//创建名称为Point的样式，名称任意
      pStyle.AddSymbol("TextSymbol", tSymbol.GetConfig()); 	//将符号配置添加到该样式，第一参必须为TextSymbol字符串
      pStyle.AddFilterName("BuildTextFilter"); 				//设置文字构建器符号为BuildTextFilter，必须为BuildGeometryFilter字符串
      /////////////////////此部分是文字在场景中显示的配置/////////////////

      /////////////////////此部分是点在场景中显示的配置/////////////////
      pStyle.SetName("point"); 								//设置别名point
      pStyle.AddSymbol("PointSymbol", pSymbol.GetConfig()); 	//将符号配置添加到该样式
      pStyle.AddFilterName("BuildGeometryFilter");  			//设置构建器符号为BuildGeometryFilter，必须为BuildGeometryFilter字符串
      /////////////////////此部分是点在场景中显示的配置/////////////////

      var styleSheet = map.CreateStyleSheet(); 				//创建样式表
      styleSheet.AddStyle(pStyle.GetConfig()); 				//将样式配置添加至样式表
      styleSheet.AddResLib(reslib.GetConfig()); ////将资源库添加至样式表

      var tlo = map.CreateLayerOptions("shp"); ////创建图层配置对象
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); ////创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); ////数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Ddfriver", "ESRI Shapefile"); ////数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      //tlo.AddConfig("Url", "F:\\zhumh\\testPoint.shp"); ////初次创建需选择没有数据的目录，其在保存后会自动生成。当前设置的路径为不存在
      tlo.AddConfig("FeatureSourceType", "ogr"); ////要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("Fields", "Name:String:100:0,Height:Double:100:3,Width:Float:100:3"); ////创建矢量的属性字段，属性名：属性类型：类型长度：小数点后几位
      tlo.AddConfig("GeometryType", "Point"); ////几何类型     Point为点 Polyline为线 Polygon为面 此项配置不能少或字符串一定不能错误，否则保存文件不成功
      tlo.AddConfig("TileSizeFactor", "1.0"); ////瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000"); ////瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0"); ////抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0"); ////最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0"); ////最小显示范围，0-无穷大
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); ////将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

      var shpLayer = map.CreateLayer("FeatureModelLayer", tlo); ////创建矢量图层，第一项参数必须为FeatureModelLayer
      map.AddLayer(shpLayer); ////添加矢量图层
      return shpLayer;
		},
		//添加气泡
		"tip":function(layer,lon,lat,height,name){
      var id = layer.GetLayerID();                      //获取图层id
      var editLayer = map.GetFeatureModelLayer(id);     //获取矢量图层
      var addFeature = map.CreateFeature();							//创建要素对象
			addFeature.SetGeometryType(1);									  //设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)
			addFeature.AddPoint(lon,lat,height);              //向编辑图层添加坐标点信息
			addFeature.AddAttribute("Name", name, 5);			    //添加属性值
			var featureId = editLayer.GetMaxFeatureID();		  //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 				  //设置FeatureID
			editLayer.AddFeature(addFeature);
		},
		"clearTip":function(layer,lon,lat,height){
			var id = layer.GetLayerID();                            //获取图层id
      var polygoneditLayer = map.GetFeatureModelLayer(id);    //获取矢量图层
			polygoneditLayer.DeleteFeatureByGeoPos(lon,lat,height);
		},
		/*漫游模式
	  //设置自定义漫游模式
    //参数1：开启状态
    //参数2：漫游高度，>=0 ,取0为默认设置为当前高度
    //参数3：漫游速度，基准值为1.0，类似步行速度。可根据实际情况增加或减小
    //参数4：漫游俯仰角度，范围-89到-1之间*/
    "createRoamMode":function(opt){
    	this.opt = opt;
    	var Height  =this.opt.height || 10;
    	var Speed = this.opt.speed || 1;
    	var Angle = this.opt.angle || -10;
    	var navagation = map.CreateRoam();
    	navagation.SetCustomGlideRoamMode(true, Height, Speed, Angle);
    },
    "destroyRoamMode":function(){
      var navagation = map.CreateRoam();
      navagation.SetCustomGlideRoamMode(false, 0, 0, 0);  //关闭自定义漫游
    },

    //加载网络C3S格式数据
    "loadC3S":function(url){
    	var tlo = map.CreateLayerOptions("c3s");                     // 创建cpm图层配置，给配置起个名称，任意名称
     	tlo.AddConfig("LayerOptionsName", "ModelLayerOptions");      // 创建配置类型, ModelLayerOptions代表模型数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "c3ss");                 // 数据源类型,代表CPM插件，必须是此键值对
	 		tlo.AddConfig("Compress", 1);
      tlo.AddConfig("Url", url);
    	var c3sLayer = map.CreateLayer("ModelLayer", tlo);           //创建模型图层，第一项参数必须为ModelLayer
    	map.AddLayer(c3sLayer);                                      //添加模型图层
    	return c3sLayer;
    },
    //加载本地C3S数据
    "loadLocalC3S":function(url){
    	var tlo = map.CreateLayerOptions("c3s");                  // 创建cpm图层配置，给配置起个名称，任意名称
     	tlo.AddConfig("LayerOptionsName", "ModelLayerOptions");   // 创建配置类型, ModelLayerOptions代表模型数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "c3s");               // 数据源类型,代表CPM插件，必须是此键值对
	 		//tlo.AddConfig("Compress", 1);
      tlo.AddConfig("Url", url);
    	var c3sLayer = map.CreateLayer("ModelLayer", tlo);        //创建模型图层，第一项参数必须为ModelLayer
    	map.AddLayer(c3sLayer);                                   //添加模型图层
    	return c3sLayer;
    },
    "":function(){

    },
    //全屏
    "fullScreen":function(){
	    content3d.SetFullScreenState(true);
	    var resp = map.CreateResponserOptions("UIFullScreenResponser");
	    var resFullbtn = map.CreateResponser("UIFullScreenResponser", resp); //创建全屏按钮响应器，必须为UIFullScreenResponser
	    map.AddResponser(resFullbtn);
	    return resp;
    },
    //热力图
    "hotMapLayer":function(result){
    	var styleSheet = map.CreateStyleSheet();                                              //创建样式表
      for (var i = 0; i < result.length; i++)                                               //result 存储了很多不同颜色值（RGBA（0-255）），如 var result = new Array(new Array("A33", "120,15,15,70"),new Array("A5", "120,15,15,70"),new Array("B1", "120,15,15,70");
      {
        var tSymbol = map.CreateSymbol("PointExtrusionSymbol");                             //创建类型为ModelSymbol的符号，必须为ModelSymbol字符串
				tSymbol.AddConfig("ExtrudeType", "0");                                              //挤出类型，0-圆 1-方
				tSymbol.AddConfig("Radius", "[Radius]");                                            //半径，单位m
				tSymbol.AddConfig("DrawMode", "2");                                                 //绘制模式，0-正面；1-反面；2-双面
				/////获取不同值的颜色////
        var a1 = new Array(4);
        a1 = result[i][1].split(",");
        var str = a1[0] / 255.0 + ", " + a1[1] / 255.0 + ", " + a1[2] / 255.0 + "," + a1[3];
        /////获取不同值的颜色////
				tSymbol.AddConfig("SurfaceColor", str);                                              //显示颜色
				tSymbol.AddConfig("SplitPointNum", "64");                                            //构成圆定点数
        var pSymbol = map.CreateSymbol("PointSymbol");                                       //创建类型为PointSymbol的符号，必须为PointSymbol字符串
				pSymbol.AddConfig("Size", "5");                                                      //点大小，范围0-10
				pSymbol.AddConfig("Color", "1.0,1.0,0.0,0.0");                                       //颜色值（RGBA）0-1，最后一位代表透明度，0为透明，1为不透
        var tmpStyle = map.CreateStyle(result[i][0]);                                        //创建名称为result[i][0]的样式
        tmpStyle.AddSymbol("PointExtrusionSymbol", tSymbol.GetConfig());                     //将面挤出符号配置添加到该样式，第一参必须为PolygonExtrusionSymbol字符串
        tmpStyle.AddFilterName("ExtrudeGeometryFilter");                                     //设置挤出构建器符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串
        styleSheet.AddStyle(tmpStyle.GetConfig());                                           //将挤出面样式配置添加至样式表
        styleSheet.AddStyleSelector(result[i][0]);                                           //添加样式选择器，其名称必须与创建名称为result[i][0]的样式的名称一致,专题配置必须有此项
      }
      styleSheet.SetStrExpression("[C]");                                                    //专题配置的字段,以此字段中不同的值创建样式，也就是result[i][0]的值就是此字段中不同的值

      var tlo = map.CreateLayerOptions("shp");                                               //创建图层配置对象，名称任意
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions");                         //创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom");                                         //数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("Driver", "ESRI Shapefile");                                             //数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
			tlo.AddConfig("Fields", "Name:String:100:0,Radius:Double:100:3,C:String:100:0");
      tlo.AddConfig("Url", "");                                                              //数据存放位置，注意双斜杠
      tlo.AddConfig("FeatureSourceType", "ogr");                                             //要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("TileSizeFactor", "1.0");                                                //瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSize", "5000");                                                     //瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("LiftUp", "0");                                                          //抬升高度，任意值
      tlo.AddConfig("MaxRange", "1000000.0");                                                //最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MinRange", "0.0");                                                      //最小显示范围，0-无穷大
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig());                                   //将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串

      var themePointLayer = map.CreateLayer("FeatureModelLayer", tlo);                       //创建矢量图层，第一项参数必须为FeatureModelLayer
      map.AddLayer(themePointLayer);                                                         //添加矢量图层
      return themePointLayer;
    },
    "addHotPoint":function(layer,opt){
			/* jshint maxcomplexity:2 */
    	this.opt = opt;
      var Lon = this.opt.lon;
			var Lat = this.opt.lat;
			var Height = this.opt.height;
			var r = this.opt.radius || 0.0;
			var color = this.opt.color;
    	var id = layer.GetLayerID();                         //获取图层id
      var editLayer = map.GetFeatureModelLayer(id);        //获取矢量图层
      var addFeature = map.CreateFeature();								 //创建要素对象
			addFeature.SetGeometryType(1);
			addFeature.AddPoint(Lon,Lat,Height);
	    addFeature.AddAttribute("Radius", r, 4);						 //添加属性值(1:int; 2:long; 3:float; 4:double; 5:string; 6:bool)
	    addFeature.AddAttribute("C", color, 5);
			featureId = editLayer.GetMaxFeatureID();					   //获取矢量图层要素最大ID
			addFeature.SetFeatureId(featureId + 1); 						 //设置FeatureID
			editLayer.AddFeature(addFeature);
    },
    //漫游快捷键配置
		"shortcutKey":function(opt){
			/*jshint maxcomplexity:21 */
			this.opt = opt;
			var WalkOn = this.opt.walkOn || "w";
			var WalkBack = this.opt.walkBack || "s";
			var LeftMove = this.opt.leftMove || "a";
			var RightMove = this.opt.rightMove || "d";
			var TurnLeft = this.opt.turnLeft || "e";
			var TurnRight = this.opt.turnRight || "q";
			var RotateUp = this.opt.rotateUp || "y";
			var RotateDown = this.opt.rotateDown || "h";
			var HeightUp = this.opt.heightUp || "t";
			var HeightDown = this.opt.heightDown || "g";
			var InGround = this.opt.inGround || "1";
			var OutGround = this.opt.outGround || "2";
			var InDoor = this.opt.inDoor || "3";
			var OutDoor = this.opt.outDoor || "4";
			var InUnderGround = this.opt.inUnderGround || "5";
			var OutUnderGround = this.opt.outUnderGround || "6";
			var MoveSpeedUp = this.opt.moveSpeedUp || "+";
			var MoveSpeedDown = this.opt.moveSpeedDown || "-";
			var RotateSpeedUp = this.opt.rotateSpeedUp || "z";
			var RotateSpeedDown = this.opt.rotateSpeedDown || "x";
			var tlo = map.CreateOperationOptions("RoamConfigOptions");            //创建漫游配置类型
      tlo.AddConfig("KeyDefaultState", "false");                            //是否生效键盘按键配置
      tlo.AddConfig("KeyForward", WalkOn);                                  //前进键
      tlo.AddConfig("KeyBackward", WalkBack);                               //后退键
      tlo.AddConfig("KeyLeft", LeftMove);                                   //向左移动键
      tlo.AddConfig("KeyRight", RightMove);                                 //向右移动键
      tlo.AddConfig("KeyTurnLeft", TurnLeft);                               //向左旋转键
      tlo.AddConfig("KeyTurnRight", TurnRight);                             //向右旋转键
      tlo.AddConfig("KeyRotateUp", RotateUp);                               //向上抬头键
      tlo.AddConfig("KeyRotateDown", RotateDown);                           //向下低头键
      tlo.AddConfig("KeyHeightUp", HeightUp);                               //高度抬升键
      tlo.AddConfig("KeyHeightDown", HeightDown);                           //高度下降键
      tlo.AddConfig("KeyInGround", InGround);                               //进入贴地模式键
      tlo.AddConfig("KeyOutGround", OutGround);                             //退出贴地模式键
      tlo.AddConfig("KeyHome", "0");                                        //主页键
      tlo.AddConfig("KeyInDoor", InDoor);                                   //进入室内用时键
      tlo.AddConfig("KeyOutDoor", OutDoor);                                 //退出室内模式键
      tlo.AddConfig("KeyInUnderGround", InUnderGround);                     //进入地下模式键
      tlo.AddConfig("KeyOutUnderGround", OutUnderGround);                   //退出地下模式键
      tlo.AddConfig("KeyMoveSpeedUp", MoveSpeedUp);                         //移动速度增加键
      tlo.AddConfig("KeyMoveSpeedDown", MoveSpeedDown);                     //移动速度减小键
      tlo.AddConfig("KeyRotateSpeedUp", RotateSpeedUp);                     //旋转速度增加键
      tlo.AddConfig("KeyRotateSpeedDown", RotateSpeedDown);                 //旋转速度减小键
      tlo.AddConfig("OptionsTypeName", "RoamConfigOptions");                //更新操作类型名称，必须为RoamConfigOptions
      var operationPtr = map.CreateOperation("RoamConfigOperation", tlo);   //根据配置创建模型调整操作
      operationPtr.AddObserver();                                           //添加观察者
      map.AddOperation(operationPtr);                                       //加入操作并执行
		},
    //开启模型拾取
		"pickLineOpen":function (layer){
			var resp = map.CreateResponserOptions("123");
			resp.AddConfig("PickLayerIdList", layer.GetLayerID());
			resp.AddConfig("PickColor", "1.0,1.0,0.0,0.8");
			resp.AddConfig("IsChangeColor", "true");
			var res = map.CreateResponser("PickModelResponser", resp);
			res.AddObserver();
			map.AddResponser(res);
			return res;
		},
		//关闭模型拾取
		"pickLineClose":function (){
			map.RemoveResponser("PickModelResponser");
		},
		//旋转
		"rotate":function(angle){
			var navagation = map.CreateRoam();
			//设置视图旋转模式
      //参数1：是否绕视点旋转：true，按视点；false，按目标点
      //参数2：目的俯仰角设置（绝对值）；范围-89到0，单位角度。当为0时，为默认取当前俯仰角，不进行垂直转动
      //参数3：旋转角设置（相对值）：范围-180到180，单位角度，绕视点时，向左为负，向右为正；绕目标点时，向右为负，向左为正。为0时不进行水平转动
      //参数4：转动时间，单位毫秒，范围1-无穷大。不可取0
      navagation.SetViewRotateRoamMode(true, 0, angle, 1000);///绕视点，进行俯仰角为-45度的垂直旋转
		},
		//俯仰
		"pitch":function(angle){
			var navagation = map.CreateRoam();
			//设置视图旋转模式
      //参数1：是否绕视点旋转：true，按视点；false，按目标点
      //参数2：目的俯仰角设置（绝对值）；范围-89到0，单位角度。当为0时，为默认取当前俯仰角，不进行垂直转动
      //参数3：旋转角设置（相对值）：范围-180到180，单位角度，绕视点时，向左为负，向右为正；绕目标点时，向右为负，向左为正。为0时不进行水平转动
      //参数4：转动时间，单位毫秒，范围1-无穷大。不可取0
      navagation.SetViewRotateRoamMode(true, angle, 0, 1000);///绕视点，进行俯仰角为-45度的垂直旋转
		},
		"sensitivity":function(opt){
			this.opt = opt;
			var MoveSpeed = this.opt.moveSpeed || "1";
			var RotateSpeed = this.opt.rotateSpeed || "0.1";
			var tlo = map.CreateOperationOptions("RoamConfigOptions");           //创建漫游按键配置类型
			tlo.AddConfig("MoveSpeed", MoveSpeed);				                       //移动速度 ，默认1
			tlo.AddConfig("RotateSpeed", RotateSpeed);			                     //旋转速度,默认5.7295779513082330
      tlo.AddConfig("OptionsTypeName", "RoamConfigOptions");               //更新操作类型名称，必须为RoamConfigOptions
      var operationPtr = map.CreateOperation("RoamConfigOperation", tlo);  //根据配置创建模型调整操作
      operationPtr.AddObserver(); ///添加观察者
      map.AddOperation(operationPtr);                                      //加入操作并执行
		},
		/*根据坐标高亮模型*/
		"highLightModel":function(layerId,lon,lat,height,color){
			var heightLightColor = color || "1.0,1.0,0,0.5";
			var tlo = map.CreateOperationOptions("ModelOptions");           //创建配置类型,操作类型的配置
      tlo.AddConfig("OptionsTypeName", "ModelOptions");
      tlo.AddConfig("LayersID", layerId);                             //添加需要拾取相交的图层id，以分号分隔
      tlo.AddConfig("Operation", "Create");                           //创建节点关系
      tlo.AddConfig("PickColor", heightLightColor);                   //高亮颜色
      tlo.AddConfig("LonCoord", lon);                                 //经度坐标
      tlo.AddConfig("LatCoord", lat);                                 //纬度坐标
      tlo.AddConfig("HCoord", height);                                //高度坐标
      var operationPtr = map.CreateOperation("ModelOperation", tlo);  //根据配置创建模型调整操作，第一个参数为模型操作的类名
      //operationPtr.AddObserver();                                   //回调事件添加
    	map.AddOperation(operationPtr);                                 //加入操作并执行
    	return operationPtr;
		},
		"removeHighLightModel":function(operation){
			map.RemoveOperation(operation);
		},
		/*根据图层id高亮整个图层*/
		"highLightLayerOperate":function(opt){
			/*jshint maxcomplexity:4 */
			this.opt = opt;
			var OperateLayer = this.opt.operateLayer;
			var LightState = this.opt.lightState || "false";
			var LightColor = this.opt.lightColor || "1.0,1.0,0.0,0.3";
			var i = 0;
			var layerIdList = "";
			for(i = 0; i < OperateLayer.length - 1; i++){
				layerIdList = layerIdList + OperateLayer[i].GetLayerId() + ",";
			}
			layerIdList = layerIdList + OperateLayer[OperateLayer.length - 1].GetLayerId();
			var tlo = map.CreateOperationOptions("ModelOptions");               //创建配置类型,操作类型的配置
      tlo.AddConfig("OptionsTypeName", "HighlightOperationOptions");      //创建配置类型，代表图层高亮更新操作
      tlo.AddConfig("LayerIdList", layerIdList);                          //添加需要高亮图层id，多个图层id以“,”分隔
      tlo.AddConfig("LinghtState", LightState);                           //高亮状态，true为高亮，false为取消高亮
      tlo.AddConfig("Color", LightColor);                                 //高亮颜色
      var operationPtr = map.CreateOperation("HighlightOperation", tlo);  //根据配置创建图层高亮操作，第一个参数为图层高亮操作的类名
      map.AddOperation(operationPtr);
		},
		/**
		 * 添加烟火特效
		 * @method createFire
		 * @author jg
		 * @param  { Number } screenX 屏幕X坐标
		 * @param  { Number } screenY 屏幕Y坐标
		 * @return { Object } 烟火图层
		 * @version v6.0.6
		 */
		"createFire":function(opt){
			/*jshint maxcomplexity:2 */
			this.opt = opt;
			var ScreenX = this.opt.screenX;
			var ScreenY = this.opt.screenY;
			var mSize = 1;
			// 将屏幕坐标点转换成经纬度坐标
			var longlatPos = translate.ScreenPosToWorldPos(ScreenX, ScreenY);
			// 经纬度转场景坐标
			var worldPos = translate.ConvertLongLatHeightToXYZ(longlatPos);
			var DirectPos = translate.ConvertLongLatHeightToXYZ(map.CreatePosition(
				longlatPos.GetX(), longlatPos.GetY(), 0));
			// 计算投影坐标单位向量
			var DirectVec = map3D.normalize(DirectPos.GetX(), DirectPos.GetY(),
			  DirectPos.GetZ());
			// 配置区域
			var RecordPos = map3D.record(worldPos.GetX(), worldPos.GetY(),
			  worldPos.GetZ());
		  // 取投影坐标
			var ZoneXYZPos = translate.ConvertLongLatHeightToXYZ(map.CreatePosition(
				longlatPos.GetX(), longlatPos.GetY(), 20));
			var ZonePos = map.CreatePosition(ZoneXYZPos.GetX() - worldPos.GetX(),
			  ZoneXYZPos.GetY() - worldPos.GetY(),
			  ZoneXYZPos.GetZ() - worldPos.GetZ());
			var SDKBinPath = content3d.GetSDKPath();
			var dataPath = SDKBinPath.substring(0,
				SDKBinPath.length - 4).replace(/\\/g, "\\\\");
      var scale = mSize / 1.4;
      if (Math.abs(scale - 0.0) < 1.0e-6){
      	scale = 1.0;
      }
			// 火焰效果粒子组
			// 建粒子渲染类型
      var mFireRenderer = map.CreateParticleRender();
			// 创建四边形粒子渲染类型
      mFireRenderer.AddConfig("RenderType", "ParticleQuadRender");
			// X轴缩放比例
      mFireRenderer.AddConfig("XScale", 0.3 * scale);
			// Y轴缩放比例
      mFireRenderer.AddConfig("YScale", 0.3 * scale);
			// 是否启用纹理
      mFireRenderer.AddConfig("TextureEnable", "true");
			// 纹理切割x向切割数
      mFireRenderer.AddConfig("AtlasDimensionX", "2");
			// 纹理切割y向切割数
      mFireRenderer.AddConfig("AtlasDimensionY", "2");
			// 建立粒子模板
      var mFireModel = map.CreateParticleModel();
			// 红色参数
      mFireModel.AddConfig("RedParam", "3;0.8,0.9,0.8,0.9");
			// 绿色参数
      mFireModel.AddConfig("GreenParam", "3;0.5,0.6,0.5,0.6");
			// 蓝色参数
      mFireModel.AddConfig("BlueParam", "0;0.3");
			// 透明参数
      mFireModel.AddConfig("AlphaParam", "1;0.4,0.0");
			// 粒子大小
			mFireModel.AddConfig("SizeParam", "4;;0.5,2.0,5.0|1.0,0.0");
			// 角度参数
      mFireModel.AddConfig("AngleParam", "3;0.0,6.28,0.0,6.28");
			// 纹理参数
      mFireModel.AddConfig("TextureIndexParam", "2;0,4.0");
			// 最小生命周期
      mFireModel.AddConfig("MinLifeTime", 1);
			// 最大生命周期
      mFireModel.AddConfig("MaxLifeTime", 1.5);
			// 设置粒子区域对象
      var zone1 = map.CreateParticleZone();
			// 创建区域类型
      zone1.AddConfig("ZoneType", "SphereZone");
			// 区域坐标
      zone1.AddConfig("Position", (0 * DirectVec.GetX()) + "," +
			  (-1 * DirectVec.GetY()) + "," + (0 * DirectVec.GetZ()));
			// 区域半径
      zone1.AddConfig("Radius", 0.5 * scale);
			var direct1 = 1 - map3D.vectorDirection(DirectVec.GetX(),
			  DirectVec.GetY(), DirectVec.GetZ(), 0, 1, 0);
      // 设置粒子发射器
      var mFireEmitter1 = map.CreateParticleEmitter();
			// 粒子发射器类型
      mFireEmitter1.AddConfig("EmitterType", "StraightEmitter");
			// 发射器名称
      mFireEmitter1.AddConfig("Name", "mFireEmitter1");
			// 发射方向 (0,1,0)
      mFireEmitter1.AddConfig("Direction", (DirectVec.GetX() * direct1) + "," +
			  (DirectVec.GetY() * direct1) + "," + (DirectVec.GetZ() * direct1));
			// 发射器区域
      mFireEmitter1.AddConfig("ParticleZone", zone1.GetConfig());
			// 发射数量
      mFireEmitter1.AddConfig("Flow", 40);
			// 最小推力
      mFireEmitter1.AddConfig("MinForce", 1.0 * scale);
			// 最大推力
      mFireEmitter1.AddConfig("MaxForce", 2.5 * scale);
      // 设置粒子区域对象
      var zone2 = map.CreateParticleZone();
			// 区域类型
      zone2.AddConfig("ZoneType", "SphereZone");
			// 区域位置
      zone2.AddConfig("Position", (0.15 * DirectVec.GetX()) + "," +
			  (-1.2 * DirectVec.GetY()) + "," + (0.075 * DirectVec.GetZ()));
			// 区域半径
      zone2.AddConfig("Radius", 0.1 * scale);
			var direct2 = 1 - map3D.vectorDirection(DirectVec.GetX(),
			  DirectVec.GetY(), DirectVec.GetZ(), 0, 0.6, 0);
      // 设置粒子发射器
      var mFireEmitter2 = map.CreateParticleEmitter();
			// 发射器类型
      mFireEmitter2.AddConfig("EmitterType", "StraightEmitter");
			// 发射器名称
      mFireEmitter2.AddConfig("Name", "mFireEmitter2");
			// 发射器方向
      mFireEmitter2.AddConfig("Direction", (DirectVec.GetX() * direct2) + "," +
			  (DirectVec.GetY() * direct2) + "," + (DirectVec.GetZ() * direct2));
			// 发射器区域
      mFireEmitter2.AddConfig("ParticleZone", zone2.GetConfig());
			// 发射数量
      mFireEmitter2.AddConfig("Flow", 15);
			// 最小推力
      mFireEmitter2.AddConfig("MinForce", 0.5 * scale);
			// 最大推力
      mFireEmitter2.AddConfig("MaxForce", 1.5 * scale);
      // 设置粒子区域对象
      var zone3 = map.CreateParticleZone();
			// 创建粒子区域类型
      zone3.AddConfig("ZoneType", "SphereZone");
			// 区域坐标位置
      zone3.AddConfig("Position", (-0.375 * DirectVec.GetX()) + "," +
			  (-1.15 * DirectVec.GetY()) + "," + (-0.375 * DirectVec.GetZ()));
			// 区域半径
      zone3.AddConfig("Radius", 0.3 * scale);
			var direct3 = 1 - map3D.vectorDirection(DirectVec.GetX(),
			  DirectVec.GetY(), DirectVec.GetZ(), -0.6, 0.8, -0.8);
      // 设置粒子发射器
      var mFireEmitter3 = map.CreateParticleEmitter();
			// 发射器类型
      mFireEmitter3.AddConfig("EmitterType", "StraightEmitter");
			// 发射器名称
      mFireEmitter3.AddConfig("Name", "mFireEmitter3");
			// 发射器方向
      mFireEmitter3.AddConfig("Direction", (DirectVec.GetX() * direct3) + "," +
			  (DirectVec.GetY() * direct3) + "," + (DirectVec.GetZ() * direct3));
			// 发射区域
      mFireEmitter3.AddConfig("ParticleZone", zone3.GetConfig());
			// 粒子数量
      mFireEmitter3.AddConfig("Flow", 15);
			// 最小推力
      mFireEmitter3.AddConfig("MinForce", 0.5 * scale);
			// 最大推力
      mFireEmitter3.AddConfig("MaxForce", 1.5 * scale);
      // 设置粒子区域对象
      var zone4 = map.CreateParticleZone();
			// 区域类型
      zone4.AddConfig("ZoneType", "SphereZone");
			// 粒子区域位置
      zone4.AddConfig("Position", (-0.255 * DirectVec.GetX()) + "," +
			  (-1.2 * DirectVec.GetY()) + "," + (0.225 * DirectVec.GetZ()));
			// 区域半径
      zone4.AddConfig("Radius", 0.2 * scale);
			var direct4 = 1 - map3D.vectorDirection(DirectVec.GetX(),
			  DirectVec.GetY(), DirectVec.GetZ(), -0.8, 0.5, 0.2);
      // 设置粒子发射器
      var mFireEmitter4 = map.CreateParticleEmitter();
			// 发射器类型
      mFireEmitter4.AddConfig("EmitterType", "StraightEmitter");
			// 发射器名称
      mFireEmitter4.AddConfig("Name", "mFireEmitter4");
			// 发射器方向
      mFireEmitter4.AddConfig("Direction", (DirectVec.GetX() * direct4) + "," +
			  (DirectVec.GetY() * direct4) + "," + (DirectVec.GetZ() * direct4));
			// 发射器区域
      mFireEmitter4.AddConfig("ParticleZone", zone4.GetConfig());
			// 发射器每秒发射粒子数
      mFireEmitter4.AddConfig("Flow", 10);
			// 最小推力
      mFireEmitter4.AddConfig("MinForce", 0.5 * scale);
			// 最大推力
      mFireEmitter4.AddConfig("MaxForce", 1.5 * scale);
      // 设置粒子区域对象
      var zone5 = map.CreateParticleZone();
			// 区域类型
      zone5.AddConfig("ZoneType", "SphereZone");
			// 区域位置
      zone5.AddConfig("Position", (-0.075 * DirectVec.GetX()) + "," +
			  (-1.2 * DirectVec.GetY()) + "," + (-0.3 * DirectVec.GetZ()));
			// 区域半径
      zone5.AddConfig("Radius", 0.2 * scale);
			var direct5 = 1 - map3D.vectorDirection(DirectVec.GetX(),
			  DirectVec.GetY(), DirectVec.GetZ(), 0.1, 0.8, -1.0);
      // 设置粒子发射器
      var mFireEmitter5 = map.CreateParticleEmitter();
			// 发射器类型
      mFireEmitter5.AddConfig("EmitterType", "StraightEmitter");
			// 发射器名称
      mFireEmitter5.AddConfig("Name", "mFireEmitter5");
			// 发射器方向
      mFireEmitter5.AddConfig("Direction", (DirectVec.GetX() * direct5) + "," +
			  (DirectVec.GetY() * direct5) + "," + (DirectVec.GetZ() * direct5));
			// 发射器区域
      mFireEmitter5.AddConfig("ParticleZone", zone5.GetConfig());
			// 发射器每秒发射粒子数
      mFireEmitter5.AddConfig("Flow", 10);
			// 最小推力
      mFireEmitter5.AddConfig("MinForce", 0.5 * scale);
			// 最大推力
      mFireEmitter5.AddConfig("MaxForce", 1.5 * scale);
			// 设置粒子组
      var mFireGroup = map.CreateParticleGroup();
			// 粒子组名称
      mFireGroup.AddConfig("Name", "Fire");
			// 粒子组粒子容量
      mFireGroup.AddConfig("Capacity", "1350");
			// 粒子组绘制配置
      mFireGroup.AddConfig("ParticleRender", mFireRenderer.GetConfig());
			// 粒子组模板配置
      mFireGroup.AddConfig("ParticleModel", mFireModel.GetConfig());
			// 粒子组发射器配置
      mFireGroup.AddConfig("ParticleEmitters", mFireEmitter1.GetConfig() +
			  mFireEmitter2.GetConfig() + mFireEmitter3.GetConfig() +
				mFireEmitter4.GetConfig() + mFireEmitter5.GetConfig());
			// 重力方向
			mFireGroup.AddConfig("Gravity", DirectVec.GetX() + "," +
			  DirectVec.GetY() * scale + "," + DirectVec.GetZ());
			// 粒子纹理
      mFireGroup.AddConfig("ImageUrl", dataPath + "data\\texture\\fire.bmp.dds");
			// 混合模式
      mFireGroup.AddConfig("BlendMode", "770,1,1");
			// alpha测试
      mFireGroup.AddConfig("AlphaTest", "516,0.5,0,1");
			// 深度缓存
      mFireGroup.AddConfig("DepthBuffer", "0,1");
			// 烟雾效果粒子组
			// 创建粒子渲染类型
      var mSmokeRenderer = map.CreateParticleRender();
			// 创建四边形粒子渲染类型
      mSmokeRenderer.AddConfig("RenderType", "ParticleQuadRender");
			// X轴缩放比例
      mSmokeRenderer.AddConfig("XScale", 0.3 * scale);
			// Y轴缩放比例
      mSmokeRenderer.AddConfig("YScale", 0.3 * scale);
			// 是否启用纹理
      mSmokeRenderer.AddConfig("TextureEnable", "true");
			// 纹理切割x向切割数
      mSmokeRenderer.AddConfig("AtlasDimensionX", "2");
			// 纹理切割y向切割数
      mSmokeRenderer.AddConfig("AtlasDimensionY", "2");
      // 建立粒子模板
      var mSmokeModel = map.CreateParticleModel();
			// 红色参数
      mSmokeModel.AddConfig("RedParam", "1;0.3,0.2");
			// 绿色参数
      mSmokeModel.AddConfig("GreenParam", "1;0.25,0.2");
			// 蓝色参数
      mSmokeModel.AddConfig("BlueParam", "0;0.2");
			// 透明度参数
      mSmokeModel.AddConfig("AlphaParam", "4;0.2,0.0;0.0,0.0|0.2,0.2|1.0,0.0");
			// 角度参数
      mSmokeModel.AddConfig("AngleParam", "3;0.0,6.28,0.0,6.28");
			// 纹理参数
      mSmokeModel.AddConfig("TextureIndexParam", "2;0,4.0");
			// 尺寸参数
      mSmokeModel.AddConfig("SizeParam", "1;5,10");
			// 最大生命周期
      mSmokeModel.AddConfig("MinLifeTime", 5);
			// 最小生命周期
      mSmokeModel.AddConfig("MaxLifeTime", 5);
      // 设置粒子区域对象
      var smokeZone = map.CreateParticleZone();
			// 区域类型
      smokeZone.AddConfig("ZoneType", "SphereZone");
			// 区域位置
      smokeZone.AddConfig("Position", "0,0,0");
			// 区域半径
      smokeZone.AddConfig("Radius", 1.2 * scale);
      // 设置粒子发射器
      var mSmokeEmitter = map.CreateParticleEmitter();
			// 发射器类型
      mSmokeEmitter.AddConfig("EmitterType", "SphericEmitter");
			// 发射器名称
      mSmokeEmitter.AddConfig("Name", "SmokeEmitter");
			// 发射方向 (0,1,0)
      mSmokeEmitter.AddConfig("Direction", DirectVec.GetX() + ","
        + DirectVec.GetY() * scale + "," + DirectVec.GetZ());
			// 最小角度
      mSmokeEmitter.AddConfig("MinAngle", "0");
			// 最大角度
      mSmokeEmitter.AddConfig("MaxAngle", "1.57");
			// 发射器区域
      mSmokeEmitter.AddConfig("ParticleZone", smokeZone.GetConfig());
			// 发射器每秒发射粒子数
      mSmokeEmitter.AddConfig("Flow", 25);
			// 最小推力
      mSmokeEmitter.AddConfig("MinForce", 0.5*scale);
			// 最大推力
      mSmokeEmitter.AddConfig("MaxForce", 1.0*scale);
      ///设置粒子组
      var mSmokeGroup = map.CreateParticleGroup();
			// 粒子组名称
      mSmokeGroup.AddConfig("Name", "Smoke");
			// 容量
      mSmokeGroup.AddConfig("Capacity", "1350");
			// 绘制参数配置
      mSmokeGroup.AddConfig("ParticleRender", mSmokeRenderer.GetConfig());
			// 模板参数配置
      mSmokeGroup.AddConfig("ParticleModel", mSmokeModel.GetConfig());
			// 粒子发射器配置
      mSmokeGroup.AddConfig("ParticleEmitters", mSmokeEmitter.GetConfig());
			// 重力方向　(0.0,0.4*scale,0.0)
      mSmokeGroup.AddConfig("Gravity", DirectVec.GetX() + ","
        + DirectVec.GetY() * scale + "," + DirectVec.GetZ());
			// 粒子纹理配置
      mSmokeGroup.AddConfig("ImageUrl", dataPath +
			  "\\texture\\explosion.bmp.dds");
			// 混合模式
      mSmokeGroup.AddConfig("BlendMode", "770,1,1");
			// alpha测试
      mSmokeGroup.AddConfig("AlphaTest", "516,0.5,0,1");
			// 深度缓存
      mSmokeGroup.AddConfig("DepthBuffer", "0,1");
      // 图层配置
      var tlo = map.CreateLayerOptions("particle");
			// 创建配置类型, ParticleSystemLayerOptions代表粒子图层数据配置
      tlo.AddConfig("LayerOptionsName", "ParticleSystemLayerOptions");
			// 粒子图层坐标(经纬度)
			tlo.AddConfig("ParticlePosition", longlatPos.GetX() + "," +
			  longlatPos.GetY() + "," + (longlatPos.GetZ() + 1 ));
			// 粒子组配置
      tlo.AddConfig("ParticleGroups", mFireGroup.GetConfig() +
			  mSmokeGroup.GetConfig());
			// 创建雨效粒子图层，第一项参数必须为ParticleSystemLayer
      var particleFireLayer = map.CreateLayer("ParticleSystemLayer", tlo);
			// 添加粒子图层
      map.AddLayer(particleFireLayer);
      return particleFireLayer;
		},
		/**
		 * 创建喷泉
		 * @method createFountain
		 * @author jg
		 * @param  { Number } screenX 屏幕的X坐标
		 * @param  { Number } screenY 屏幕的Y坐标
		 * @return { Object } 喷泉图层对象
		 * @version v6.0.6
		 */
		"createFountain":function(opt){
			/*jshint maxcomplexity:2 */
			this.opt = opt;
			var ScreenX = this.opt.screenX;
			var ScreenY = this.opt.screenY;
			// 将屏幕坐标点转换成经纬度坐标
			var longlatPos = translate.ScreenPosToWorldPos(ScreenX, ScreenY);
			// 经纬度转场景坐标
			var worldPos = translate.ConvertLongLatHeightToXYZ(longlatPos);
			// 取投影坐标
			var DirectPos = translate.ConvertLongLatHeightToXYZ(map.CreatePosition(
				longlatPos.GetX(), longlatPos.GetY(), 0));
			// 计算投影坐标单位向量
			var DirectVec = map3D.normalize(DirectPos.GetX(), DirectPos.GetY(),
			  DirectPos.GetZ());
			// 配置区域
			var RecordPos = map3D.record(worldPos.GetX(), worldPos.GetY(),
			  worldPos.GetZ());
			// 取投影坐标
			var ZoneXYZPos = translate.ConvertLongLatHeightToXYZ(
				map.CreatePosition(longlatPos.GetX(), longlatPos.GetY(), 20));
			var ZonePos = map.CreatePosition(ZoneXYZPos.GetX() - worldPos.GetX(),
			  ZoneXYZPos.GetY() - worldPos.GetY(),
				ZoneXYZPos.GetZ() - worldPos.GetZ());
			// 纹理存放路径获取
			var SDKBinPath = content3d.GetSDKPath();
			var dataPath = SDKBinPath.substring(0,
				SDKBinPath.length - 4).replace(/\\/g, "\\\\");
			// 创建粒子渲染类型
			// 水滴样式
			var particleRenderer;
			if(0){
				// Warning: 部分硬件不支持点粒子，使用四边形粒子代替
				// 建粒子渲染类型
				particleRenderer = map.CreateParticleRender();
				// 创建四边形粒子渲染类型, ParticleQuadRenderer代表四边形粒子渲染类型
				particleRenderer.AddConfig("RenderType", "ParticleQuadRender");
				// X轴缩放比例
				particleRenderer.AddConfig("XScale", "0.03");
				// Y轴缩放比例
				particleRenderer.AddConfig("YScale", "0.03");
				// 是否启用纹理
				particleRenderer.AddConfig("TextureEnable", "true");
			}else{
				// 建粒子渲染类型
				particleRenderer = map.CreateParticleRender();
				// 创建点粒子渲染类型, ParticlePointRenderer代表点粒子渲染类型
				particleRenderer.AddConfig("RenderType", "ParticlePointRender");
				// 粒子大小
				particleRenderer.AddConfig("Size", "0.03");
				// 粒子大小参数生效
				particleRenderer.AddConfig("WorldSizeEnable", "true");
			}
			// 水滴颜色
      // 建立粒子模板
      var particleModel = map.CreateParticleModel();
			// 红色参数
      particleModel.AddConfig("RedParam", "0;1");
			// 绿色参数
      particleModel.AddConfig("GreenParam", "0;1");
			// 蓝色参数
      particleModel.AddConfig("BlueParam", "0;1");
			// 透明参数
      particleModel.AddConfig("AlphaParam", "0;0.8");
			// 最小生命周期
      particleModel.AddConfig("MinLifeTime", "3.8");
			// 最大生命周期
      particleModel.AddConfig("MaxLifeTime", "3.8");
			// 喷泉圆锥发射区域
      // 设置粒子区域对象
      var pointZone = map.CreateParticleZone();
			// 创建点区域类型, PointZone代表点区域类型
      pointZone.AddConfig("ZoneType", "PointZone");
			// 创建区域位置
			pointZone.AddConfig("Position", "0,0.5,0");
      // 设置粒子发射器
      var particleEmitter = map.CreateParticleEmitter();
			// 创建发射器类型
      particleEmitter.AddConfig("EmitterType", "SphericEmitter");
			// 发射方向(0,1,0)
      particleEmitter.AddConfig("Direction", DirectVec.GetX() + "," +
			  DirectVec.GetY() + "," + DirectVec.GetZ());
			// 最小角度
      particleEmitter.AddConfig("MinAngle", 0.15 * 3.14 + "");
			// 最大角度
      particleEmitter.AddConfig("MaxAngle", 0.15 * 3.14 + "");
			// 设置发射区域
      particleEmitter.AddConfig("ParticleZone", pointZone.GetConfig());
			// 发射数量(TODO: 中断发射)
      particleEmitter.AddConfig("Flow", 500);
			// 最小推力
      particleEmitter.AddConfig("MinForce", 1.5);
			// 最大推力
      particleEmitter.AddConfig("MaxForce", 1.5);
			// 喷泉水花地面反弹
      // 设置粒子区域对象
      // 取投影坐标
			var PlaneDirectPos = translate.ConvertLongLatHeightToXYZ(
				map.CreatePosition(longlatPos.GetX(), longlatPos.GetY(), 0));
			// 计算投影坐标单位向量
			var PlaneDirectVec = map3D.normalize(PlaneDirectPos.GetX(),
			  PlaneDirectPos.GetY(), PlaneDirectPos.GetZ());
			// 创建粒子区域对象
      var planeZone = map.CreateParticleZone();
			// 创建平面区域类型, PlaneZone代表平面区域类型
      planeZone.AddConfig("ZoneType", "PlaneZone");
			// 区域方向
			planeZone.AddConfig("Normal", PlaneDirectVec.GetX() + "," +
			  PlaneDirectVec.GetY() + "," + PlaneDirectVec.GetZ());
      // 设置修改器
      var particleModifier = map.CreateParticleModifier();
			// 修改器类型
      particleModifier.AddConfig("ModifierType", "ObstacleModifier");
			// 影响区域
      particleModifier.AddConfig("ParticleZone", planeZone.GetConfig());
			// 触发信号(INTERSECT_ZONE)
      particleModifier.AddConfig("Trigger", "8");
			// 反弹系数
      particleModifier.AddConfig("BouncingRatio", "0.2");
			// 速度因子
      particleModifier.AddConfig("Friction", "1.0");
      // 设置粒子组
      var particleGroup = map.CreateParticleGroup();
			// 粒子名称
      particleGroup.AddConfig("Name", "Fountain");
			// 粒子发射数量
      particleGroup.AddConfig("Capacity", "2000");
			// 配置粒子渲染类型
      particleGroup.AddConfig("ParticleRender", particleRenderer.GetConfig());
			// 配置粒子模板
      particleGroup.AddConfig("ParticleModel", particleModel.GetConfig());
			// 配置粒子发射器
      particleGroup.AddConfig("ParticleEmitters", particleEmitter.GetConfig());
			// 配置粒子修改器
      particleGroup.AddConfig("ParticleModifiers",
			  particleModifier.GetConfig());
			// 重力方向
      particleGroup.AddConfig("Gravity", (-DirectVec.GetX()) + "," +
			  (-DirectVec.GetY()) + "," + (-DirectVec.GetZ()));
			// 资源路径
      particleGroup.AddConfig("ImageUrl",
			  dataPath + "data//texture//point.bmp.dds");
			// 混合模式
      particleGroup.AddConfig("BlendMode", "770,1,1");
			// 深度缓存
      particleGroup.AddConfig("DepthBuffer", "0,1");
			// alpha测试
      particleGroup.AddConfig("AlphaTest", "516,0.5,0,1");
			// 粒子图层配置
	    var tlo = map.CreateLayerOptions("particle");
			// 创建配置类型
	    tlo.AddConfig("LayerOptionsName", "ParticleSystemLayerOptions");
			// 设置粒子组配置
	    tlo.AddConfig("ParticleGroups", particleGroup.GetConfig());
			// 粒子图层坐标(经纬度)
			tlo.AddConfig("ParticlePosition", longlatPos.GetX() + "," +
			  longlatPos.GetY() + "," + (longlatPos.GetZ() + 0));
			// 创建喷泉粒子图层
      var particleFountainLayer = map.CreateLayer("ParticleSystemLayer", tlo);
      map.AddLayer(particleFountainLayer);
			// 添加粒子图层
      return particleFountainLayer;
		},
		/**
		 * 水枪特效
		 * @method createHydraulicGiant
		 * @author jg
		 * @param  { Number } startPointLon    起点的经度
		 * @param  { Number } startPointLat    起点的纬度
		 * @param  { Number } startPointHeight 起点的高度
		 * @param  { Number } endPointLon      终点的经度
		 * @param  { Number } endPointLat      终点的纬度
		 * @param  { Number } endPointHeight   终点的高度
		 * @param  { String } baffle           挡板的状态
		 * @return { Ojbect } 水枪图层
		 * @version v6.0.6
		 */
		"createHydraulicGiant":function(opt){
			/*jshint maxcomplexity:4 */
			this.opt = opt;
			var StartPointLon = this.opt.startPointLon;
			var StartPointLat = this.opt.startPointLat;
			var StartPointHeight = this.opt.startPointHeight;
			var EndPointLon = this.opt.endPointLon;
			var EndPointLat = this.opt.endPointLat;
			var EndPointHeight = this.opt.endPointHeight;
			var Baffle = this.opt.baffle || "wall";
			var mStartLLHPoint = map.CreatePosition(StartPointLon, StartPointLat,
				StartPointHeight);
			var mStartWorldPoint = translate.ConvertLongLatHeightToXYZ(
				mStartLLHPoint);
			var mEndLLHPoint = map.CreatePosition(EndPointLon, EndPointLat,
				EndPointHeight);
			var mEndWorldPoint = translate.ConvertLongLatHeightToXYZ(mEndLLHPoint);
			// 取投影坐标
			var DirectPos = translate.ConvertLongLatHeightToXYZ(
				map.CreatePosition(StartPointLon, StartPointLat, 0));
			// 计算投影坐标单位向量
			var DirectVec = map3D.normalize(DirectPos.GetX(), DirectPos.GetY(),
			  DirectPos.GetZ());
			// 计算投影坐标单位向量
			var DirectVec2 = map3D.normalize(mEndWorldPoint.GetX() -
			  mStartWorldPoint.GetX(), mEndWorldPoint.GetY() -
				mStartWorldPoint.GetY(), mEndWorldPoint.GetZ() -
				mStartWorldPoint.GetZ());
			// 纹理存放路径获取
			var SDKBinPath = content3d.GetSDKPath();
			var dataPath = SDKBinPath.substring(0,
				SDKBinPath.length - 4).replace(/\\/g, "\\\\");
			var fXSpeed = (mStartWorldPoint.GetX() - mEndWorldPoint.GetX()) / 4.0;
			var fYSpeed = (mStartWorldPoint.GetY() - mEndWorldPoint.GetY()) *
			  5.0 / 12.0;
			var fZSpeed = (mStartWorldPoint.GetZ() - mEndWorldPoint.GetZ()) / 4.0;
			var mForce = Math.sqrt(Math.pow(fXSpeed, 2) + Math.pow(fYSpeed, 2) +
			  Math.pow(fZSpeed, 2));
			var mDirection = map3D.normalize(fXSpeed, fYSpeed, fZSpeed);
			var mGravity = Math.abs(fYSpeed / 5.0);
			var mSize = mForce / 15;
			// 建粒子渲染类型
			var particleRenderer = map.CreateParticleRender();
			// 创建四边形粒子渲染类型, ParticleQuadRenderer代表四边形粒子渲染类型
			/*
			  创建四边形粒子渲染类型, ParticleQuadRenderer代表四边形粒子渲染类型,四边形粒子
				大小由XScale和YScale控制。
				ParticleLineRender代表线性粒子渲染类型，线性例子大小由Width和Length控制
			 */
			//particleRenderer.AddConfig("RenderType", "ParticleQuadRender");
			particleRenderer.AddConfig("RenderType", "ParticleLineRender");
			particleRenderer.AddConfig("Width", "0.03");
			particleRenderer.AddConfig("Length", "0.03");
			// particleRenderer.AddConfig("AtlasDimensionX", "2");
			// particleRenderer.AddConfig("AtlasDimensionY", "2");
			// 是否启用纹理
			particleRenderer.AddConfig("TextureEnable", "true");
			// 创建粒子模板
			var particleModel = map.CreateParticleModel();
			// 红色参数
      particleModel.AddConfig("RedParam", "0;1");
			// 绿色参数
      particleModel.AddConfig("GreenParam", "0;1");
			// 蓝色参数
      particleModel.AddConfig("BlueParam", "0;1");
			// 透明参数
      particleModel.AddConfig("AlphaParam", "0;0.8");
			// 最小生命周期
      particleModel.AddConfig("MinLifeTime", "4");
			// 最大生命周期
      particleModel.AddConfig("MaxLifeTime", "4");
			/*--------------设置粒子区域对象----------------------*/
			// 创建粒子区域
      var zone = map.CreateParticleZone();
			// 创建区域类型
			zone.AddConfig("ZoneType", "SphereZone");
			// 区域坐标
			zone.AddConfig("Position", "0, 0, 0");
			// 发射半径
      zone.AddConfig("Radius", 0.025);
			// 创建区域发射器
			var particleEmitter = map.CreateParticleEmitter();
			// 创建发射器类型
      particleEmitter.AddConfig("EmitterType", "SphericEmitter");
			// 发射方向(0,1,0)
      particleEmitter.AddConfig("Direction", DirectVec2.GetX() + "," +
			  DirectVec2.GetY() + "," + DirectVec2.GetZ());
			// 最小角度
      particleEmitter.AddConfig("MinAngle", "0.0");
			// 最大角度
      particleEmitter.AddConfig("MaxAngle", 0.05 * 3.14 + "");
			// 设置发射区域
      particleEmitter.AddConfig("ParticleZone", zone.GetConfig());
			// 发射数量
      particleEmitter.AddConfig("Flow", "500");
			// 最小推力
      particleEmitter.AddConfig("MinForce", mForce);
			// 最大推力
      particleEmitter.AddConfig("MaxForce", mForce);
			// 喷泉水花地面反弹
      // 设置粒子区域对象
      // 取投影坐标
      // 计算投影坐标单位向量
      var PlaneDirectVec = null;
			var vector = "0,0,0";
      if("wall" === Baffle){
				var startPlaneDirectPos = translate.ConvertLongLatHeightToXYZ(
					map.CreatePosition(StartPointLon, StartPointLat, 0));
				var endPlaneDirectPos = translate.ConvertLongLatHeightToXYZ(
					map.CreatePosition(EndPointLon, EndPointLat, 0));
				var xCoordinate = startPlaneDirectPos.GetX() - endPlaneDirectPos.GetX();
				var yCoordinate = startPlaneDirectPos.GetY() - endPlaneDirectPos.GetY();
				var zCoordinate = startPlaneDirectPos.GetZ() - endPlaneDirectPos.GetZ();
				PlaneDirectVec = map3D.normalize(xCoordinate, yCoordinate, zCoordinate);
				var xVector = -xCoordinate;
				var yVector = -yCoordinate;
				var zVector = -zCoordinate;
				vector = xVector + "," + yVector + "," + zVector;
			}else if("floor" === Baffle){
				var PlaneDirectPos = translate.ConvertLongLatHeightToXYZ(
					map.CreatePosition(EndPointLon, EndPointLat, 0));
				PlaneDirectVec = map3D.normalize(PlaneDirectPos.GetX(),
				  PlaneDirectPos.GetY(), PlaneDirectPos.GetZ());
				var yVector = EndPointHeight - StartPointHeight;
				vector = "0," + yVector + ",0";
			}
			// 创建粒子区域对象
      var planeZone = map.CreateParticleZone();
			// 创建平面区域类型, PlaneZone代表平面区域类型
      planeZone.AddConfig("ZoneType", "PlaneZone");
			// 挡板区域方向
			planeZone.AddConfig("Normal", PlaneDirectVec.GetX() + "," +
			  PlaneDirectVec.GetY() + "," + PlaneDirectVec.GetZ());
			// 挡板区域的相对位置 (TODO: 不生效)
			planeZone.AddConfig("Position", vector);
      // 设置修改器
      var particleModifier = map.CreateParticleModifier();
			// 修改器类型
      particleModifier.AddConfig("ModifierType", "ObstacleModifier");
			// 影响区域
      particleModifier.AddConfig("ParticleZone", planeZone.GetConfig());
			// 触发信号(INTERSECT_ZONE)
      particleModifier.AddConfig("Trigger", "8");
			// 反弹系数
      particleModifier.AddConfig("BouncingRatio", "0.2");
			// 速度因子
      particleModifier.AddConfig("Friction", "1.0");
			// 创建粒子组
			var particleGroup = map.CreateParticleGroup();
			// 粒子名称
      particleGroup.AddConfig("Name", "Fountain");
			// 粒子最大数量
      particleGroup.AddConfig("Capacity", "50000");
			// 配置粒子渲染类型
      particleGroup.AddConfig("ParticleRender", particleRenderer.GetConfig());
			// 配置粒子模板
      particleGroup.AddConfig("ParticleModel", particleModel.GetConfig());
			// 配置粒子发射器
			particleGroup.AddConfig("ParticleModifiers",
			  particleModifier.GetConfig());
      particleGroup.AddConfig("ParticleEmitters", particleEmitter.GetConfig());
			// 重力方向
      particleGroup.AddConfig("Gravity", (-DirectVec.GetX()) + "," +
			(-DirectVec.GetY()) + "," + (-DirectVec.GetZ()));
			// 资源路径
      // particleGroup.AddConfig("ImageUrl",
			//   dataPath + "data\\texture\\point.bmp.dds");
			// 混合模式
      particleGroup.AddConfig("BlendMode", "770,1,1");
			// 深度缓存
      particleGroup.AddConfig("DepthBuffer", "0,1");
			// alpha测试
      particleGroup.AddConfig("AlphaTest", "516,0.5,0,1");
      // 创建粒子图层
			var tlo = map.CreateLayerOptions("particle");
			// 创建配置类型
      tlo.AddConfig("LayerOptionsName", "ParticleSystemLayerOptions");
			// 设置粒子组配置
      tlo.AddConfig("ParticleGroups", particleGroup.GetConfig());
			// 粒子图层坐标(经纬度)
			tlo.AddConfig("ParticlePosition", mStartLLHPoint.GetX() + "," +
			  mStartLLHPoint.GetY() + "," + (mStartLLHPoint.GetZ()));
			// 创建喷泉粒子图层
      var particleFountainLayer = map.CreateLayer("ParticleSystemLayer", tlo);
      map.AddLayer(particleFountainLayer);
      return particleFountainLayer;
		},
		/*水雾效果*/
		"setFog":function(opt){
			/*jshint maxcomplexity:4 */
			this.opt = opt;
			var FogStatus = this.opt.fogStatus; //雾霾开启状态，true开启，false关闭
			var FogColor = this.opt.fogColor; //雾霾颜色
			var FogDensity = this.opt.fogDensity; //雾霾浓度
			if(String(FogStatus) !== "" && FogStatus !== undefined){
				map.SetParame("FogEnable", FogStatus);
			}
			if(FogColor !== "" && FogColor !== undefined){
			  map.SetParame("FogColor", FogColor);
			}
			if(FogDensity !== "" && FogDensity !== undefined){
				map.SetParame("FogDensity", FogDensity);
			}
		},
		/*取单位向量控制方向*/
		"normalize":function(x, y, z){
			var length = Math.sqrt(x * x + y * y + z * z );
			var mx = x / length;
			var my = y / length;
			var mz = z / length;
			return map.CreatePosition(mx, my, mz);
		},
		/*区域大小控制*/
		"record":function(x, y, z){
			var length = Math.sqrt(x * x + y * y + z * z );
			var factor = (5.0 / length) + 1;
			var mx = x * factor;
			var my = y * factor;
			var mz = z * factor;
			return map.CreatePosition(mx, my, mz);
		},
		"vectorDirection":function(x1, y1, z1, x2, y2, z2){
			var vec1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
			var vec2 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
			var tmp = x1 * x2 + y1 * y2 + z1 * z2;
			return tmp / (vec1 * vec2);
		},
		"addEvent":function(name, func){
			/*jshint maxcomplexity:3 */
			if(content3d.attachEvent){
				content3d.attachEvent(name, func);
			}else if(content3d.addEventListener){
				content3d.addEventListener(name, func, false);
			}else{
				alert("failed to attach event");
			}
	  },
	  "delEvent":function(name, func){
			/*jshint maxcomplexity:3 */
			if(content3d.detachEvent){
				content3d.detachEvent(name, func);
		  }else if(content3d.removeEventListener){
		  	content3d.removeEventListener(name, func, false);
		  }else{
		  	alert("failed to remove event");
		  }
		},
		/**
		 * 创建视频投影图层用于添加视频投影区域
		 * @method addVideoAreaMap
		 * @author zwn
		 * @return { Object } 图层对象
		 * @version v6.0.6
		 */
		"addVideoAreaMap":function(){
			// 创建分析图层配置，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("vArea");
			// 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
			// 此处格式固定，使用区域投影插件
			tlo.AddConfig( "DataSourceTypeName", "as_videoarea" );
			// 创建分析图层，第一项参数必须为AnalysisLayer
			var videoArea = map.CreateLayer("AnalysisLayer", tlo);
			videoArea.AddObserver();
			map.AddLayer(videoArea);
			return videoArea;
		},
		/**
		 * 创建视频投影图层
		 * @method createVideoArea
		 * @author zwn
		 * @param  { Object } layer 图层对象
		 * @param  { String } id    所创建区域ID
		 * @param  { String } Url   存放视频的路径
		 * @return { null }
		 * @version v6.0.6
		 */
		"createVideoArea":function(layer,id,Url){
			// 创建分析图层配置，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("vArea");
			// 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
			// 此处格式固定，使用区域投影插件
			tlo.AddConfig( "DataSourceTypeName", "as_videoarea" );
			// 是否需要创建区域
			tlo.AddConfig( "IsCreateSingleArea", "true");
			// 是否删除
			tlo.AddConfig( "IsDelete", "false");
			// 是否批量操作
			tlo.AddConfig( "IsAllOperator", "false" );
			// 线框颜色rgba
			tlo.AddConfig( "LineColor", "0.3, 0.3, 0.4, 1.0" );
			// 线框宽
			tlo.AddConfig( "LineWidth", "5.0" );
			// 所创建区域ID
			tlo.AddConfig("ID", String(id));
			// 视频路径
			tlo.AddConfig( "VideoResources", Url);
			layer.UpdateLayerOptions(tlo);
		},
		/**
		 * 操作投影的视频进行显隐或者移动
		 * @author zwn
		 * @method operateVideoArea
		 * @param  { Object } layer 要操作的图层对象
		 * @param  { String } id    视频投影区域id
		 * @param  { String } type  操作类型
		 * @param  { String } state 显隐:isVisible,移除:del,右移:moveRight,
		 * 左移:moveLeft,前移:moveUp,后移:moveDown,抬高:liftUp,降低:liftDown
		 * @return { null }
		 * @version v6.0.6
		 */
		"operateVideoArea":function(layer,opt){
			/*jshint maxcomplexity:9 */
			this.opt = opt;
			var id = this.opt.id;
			var type= this.opt.type;
			var state = this.opt.state;
			// 创建分析图层配置，给配置起个名称，任意名称
			var tlo = map.CreateLayerOptions("vArea");
			// 创建配置类型, AnalysisLayerOptions代表分析图层数据配置，必须是此键值对
			tlo.AddConfig("LayerOptionsName", "AnalysisLayerOptions");
			// 此处格式固定，使用区域投影插件
			tlo.AddConfig( "DataSourceTypeName", "as_videoarea" );
			tlo.AddConfig( "ID", String(id));
			switch(type){
			//单个图层显隐
			case "isVisible":
			  tlo.AddConfig( "ImageIsVisible", String(state));
			break;
			case "del":
			  tlo.AddConfig( "IsDelete", "true");
			break;
			case "moveRight":
			  // 是否移动及移动方式, 不添加默认不移动
				tlo.AddConfig( "MoveType", "1" );
				// 移动(经纬度、高程), 不添加默认不移动
				tlo.AddConfig( "MoveDistance", "0.0000001, 0.0, 0.0" );
			break;
			case "moveLeft":
				tlo.AddConfig( "MoveType", "1" );
				tlo.AddConfig( "MoveDistance", "-0.0000001, 0.0, 0.0" );
			break;
			case "moveUp":
				tlo.AddConfig( "MoveType", "1" );
				tlo.AddConfig( "MoveDistance", "0.0, 0.0000001, 0.0" );
			break;
			case "moveDown":
				tlo.AddConfig( "MoveType", "1" );
				tlo.AddConfig( "MoveDistance", "0.0, -0.0000001, 0.0" );
			break;
			case "liftUp":
				tlo.AddConfig( "MoveType", "1" );
				tlo.AddConfig( "MoveDistance", "0.0, 0.0, 0.050" );
			break;
			case "liftDown":
				tlo.AddConfig( "MoveType", "1" );
				tlo.AddConfig( "MoveDistance", "0.0, 0.0, -0.050" );
			break;
			}
			layer.UpdateLayerOptions(tlo);
		},
		/**
		 * 设置视图旋转模式
		 * @method rotateMode
		 * @author jg
		 * @param { boolean } rotateState 是否绕视点旋转true:按视点;false:按目标点
		 * @param { number } pitchAngle   目的俯仰角设置(绝对值);范围-89到0,单位角度。
		 * 当为0时，为默认取当前俯仰角，不进行垂直转动
		 * @param { number } rotateAngle  旋转角设置(相对值):范围-180到180,单位角度，
		 * 绕视点时,向左为负,向右为正;绕目标点时,向右为负,向左为正。为0时不进行水平转动
		 * @param { number } rotateTime   转动时间，单位毫秒，范围1-无穷大。不可取0
		 * @return { null }
		 * @version v6.0.7
		 */
		"rotateMode":function(opt){
			/*jshint maxcomplexity:5 */
			this.opt = opt;
			var RotateState = this.opt.rotateState || false;
			var PitchAngle = this.opt.pitchAngle || 0;
			var RotateAngle = this.opt.rotateAngle || 0;
			var RotateTime = this.opt.rotateTime || 0;
			var navagation = map.CreateRoam();
			// 设置旋转
      navagation.SetViewRotateRoamMode(RotateState, PitchAngle, RotateAngle,
				RotateTime);
		},
		"updateFovy":function(num){
		  // 创建配置类型,操作类型的配置
		  var tlo = map.CreateOperationOptions("Camera"); 
		  tlo.AddConfig("OptionsTypeName", "CameraOptions"); 
		  // 添加操作类型
		  tlo.AddConfig("Operation", "Fovy"); 
		  // 设置透视角
		  tlo.AddConfig("Fovy", num); 
		  // 根据配置创建模型调整操作
		  var operationPtr = map.CreateOperation("CameraOperation", tlo); 
		  map.AddOperation(operationPtr);
		},
		/**
     * 利用server后台加载数据
     * @method loadC3SNEW
     * @author jg
     * @param { String } 数据服务地址
     * @param { String } 数据服务端口
     * @param { String } 资源类型gms、osgb等
     * @param { String } 服务名
     * @param { Object }
     * @return { Object } 图层对象
     */
    "loadC3SNEW":function(ip,port,type,serverName,ToolsObject) {
			/*jshint maxcomplexity:5 */
      var tools = content3d.GetIToolsCOMPtr();
			var parseLayerTool;
		  if (null !== tools) {
        // 工具配置选项
        var tlo = tools.CreateToolsOptions("ToolsOption");
        if (null !== tlo) {
          // 服务ip
          tlo.AddConfig("Url", ip);
           // 服务端口
          tlo.AddConfig("Port", port);
          // 服务数据类型
          tlo.AddConfig("Type", type);
          // 用户名
          tlo.AddConfig("Name", "admin");
          // 密码
          tlo.AddConfig("Password", "admin");
          // 服务名
          tlo.AddConfig("ServerName", serverName);
          // 创建的加载对象类名，不可任意更改
          var parseLayerTool = tools.CreateToolsObject(ToolsObject, tlo);
          if (null !== parseLayerTool) {
            //激活加载工具
            var res = tools.ActiveTools(parseLayerTool);
            //销毁加载工具 -->
            // res = tools.DestoryTools(parseLayerTool);
          }
        }
      } else {
        alert("null tools invalid handle");
      }
      return parseLayerTool;
    },
    /**
     * 对图层进行显示操作
     * @method showC3S
     * @author jg
     * @param { Object } parseLayerTool 图层对象
     * @return { Null }
     */
    "showC3S":function(parseLayerTool) {
			/*jshint maxcomplexity:2 */
      if(parseLayerTool){
				var tools = content3d.GetIToolsCOMPtr();
        // 工具配置项
				var mlo = tools.CreateToolsOptions("ToolsOption");
        // 显隐标志设置，0 隐藏， 1，显示（字符串）
        mlo.AddConfig("Visible", "1");
        // 更新配置项
        parseLayerTool.UpdateToolsOption(mlo);
			}
    },
    /**
     * 对图层进行隐藏操作
     * @method hideC3S
     * @author jg
     * @param { Object } parseLayerTool 图层对象
     * @return { Null }
     */
    "hideC3S": function(parseLayerTool){
			/*jshint maxcomplexity:2 */
      if(parseLayerTool){
		    var tools = content3d.GetIToolsCOMPtr();
        //工具配置项
		    var mlo = tools.CreateToolsOptions("ToolsOption");
        // 显隐标志设置，0 隐藏， 1，显示（字符串）
        mlo.AddConfig("Visible", "0");
        // 更新配置项
        parseLayerTool.UpdateToolsOption(mlo);
	    }
    },
    /**
     * 获取视点，更精确
     * @method getRoamView
     * @author jg
     * @return { String } 坐标点
     */
    "getRoamView": function() {
       var point = map.CreateNavigation().GetRoamViewPoint();
       return point;
    },
    //矢量挤压
    "createExtrudeShp":function(opt){
			/*jshint maxcomplexity:8 */
      this.opt = opt;
      var iconUrl = this.opt.iconUrl;//压缩的图片路径，网络的或服务的
      var leftUp = this.opt.leftUp || 0.5;
      var angle = this.opt.angle || "0";
      var iconSize = this.opt.iconSize || 1024;
      var type  = this.opt.type;
      // 创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      var polygonSymbol = map.CreateSymbol("PolygonSymbol");
      // 颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透
      polygonSymbol.AddConfig("Color", "1,0.1,0.1,1.0");    
      // 样式名称
      polygonSymbol.AddConfig("SurfaceStyleName", "skinStyle");       
    
      var skinSymbol = map.CreateSymbol("SkinSymbol");
      skinSymbol.AddConfig("SkinType", "SkinSymbol");
      skinSymbol.AddConfig("LibraryName", "reslib");
      skinSymbol.AddConfig("ObjectHeight", "256");
      skinSymbol.AddConfig("MinObjectHeight", "64");
      skinSymbol.AddConfig("MaxObjectHeight", "256");
      skinSymbol.AddConfig("IsTile", "true");
      
      var skinRes = map.CreateResource("SkinSymbol");
      skinRes.AddConfig("image_url", iconUrl);
      skinRes.AddConfig("image_width", "256");
      skinRes.AddConfig("image_height", "256");
      skinRes.AddConfig("tiled", "true");
      var reslib = map.CreateResourceLibrary("reslib");
      reslib.AddResource(skinRes);

      var skinStyle = map.CreateStyle("skinStyle");
      skinStyle.AddSymbol("SkinSymbol", skinSymbol.GetConfig());
      skinStyle.AddSymbol("PolygonSymbol", polygonSymbol.GetConfig());
      skinStyle.AddFilterName("BuildGeometryFilter");
      // 创建名称为PolygonStyle的样式，名称任意
      var lStyle = map.CreateStyle("polygonStyle");   
      // 将符号配置添加到该样式，第一参必须为PolygonSymbol字符串
      lStyle.AddSymbol("PolygonSymbol", polygonSymbol.GetConfig());       
			/* 
			  创建类型为LineExtrusionSymbol的符号,为线挤出符号，
				必须为LineExtrusionSymbol字符串
			 */
      var extruSymbol = map.CreateSymbol("LineExtrusionSymbol"); 
      // 是否使用套接样式
      extruSymbol.AddConfig("Casing", "false"); 
      // 是否使用默认流向(从起点流向终点)
      extruSymbol.AddConfig("CurrentDirection", "true"); 
			/* 
				剖面多边形的顶点数,近似圆周circular(8 or 16，set nlExtrusion->Casing() = 
				true),正方形rectangular(4),带有方向纹理(2);
			 */
      extruSymbol.AddConfig("SplitPointNum", "2"); 
      // 剖面多边形的起点顶点的旋转角度(与局部x轴)，radian
      extruSymbol.AddConfig("Angle", "0"); 
      // 管线半径，单位mm
      extruSymbol.AddConfig("Radius", String(iconSize)); 
      // 配置样式至表面样式，第二参与前面创建的样式名称要一致
      extruSymbol.AddConfig("SurfaceStyle", "skinStyle"); 
      // 创建名称为ExtruStyle的样式，名称任意
      var eStyle = map.CreateStyle("ExtruStyle"); 
      // 将符号配置添加到该样式
      eStyle.AddSymbol("LineExtrusionSymbol", extruSymbol.GetConfig()); 
      // 设置挤出符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串
      eStyle.AddFilterName("ExtrudeGeometryFilter"); 
      // 创建样式表
      var styleSheet = map.CreateStyleSheet(); 
      // 将样式配置添加至样式表
      styleSheet.AddStyle(lStyle.GetConfig()); 
      //将样式配置添加至样式表
      styleSheet.AddStyle(eStyle.GetConfig()); 
      styleSheet.AddStyle(skinStyle.GetConfig());
      styleSheet.AddResLib(reslib.GetConfig());
      // 创建图层配置对象
      var tlo = map.CreateLayerOptions("shp"); 
      // 创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); 
      // 数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); 
      // 数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Driver", "ESRI Shapefile"); 
      // 数据存放位置，注意双斜杠
      // tlo.AddConfig("Url", "D:\\line.shp");       
      // 要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("FeatureSourceType", "ogr"); 
      // 瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSizeFactor", "1.0"); 
      // 瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("TileSize", "0"); 
      // 抬升高度，任意值
      tlo.AddConfig("LiftUp", String(leftUp)); 
      // 最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MaxRange", "50000.0"); 
      // 最小显示范围，0-无穷大
      tlo.AddConfig("MinRange", "0.0"); 
      // 绘制顺序
      tlo.AddConfig("RenderOrder", "-200"); 
      /* 
        调度优先级 = priority * PriorityScale + PriorityOffset;
				其中priority由vp根据PagedNode结点的范围(minExtent, maxExtent)、其距离视点
				的距离、LOD层级mLODScale计算得到， 调度优先级越大，优先调度并显示 
       */
      // 结点调度优先级的缩放值PriorityScale,默认为1
      tlo.AddConfig("PriorityScale","1.0");
      // 结点调度优先级的偏移值PriorityOffset,
      tlo.AddConfig("PriorityOffset","10.0");
      // 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); 

      if(type === 1){
        var shpUrl = this.opt.shpUrl;
        // 数据存放位置，注意双斜杠
        tlo.AddConfig("Url", shpUrl);       
      }
      // 创建矢量图层，第一项参数必须为FeatureModelLayer
      var exlineshpLayer = map.CreateLayer("FeatureModelLayer", tlo); 
      // 添加矢量图层
      map.AddLayer(exlineshpLayer); 
      if(type === 2){
        // point是数组格式的
        var points = this.opt.points||"";
        // 获取图层id
        var id = exlineshpLayer.GetLayerID(); 
        // 获取矢量图层
        exeditlineLayer = map.GetFeatureModelLayer(id); 
        // 创建要素对象
        var addFeature = map.CreateFeature();     
        // 设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)
        addFeature.SetGeometryType(2);                  
//        if(points.length>2){
//          points.length = 2;
//        }             
        // 创建子几何类型（当GeometryType为5时生效）
        for(var i = 0;i<points.length;i++){
          var result = points[i];
          addFeature.AddPoint(result.split(",")[0],result.split(",")[1],result.split(",")[2]);
        }
        //var featureId = exeditlineLayer.GetMaxFeatureID(); // 获取矢量图层要素最大ID
        //addFeature.SetFeatureId(featureId + 1);             // 设置FeatureID
        exeditlineLayer.AddFeature(addFeature); 
      }
      // 添加到矢量图层
      return exlineshpLayer;          
    },
    /**
     * 获取路线的长度
     * @method getLineLength
     * @author jg
     * @param { String } points 坐标集
     * @return { Number } lineLength 路线的长度
     */
    "getLineLength": function(points) {
			/*jshint maxcomplexity:3 */
      var lineLength = 0;
      var pointSet = points.split(";");
      var coorXYZ = [];
      var tmpPoint = null;
      var convert = null;
      if(pointSet[pointSet.length-1] === ""){
        pointSet.pop();
      }
      coorXYZ = pointSet[0].split(",");
      // 获取点对象
      var positions = map.CreatePosition(parseFloat(coorXYZ[0]),
        parseFloat(coorXYZ[1]), parseFloat(coorXYZ[2]));
      tmpPoint = translate.ConvertLongLatHeightToXYZ(positions);
      for(var i = 1; i < pointSet.length; i++){
        coorXYZ = pointSet[i].split(",");
        // 获取点对象
        positions = map.CreatePosition(parseFloat(coorXYZ[0]),
          parseFloat(coorXYZ[1]), parseFloat(coorXYZ[2]));
        convert = translate.ConvertLongLatHeightToXYZ(positions);
        lineLength += Math.sqrt(Math.pow((convert.GetX() - tmpPoint.GetX()), 2)+
          Math.pow((convert.GetY() - tmpPoint.GetY()), 2) +
          Math.pow((convert.GetZ() - tmpPoint.GetZ()), 2));
      }
      return lineLength;
    },
    /**
     * 创建矢量编辑图层
     * @method createPlotLayer
     * @author jg
     * @param { String } iconUrl 压缩的图片路径，网络的或服务的
     * @param { Number } leftUp 图层的抬高高度
     * @param { String } angle 图层倾斜角度
     * @param { String } iconSize 图层的宽度
     * @param { String } shpUrl 图层的保存路径
     * @return { Object } exlineshpLayer 矢量图层
     */
    "createPlotLayer": function(opt) {
			/*jshint maxcomplexity: 6 */
      this.opt = opt;
      // 压缩的图片路径，网络的或服务的
      var iconUrl = this.opt.iconUrl; 
      var leftUp = this.opt.leftUp || 0.5;
      var angle = this.opt.angle || "0";
      var iconSize = this.opt.iconSize || 1024;
      var shpUrl  = this.opt.shpUrl || "";
      // 创建类型为PolygonSymbol的符号，必须为PolygonSymbol字符串
      var polygonSymbol = map.CreateSymbol("PolygonSymbol");
      // 颜色值0-1（RGBA），最后一位代表透明度，0为透明，1为不透
      polygonSymbol.AddConfig("Color", "1,0.1,0.1,1.0");    
      // 样式名称
      polygonSymbol.AddConfig("SurfaceStyleName", "skinStyle");       
    
      var skinSymbol = map.CreateSymbol("SkinSymbol");
      skinSymbol.AddConfig("SkinType", "SkinSymbol");
      skinSymbol.AddConfig("LibraryName", "reslib");
      skinSymbol.AddConfig("ObjectHeight", "256");
      skinSymbol.AddConfig("MinObjectHeight", "64");
      skinSymbol.AddConfig("MaxObjectHeight", "256");
      skinSymbol.AddConfig("IsTile", "true");
      
      var skinRes = map.CreateResource("SkinSymbol");
      skinRes.AddConfig("image_url", iconUrl);
      skinRes.AddConfig("image_width", "256");
      skinRes.AddConfig("image_height", "256");
      skinRes.AddConfig("tiled", "true");
      var reslib = map.CreateResourceLibrary("reslib");
      reslib.AddResource(skinRes);

      var skinStyle = map.CreateStyle("skinStyle");
      skinStyle.AddSymbol("SkinSymbol", skinSymbol.GetConfig());
      skinStyle.AddSymbol("PolygonSymbol", polygonSymbol.GetConfig());
      skinStyle.AddFilterName("BuildGeometryFilter");
      // 创建名称为PolygonStyle的样式，名称任意
      var lStyle = map.CreateStyle("polygonStyle");   
      // 将符号配置添加到该样式，第一参必须为PolygonSymbol字符串
      lStyle.AddSymbol("PolygonSymbol", polygonSymbol.GetConfig());       
      // 创建类型为LineExtrusionSymbol的符号,为线挤出符号，必须为LineExtrusionSymbol字符串
      var extruSymbol = map.CreateSymbol("LineExtrusionSymbol"); 
      // 是否使用套接样式
      extruSymbol.AddConfig("Casing", "false"); 
      // 是否使用默认流向(从起点流向终点)
      extruSymbol.AddConfig("CurrentDirection", "true"); 
			/*
			  剖面多边形的顶点数,近似圆周circular(8 or 16，set nlExtrusion->Casing() = 
			  true),正方形rectangular(4),带有方向纹理(2)
			 */
      extruSymbol.AddConfig("SplitPointNum", "2"); 
      // 剖面多边形的起点顶点的旋转角度(与局部x轴)，radian
      extruSymbol.AddConfig("Angle", "0"); 
      // 管线半径，单位mm
      extruSymbol.AddConfig("Radius", String(iconSize)); 
      // 配置样式至表面样式，第二参与前面创建的样式名称要一致
      extruSymbol.AddConfig("SurfaceStyle", "skinStyle"); 
      // 创建名称为ExtruStyle的样式，名称任意
      var eStyle = map.CreateStyle("ExtruStyle"); 
      // 将符号配置添加到该样式
      eStyle.AddSymbol("LineExtrusionSymbol", extruSymbol.GetConfig()); 
      // 设置挤出符号为ExtrudeGeometryFilter，必须为ExtrudeGeometryFilter字符串
      eStyle.AddFilterName("ExtrudeGeometryFilter"); 
      // 创建样式表
      var styleSheet = map.CreateStyleSheet(); 
      // 将样式配置添加至样式表
      styleSheet.AddStyle(lStyle.GetConfig()); 
      //将样式配置添加至样式表
      styleSheet.AddStyle(eStyle.GetConfig()); 
      styleSheet.AddStyle(skinStyle.GetConfig());
      styleSheet.AddResLib(reslib.GetConfig());
      // 创建图层配置对象
      var tlo = map.CreateLayerOptions("shp"); 
      // 创建配置类型, FeatureModelLayerOptions代表矢量数据配置，必须是此键值对
      tlo.AddConfig("LayerOptionsName", "FeatureModelLayerOptions"); 
      // 数据源类型,代表fmgeom插件，必须是此键值对
      tlo.AddConfig("DataSourceTypeName", "fmgeom"); 
      // 数据驱动，针对shp、dxf数据源必须是ESRI Shapefile
      tlo.AddConfig("Driver", "ESRI Shapefile"); 
      // 数据存放位置，注意双斜杠
      // tlo.AddConfig("Url", "D:\\line.shp");       
      // 要素数据源类型，针对shp、dxf数据源必须是ogr
      tlo.AddConfig("FeatureSourceType", "ogr"); 
      // 瓦片大小的影响因子，建议是1.0
      tlo.AddConfig("TileSizeFactor", "1.0"); 
      // 瓦片大小，根据数据实际情况设置，根据数据面积来，面积越大值越大
      tlo.AddConfig("TileSize", "0"); 
      // 抬升高度，任意值
      tlo.AddConfig("LiftUp", String(leftUp)); 
      // 最大显示范围，大于最小显示范围-无穷大
      tlo.AddConfig("MaxRange", "50000.0"); 
      // 最小显示范围，0-无穷大
      tlo.AddConfig("MinRange", "0.0"); 
      // 绘制顺序
      tlo.AddConfig("RenderOrder", "-200"); 
      /* 
        调度优先级 = priority * PriorityScale + PriorityOffset;
				其中priority由vp根据PagedNode结点的范围(minExtent, maxExtent)、其距离视点
				的距离、LOD层级mLODScale计算得到， 调度优先级越大，优先调度并显示 
       */
      // 结点调度优先级的缩放值PriorityScale,默认为1
      tlo.AddConfig("PriorityScale","1.0");
      // 结点调度优先级的偏移值PriorityOffset,
      tlo.AddConfig("PriorityOffset","10.0");
      // 将样式表配置添加至图层配置对象，第一参必须为StyleSheet字符串
      tlo.AddConfig("StyleSheet", styleSheet.GetConfig()); 

      if(shpUrl !== ""){
        // 数据存放位置，注意双斜杠
        tlo.AddConfig("Url", shpUrl);       
      }
      // 创建矢量图层，第一项参数必须为FeatureModelLayer
      var exlineshpLayer = map.CreateLayer("FeatureModelLayer", tlo); 
      // 添加矢量图层
      map.AddLayer(exlineshpLayer); 
      return exlineshpLayer;
    },
    "addPlotFeature": function(layer, pointArr) {
			/* jshint maxcomplexity: 2 */
      // 获取图层id
      var id = layer.GetLayerID(); 
      // 获取矢量图层
      layer = map.GetFeatureModelLayer(id); 
      // 创建要素对象
      var addFeature = map.CreateFeature();     
      // 设置要素几何类型(1:点; 2:线; 3:环; 4:面; 5:多结构)
      addFeature.SetGeometryType(2);    
      // 创建子几何类型（当GeometryType为5时生效）
      for(var i = 0; i < pointArr.length; i++){
        var result = pointArr[i];
				addFeature.AddPoint(result.split(",")[0], result.split(",")[1], 
				  result.split(",")[2]);
      }
      layer.AddFeature(addFeature); 
      return addFeature;
    },
    /**
     * 根据要素id删除要素
     * @method deleteLineById
     * @author jg
     * @param  { Object } feature 待删除的要素
     * @param  { Object } layer   要素所在的图层
     * @return { null }
     * @version v6.0.7
     */
    "deleteLineById":function(opt){
      this.opt = opt;
      var Feature = this.opt.feature;
      var Layer = this.opt.layer;
      var id = Layer.GetLayerID(); ////获取图层id
      var editLayer = map.GetFeatureModelLayer(id); ////获取矢量图层
      // 创建要素对象
      var addFeature = map.CreateFeature();
      // addFeature若为NULL则为删除id为某值的要素
      editLayer.UpdateFeatureById(Feature.GetFeatureId(), addFeature);
		},
		/**
		 * 创建网页弹出框
		 * @method createWebDialog
		 * @author jg
		 * @param { String } url 网页地址
		 * @param { String } left 屏幕位置x
		 * @param { String } top 屏幕位置y
		 * @param { String } width 页面宽度
		 * @param { String } height 页面高度
		 * @return { Object } webobject
		 * @version v6.0.8
		 */
		"createWebDialog": function(option) {
			/*jshint maxcomplexity:6 */
			this.option = option;
			var Url = this.option.url || "";
			var Left = this.option.left || "0";
			var Top = this.option.top || "0";
			var Width = this.option.width || "0";
			var Height = this.option.height || "0";
      // 创建配置项
			var opt = tools.CreateToolsOptions("web");	
			// 网页链接地址										
			opt.AddConfig("Url", Url);		
      // 屏幕位置x
			opt.AddConfig("Left", Left);														
      // 屏幕位置y
			opt.AddConfig("Top", Top);														
      // 页面宽度
			opt.AddConfig("Widget", Width);														
      // 页面高度	
			opt.AddConfig("Height", Height);															
      // 创建工具类型
			var webobject = tools.CreateToolsObject("WebInfoTool" , opt);		
			webobject.AddObserver();
      // 激活工具类
			webobject.Active();																	
			return webobject;
		},
		/**
		 * 移除网页弹出框
		 * @method removeWebDialog
		 * @author jg
		 * @param { Object } obj 网页弹出框对象
		 * @return { Null }
		 * @version v6.0.8
		 */
		"removeWebDialog": function(obj) {
      obj.Deactive();
		},
		/**
		 * 更新网页弹出框
		 * @method updateWebDialog
		 * @author jg
		 * @param { Object } obj 网页弹出框对象
		 * @param { String } param 信息 
		 * @return { Null }
		 * @version v6.0.8
		 */
		"updateWebDialog": function(obj, param) {
      // 创建配置项
			var opt = tools.CreateToolsOptions("web");											
			// 页面宽度
			opt.AddConfig("FunctionName", "Test");														
      // 页面高度		
			opt.AddConfig("FunctionParam", param);														
			obj.UpdateToolsOption(opt);
		},
		/**
		 * 创建动态窗口
		 * @method createWget
		 * @author jg
		 * @param { Object } winObj 动态窗口对象
		 * @param { String } lon 经度
		 * @param { String } lat 纬度
		 * @param { String } height 高度
		 * @param { String } winWidth 窗口宽度
		 * @param { String } winHeight 窗口高度
		 * @param { String } arrowSize 箭头大小
		 * @param { String } radial 圆角半径
		 * @param { String } url 窗口包含的内容
		 * @param { String } closeButton 是否显示关闭按钮，"true"显示，"false"不显示
		 * @param { String } arrowColor 箭头颜色
		 * @param { String } closeButtonX 关闭按钮在窗口中的x坐标
		 * @param { String } closeButtonY 关闭按钮在窗口中的y坐标
		 * @param { String } closeButtonW 关闭按钮的宽
		 * @param { String } closeButtonH 关闭按钮的高度
		 * @return { Object }
		 * @version v6.0.8
		 */
		"createWget": function(opt) {
			/*jshint maxcomplexity: 10 */
			this.opt = opt;
			var Lon = this.opt.lon;
			var Lat = this.opt.lat;
			var Height = this.opt.height;
			var WinWidth = this.opt.winWidth;
			var WinHeight = this.opt.winHeight;
			var ArrowSize = this.opt.arrowSize || "30";
			var Radial = this.opt.radial || "20";
			var Url = this.opt.url;
			var CloseButton = this.opt.closeButton || "true";
			var ArrowColor = this.opt.arrowColor || "65,177,255";
			var CloseButtonX = this.opt.closeButtonX || "365";
			var CloseButtonY = this.opt.closeButtonY || "10";
			var CloseButtonW = this.opt.closeButtonW || "20";
			var CloseButtonH = this.opt.closeButtonH || "20";
			var Param = this.opt.param || "";

      var path = content3d.GetSDKPath().replace("\\bin","");
      // 关闭按钮图片路径
      var dataPath = path + "\\data\\texture\\close.bmp";		
		  // 创建响应器配置项
			var pOption = map.CreateResponserOptions("123");									
      // 指向经纬度坐标经度
			pOption.AddConfig("Longitude", Lon);								
      // 指向经纬度坐标维度
			pOption.AddConfig("Latitude", Lat);								
      // 指向经纬度坐标高度
			pOption.AddConfig("PosHeight", Height);												
      // 窗口宽度
			pOption.AddConfig("Widget", WinWidth);													
      // 窗口高度
			pOption.AddConfig("Height", WinHeight);													
      // 箭头大小
			pOption.AddConfig("ArrowSize", ArrowSize);												
      // 圆角直径
			pOption.AddConfig("Radial", Radial);													
      // 指向网页url
			pOption.AddConfig("Url", Url);	
      // 坐标更新帧率
			pOption.AddConfig("MoveDelay", "1");												
      // 是否显示关闭按钮
			pOption.AddConfig("CloseButtonState", CloseButton);										
      // 关闭按钮图片路径
			pOption.AddConfig("CloseButtonUrl", dataPath);										
      // 箭头背景颜色
			pOption.AddConfig("BKColor", ArrowColor);											
			// 关闭按钮所在窗口x位置
			pOption.AddConfig("CloseBtnPosX", CloseButtonX);											
      // 关闭按钮所在窗口y位置
			pOption.AddConfig("CloseBtnPosY", CloseButtonY);											
      // 关闭按钮宽度
			pOption.AddConfig("CloseBtnPosW", CloseButtonW);											
      // 关闭按钮高度
			pOption.AddConfig("CloseBtnPosH", CloseButtonH);											
	    // 函数名
			pOption.AddConfig("FunctionName", "Test");										
      // 函数参数
			pOption.AddConfig("FunctionParam", Param);											
			// 创建响应器
			var webResp  = map.CreateResponser("TipsDialogResponser", pOption);						
			webResp.AddObserver();
      // 响应器添加至场景
			map.AddResponser(webResp);			
			return webResp;												
		},
		/**
		 * 移除动态窗口
		 * @method removeWget
		 * @author jg
		 * @return { Null }
		 * @version v6.0.8
		 */
		"removeWget": function() {
      // 移除响应器
      map.RemoveResponser("TipsDialogResponser");												
		},
		/**
		 * 更新动态窗口对象
		 * @method updateWget
		 * @author jg
		 * @param { Object } winObj 动态窗口对象
		 * @param { String } lon 经度
		 * @param { String } lat 纬度
		 * @param { String } height 高度
		 * @param { String } winWidth 窗口宽度
		 * @param { String } winHeight 窗口高度
		 * @param { String } arrowSize 箭头大小
		 * @param { String } radial 圆角半径
		 * @param { String } url 窗口包含的内容
		 * @param { String } closeButton 是否显示关闭按钮，"true"显示，"false"不显示
		 * @param { String } arrowColor 箭头颜色
		 * @param { String } closeButtonX 关闭按钮在窗口中的x坐标
		 * @param { String } closeButtonY 关闭按钮在窗口中的y坐标
		 * @param { String } closeButtonW 关闭按钮的宽
		 * @param { String } closeButtonH 关闭按钮的高度
		 * @return { Null }
		 * @version v6.0.8
		 */
		"updateWget": function (winObj, opt) {
			/*jshint maxcomplexity:15 */
			this.opt = opt;
			var Lon = this.opt.lon;
			var Lat = this.opt.lat;
			var Height = this.opt.height;
			var WinWidth = this.opt.winWidth;
			var WinHeight = this.opt.winHeight;
			var ArrowSize = this.opt.arrowSize;
			var Radial = this.opt.radial;
			var Url = this.opt.url;
			var CloseButton = this.opt.closeButton;
			var ArrowColor = this.opt.arrowColor;
			var CloseButtonX = this.opt.closeButtonX;
			var CloseButtonY = this.opt.closeButtonY;
			var CloseButtonW = this.opt.closeButtonW;
			var CloseButtonH = this.opt.closeButtonH;
      // 创建响应器配置项
			var pOption = map.CreateResponserOptions("123");	
			if(Lon !== null && Lon !== undefined && Lon !== ""){								
				// 指向经纬度坐标经度
				pOption.AddConfig("Longitude", Lon);								
			}
			if(Lat !== null && Lat !== undefined && Lat !== ""){
				// 指向经纬度坐标维度
				pOption.AddConfig("Latitude", Lat);								
			}
			if(Height !== null && Height !== undefined && Height !== ""){
				// 指向经纬度坐标高度
				pOption.AddConfig("PosHeight", Height);	
			}
			if(WinWidth !== null && WinWidth !== undefined && WinWidth !== ""){
				// 窗口宽度
				pOption.AddConfig("Widget", WinWidth);
			}
			if(WinHeight !== null && WinHeight !== undefined && WinHeight !== ""){
				// 窗口高度
				pOption.AddConfig("Height", WinHeight);	
			}
			if(ArrowSize !== null && ArrowSize !== undefined && ArrowSize !== ""){
				// 箭头大小
				pOption.AddConfig("ArrowSize", ArrowSize);
			}
			if(Radial !== null && Radial !== undefined && Radial !== ""){
				// 圆角直径
				pOption.AddConfig("Radial", Radial);
			}
			if(Url !== null && Url !== undefined && Url !== ""){
				// 指向网页url
				pOption.AddConfig("Url", Url);
			}
			if(CloseButton !== null && CloseButton !== undefined && 
				CloseButton !== ""){					
				// 是否显示关闭按钮
				pOption.AddConfig("CloseButtonState", CloseButton);
			}
			if(ArrowColor !== null && ArrowColor !== undefined && ArrowColor !== ""){
				// 箭头背景颜色
				pOption.AddConfig("BKColor", ArrowColor);
			}
			if(CloseButtonX !== null && CloseButtonX !== undefined && 
				CloseButtonX !== ""){
				// 关闭按钮所在窗口x位置
				pOption.AddConfig("CloseBtnPosX", CloseButtonX);
			}
			if(CloseButtonY !== null && CloseButtonY !== undefined && 
				CloseButtonY !== ""){
				// 关闭按钮所在窗口y位置
				pOption.AddConfig("CloseBtnPosY", CloseButtonY);
			}
			if(CloseButtonW !== null && CloseButtonW !== undefined && 
				CloseButtonW !== ""){
				// 关闭按钮宽度
				pOption.AddConfig("CloseBtnPosW", CloseButtonW);
			}
			if(CloseButtonH !== null && CloseButtonH !== undefined && 
				CloseButtonH !== ""){
				// 关闭按钮高度
				pOption.AddConfig("CloseBtnPosH", CloseButtonH);
			}
      winObj.UpdateResponserOptions(pOption);
		},
		/**
		 * 获取参数
		 * @method WgetParam
		 * @author jg
		 * @param { Object } winObj 窗口对象
		 * @param { String } param 参数
		 * @return { Null }
		 * @version v6.0.8
		 */
		"WgetParam": function(winObj, param) {
      // 创建响应器配置项
			var pOption = map.CreateResponserOptions("123");									
			// 函数名
			pOption.AddConfig("FunctionName", "Test");											
      // 函数参数
			pOption.AddConfig("FunctionParam", param);											
      // 创建响应器
			winObj.UpdateResponserOptions(pOption);
		},
		/**
		 * 显隐动态窗口
		 * @method visibleWget
		 * @author jg
		 * @param { Object } winObj 窗口对象
		 * @param { Number } state 显隐状态，1为显示，0为隐藏
		 * @return { Null }
		 * @version v6.0.8
		 */
		"visibleWget": function(winObj, state) {
      // 创建响应器配置项
			var pOption = map.CreateResponserOptions("123");										
			// 配置响应器显隐状态
			pOption.AddConfig("Visible", state);											
      // 更新相应器操作
			winObj.UpdateResponserOptions(pOption);
		}
});

// 注册类名
CooMap.Class.className(Map3D,"Map3D");
// 空间命名
CooMap.Map3D = Map3D;
