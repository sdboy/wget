"use strict";
// +----------------------------------------------------------------------
// | Coo Web Map Javascript API
// +----------------------------------------------------------------------
// | Copyright (c) 2016 http://www.hzkelan.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed Hzkelan CooMap
// +----------------------------------------------------------------------
// | Author: WebAPI Team
// +----------------------------------------------------------------------

/**
 +------------------------------------------------------------------------------
 * 构造函数: Class
 * 用于被其它类继承的基类，支持多重继承
 +------------------------------------------------------------------------------
 * 创建一个CooMap格式的类时，语法如下:
 * > var MyClass = CooMap.Class(prototype);
 *
 * 创建一个CooMap格式的类时，实现多重继承，语法如下:
 * > var MyClass = CooMap.Class(Class1, Class2, prototype);
 +------------------------------------------------------------------------------
 */
var CooMap = function () {}; 
CooMap.Class = function () {}; 

/**
 +------------------------------------------------------------------------------
 * 函数: extend
 * 复制源对象中所有所有属性到目标对象，以达到类继承的目的
 +------------------------------------------------------------------------------
 * 
 * > extend(destination, source);
 +------------------------------------------------------------------------------
 */

CooMap.Class.extend = function (props) {
	// 创建一个新类
	var ncls = function () {
		// call the constructor
		if (this["initialize"]) {
			this["initialize"].apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = ncls;

	ncls.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			ncls[i] = this[i];
		}
	}

	// 模拟静态class
	if (props["statics"]) {
		CooMap["extend"](ncls, props['statics']);
		delete props.statics;
	}

	// 包含对象class
	if (props["includes"]) {
	    /*
	    var icls = props.includes;
	    if (typeof icls === 'object') {
		   for (type in icls) {
					if (icls.hasOwnProperty(type)) {
						CooMap.Util.extend.apply(null, [proto].concat(icls[type]));
					}
		   }
		}else{
		  
		}
		delete icls;*/
		CooMap["Util"]["extend"].apply(null, [proto].concat(props["includes"]));
		delete props["includes"];
		
	}

	// 初始化参数
	if (props["options"] && proto["options"]) {
		props["options"] = CooMap["extend"]({}, proto["options"], props["options"]);
	}

	//  prototype
	CooMap["extend"](proto, props);
	return ncls;
};


CooMap.Class.isPrototype = function () {};
// 对象添加方法  
CooMap.Class.include = function (props) {
	CooMap["extend"](this.prototype, props);
};
// 对象添加方法  
CooMap.Class.method = function (props) {
	CooMap["extend"](this.prototype, props);
};
// 对象参数对象
CooMap.Class.options = function (options) {
	CooMap["extend"](this.prototype.options, options);
};
//  对象类名
CooMap.Class.className = function (applyClass,className) {
	 applyClass.prototype.toString  = function() {
            return className ;
     };
};
CooMap['Class'] = CooMap.Class;
CooMap['Class']['extend'] = CooMap.Class.extend;
CooMap['Class']['method'] = CooMap.Class.method;
CooMap['Class']['include'] = CooMap.Class.include;
CooMap['Class']['options'] = CooMap.Class.options;
CooMap['Class']['className'] = CooMap.Class.className;


