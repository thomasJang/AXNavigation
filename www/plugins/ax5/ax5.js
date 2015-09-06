/*
 * ax5 - v0.0.1 
 * 2015-09-06 
 * www.axisj.com Javascript UI Library
 * 
 * Copyright 2013, 2015 AXISJ.com and other contributors 
 * Released under the MIT license 
 * www.axisj.com/ax5/license 
 */

// 필수 Ployfill 확장 구문
(function(){
    'use strict';
    
	var root = this,
        re_trim = /^\s*|\s*$/g;

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	if (!Object.keys) {
		Object.keys = (function() {
			var hwp = Object.prototype.hasOwnProperty,
                hdeb = !({ toString: null }).propertyIsEnumerable('toString'),
				de = [
					'toString',
					'toLocaleString',
					'valueOf',
					'hasOwnProperty',
					'isPrototypeOf',
					'propertyIsEnumerable',
					'constructor'
				],
				del = de.length;

			return function(obj) {
				if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) throw new TypeError('type err');
				var r = [], prop, i;
				for (prop in obj) if (hwp.call(obj, prop)) r.push(prop);
				if (hdeb) {
					for (i = 0; i < del; i++) if (hwp.call(obj, de[i])) r.push(de[i]);
				}
				return r;
			};
		}());
	}

	// ES5 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
	// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function (fun /*, thisp */) {
			if (this === void 0 || this === null) { throw TypeError(); }
			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") { throw TypeError(); }
			var thisp = arguments[1], i;
			for (i = 0; i < len; i++) {
				if (i in t) {
					fun.call(thisp, t[i], i, t);
				}
			}
		};
	}

	// ES5 15.3.4.5 Function.prototype.bind ( thisArg [, arg1 [, arg2, ... ]] )
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (o) {
			if (typeof this !== 'function') { throw TypeError("function"); }
			var slice = [].slice,
				args = slice.call(arguments, 1),
				self = this,
				bound = function () {
					return self.apply(this instanceof nop ? this : o,
						args.concat(slice.call(arguments)));
				};

			function nop() {}
			nop.prototype = self.prototype;
			bound.prototype = new nop();
			return bound;
		};
	}

	/*global document */
	/**
	 * define document.querySelector & document.querySelectorAll for IE7
	 *
	 * A not very fast but small hack. The approach is taken from
	 * http://weblogs.asp.net/bleroy/archive/2009/08/31/queryselectorall-on-old-ie-versions-something-that-doesn-t-work.aspx
	 *
	 */
	(function () {
		if (document.querySelectorAll || document.querySelector) {
			return;
		}
		if(!document.createStyleSheet) return;
		var style = document.createStyleSheet(),
			select = function (selector, maxCount) {
				var
					all = document.all,
					l = all.length,
					i,
					resultSet = [];

				style.addRule(selector, "foo:bar");
				for (i = 0; i < l; i += 1) {
					if (all[i].currentStyle.foo === "bar") {
						resultSet.push(all[i]);
						if (resultSet.length > maxCount) {
							break;
						}
					}
				}
				style.removeRule(0);
				return resultSet;
			};

		document.querySelectorAll = function (selector) {
			return select(selector, Infinity);
		};
		document.querySelector = function (selector) {
			return select(selector, 1)[0] || null;
		};
	}());

	if (!String.prototype.trim) {
		(function() {
			String.prototype.trim = function() {
				return this.replace(re_trim, '');
			};
		})();
	}

	if (!window.JSON) {
		window.JSON = {
			parse: function (sJSON) { return (new Function('', 'return ' + sJSON))(); },
			stringify:(function(){
				var r = /["]/g, f;
				return f = function(vContent){
					var result, i, j;
					switch( result = typeof vContent ){
					case'string':return '"' + vContent.replace( r, '\\"' ) + '"';
					case'number':case'boolean':return vContent.toString();
					case'undefined':return 'undefined';
					case'function':return '""';
					case'object':
						if(!vContent) return 'null';
						result = '';
						if(vContent.splice){
							for(i = 0, j = vContent.length ; i < j ; i++) result += ',' + f(vContent[i]);
							return '[' + result.substr(1) + ']';
						}else{
							for(i in vContent) if(vContent.hasOwnProperty(i) && vContent[i] !== undefined && typeof vContent[i] != 'function') result += ',"'+i+'":' + f(vContent[i]);
							return '{' + result.substr(1) + '}';
						}
					}
				};
			})()
		};
	}

	// Console-polyfill. MIT license. https://github.com/paulmillr/console-polyfill
	// Make it safe to do console.log() always.
	(function(con) {
		var prop, method;
		var empty = {};
		var dummy = function() {};
		var properties = 'memory'.split(',');
		var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
		'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
		'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
		while (prop = properties.pop()) con[prop] = con[prop] || empty;
		while (method = methods.pop()) con[method] = con[method] || dummy;
	})(root.console = root.console || {}); // Using `this` for web workers.

}.call(this));

// ax5 선언
(function() {
	'use strict';

	// root of function
	var root = this, win = window, doc = document, docElem = document.documentElement,
	/** @namespace {Object} ax5 */
		ax5 = {}, info, U, dom;

    var node_names = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        re_tag = /<([\w:]+)/,
        re_single_tags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        re_html = /<|&#?\w+;/,
        re_noInnerhtml = /<(?:script|style|link)/i,
        core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        re_margin = /^margin/,
        re_numsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
        re_numnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
        re_position = /^(top|right|bottom|left)$/,
        re_is_json = /^(["'](\\.|[^"\\\n\r])*?["']|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/,
        re_ms = /^-ms-/,
        re_snake_case = /[\-_]([\da-z])/gi,
        re_camel_case = /([A-Z])/g,
        re_dot = /\./,
        re_int = /[-|+]?[\D]/gi,
        re_not_num = /\D/gi,
        re_money_split = new RegExp('([0-9])([0-9][0-9][0-9][,.])'),
        re_amp = /&/g,
        re_eq = /=/,
        re_class_name_split = /[ ]+/g,
        body = doc.createElement('body'),
        safe_fragment = (function(){
            var list = node_names.split( "|" ),
                safeFrag = doc.createDocumentFragment();
            if ( safeFrag.createElement ) {
                while ( list.length ) {
                    safeFrag.createElement(
                        list.pop()
                    );
                }
            }
            return safeFrag;
        })(),
        fragment_div = safe_fragment.appendChild( doc.createElement("div")),
        tag_map = {
            option: [ 1, "<select multiple='multiple'>", "</select>" ],
            legend: [ 1, "<fieldset>", "</fieldset>" ],
            area: [ 1, "<map>", "</map>" ],
            param: [ 1, "<object>", "</object>" ],
            thead: [ 1, "<table>", "</table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ]
        },
        tag_not_support_innerhtml = {
            col:1, colGroup:1, frameSet:1, html:1, head:1, style:1, table:1,
            tBody:1, tFoot:1, tHead:1, title:1, tr:1
        };

	/**
	 * guid
	 * @member {Number} ax5.guid
	 */
	ax5.guid = 1;
	/**
	 * ax5.guid를 구하고 증가시킵니다.
	 * @method ax5.get_guid
	 * @returns {Number} guid
	 */
	ax5.get_guid = function(){return ax5.guid++;};

	/**
	 * 상수모음
	 * @namespace ax5.info
	 */
	ax5.info = info = (function(){
		/**
		 * ax5 version
		 * @member {String} ax5.info.version
		 */
		var version = "0.0.1";
		/**
		 * ax5 library path
		 * @member {String} ax5.info.base_url
		 */
		var base_url = "";
		/**
		 * ax5 에러 출력메세지 사용자 재 정의
		 * @member {Object} ax5.info.onerror
		 * @examples
		 * ```
		 * ax5.info.onerror = function(){
		 *  console.log(arguments);
		 * }
		 * ```
		 */
		var onerror = function(){
			console.error(U.to_array(arguments).join(":"));
		};

		/**
		 * event keyCodes
		 * @member {Object} ax5.info.event_keys
		 * @example
		 * ```
		 * {
		 * 	BACKSPACE: 8, TAB: 9,
		 * 	RETURN: 13, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46,
		 * 	HOME: 36, END: 35, PAGEUP: 33, PAGEDOWN: 34, INSERT: 45, SPACE: 32
		 * }
		 * ```
		 */
		var event_keys = {
			BACKSPACE: 8, TAB: 9,
			RETURN: 13, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46,
			HOME: 36, END: 35, PAGEUP: 33, PAGEDOWN: 34, INSERT: 45, SPACE: 32
		};

		var week_names = [
			{ label: "SUN" },
			{ label: "MON" },
			{ label: "TUE" },
			{ label: "WED" },
			{ label: "THU" },
			{ label: "FRI" },
			{ label: "SAT" }
		];

		/**
		 * 사용자 브라우저 식별용 오브젝트
		 * @member {Object} ax5.info.browser
		 * @example
		 * ```
		 * console.log( ax5.info.browser );
		 * //Object {name: "chrome", version: "39.0.2171.71", mobile: false}
		 * ```
		 */
		var browser = (function (ua, mobile, browserName, match, browser, browserVersion) {
			ua = navigator.userAgent.toLowerCase(), mobile = (ua.search(/mobile/g) != -1), browserName, match, browser, browserVersion;

			if (ua.search(/iphone/g) != -1) {
				return { name: "iphone", version: 0, mobile: true }
			} else if (ua.search(/ipad/g) != -1) {
				return { name: "ipad", version: 0, mobile: true }
			} else if (ua.search(/android/g) != -1) {
				match = /(android)[ \/]([\w.]+)/.exec(ua) || [];
				browserVersion = (match[2] || "0");
				return { name: "android", version: browserVersion, mobile: mobile }
			} else {
				browserName = "";
				match = /(opr)[ \/]([\w.]+)/.exec(ua) || /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
				browser = (match[1] || "");
				browserVersion = (match[2] || "0");

				if (browser == "msie") browser = "ie";
				return {
					name: browser,
					version: browserVersion,
					mobile: mobile
				}
			}
			ua = null, mobile = null, browserName = null, match = null, browser = null, browserVersion = null;
		})();
		/**
		 * 브라우저 여부
		 * @member {Boolean} ax5.info.is_browser
		 */
		var is_browser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && win.document);
		/**
		 * 브라우저에 따른 마우스 휠 이벤트이름
		 * @member {Object} ax5.info.wheel_enm
		 */
		var wheel_enm = ((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel");

		/**
		 * 현재 페이지의 Url 정보를 리턴합니다.
		 * @method ax5.info.url_util
		 * @returns {Object}
		 * @example
		 * ```
		 * console.log( ax5.util.to_json( ax5.util.url_util() ) );
		 * {
		 *	"base_url": "http://ax5:2018",
		 *	"href": "http://ax5:2018/samples/index.html?a=1&b=1#abc",
		 *	"param": "a=1&b=1",
		 *	"referrer": "",
		 *	"pathname": "/samples/index.html",
		 *	"hostname": "ax5",
		 *	"port": "2018",
		 *	"url": "http://ax5:2018/samples/index.html",
		 *	"hashdata": "abc"
		 * }
		 * ```
		 */
		function url_util(url, urls) {
			url = {
				href: win.location.href,
				param: win.location.search,
				referrer: doc.referrer,
				pathname: win.location.pathname,
				hostname: win.location.hostname,
				port: win.location.port
			}, urls = url.href.split(/[\?#]/);
			url.param = url.param.replace("?", "");
			url.url = urls[0];
			if(url.href.search("#") > -1){
				url.hashdata = U.last(urls);
			}
			urls = null;
			url.base_url = U.left(url.href, "?").replace(url.pathname, "");
			return url;
		}

		return {
			version: version,
			base_url: base_url,
			onerror: onerror,
			event_keys: event_keys,
			week_names: week_names,
			browser: browser,
			is_browser: is_browser,
			wheel_enm: wheel_enm,
			url_util: url_util
		};
	})();


	/**
	 * Refer to this by {@link ax5}.
	 * @namespace ax5.util
	 */
	ax5['util'] = U = (function(){
		var _toString = Object.prototype.toString;

		/**
		 * Object나 Array의 아이템으로 사용자 함수를 호출합니다.
		 * @method ax5.util.each
		 * @param {Object|Array} O
		 * @param {Function} _fn
		 * @example
		 * ```js
		 * var axf = ax5.util;
		 * axf.each([0,1,2], function(){
		 * 	// with this
		 * });
		 * axf.each({a:1, b:2}, function(){
		 * 	// with this
		 * });
		 * ```
		 */
		function each(O, _fn) {
			if(is_nothing(O)) return [];
			var key, i = 0, l = O.length,
				isObj = l === undefined || typeof O === "function";
			if (isObj) {
				for (key in O) {
					if (typeof O[key] != "undefined")
						if (_fn.call(O[key], key, O[key]) === false) break;
				}
			} else {
				for (; i < l;) {
					if (typeof O[i] != "undefined")
						if (_fn.call(O[i], i, O[i++]) === false) break;
				}
			}
			return O;
		}

		// In addition to using the http://underscorejs.org : map, reduce, reduce_right, find
		/**
		 * 원본 아이템들을 이용하여 사용자 함수의 리턴값으로 이루어진 새로운 배열을 만듭니다.
		 * @method ax5.util.map
		 * @param {Object|Array} O
		 * @param {Function} _fn
		 * @returns {Array}
		 * @example
		 * ```js
		 * var myArray = [0,1,2,3,4];
		 * var myObject = {a:1, b:"2", c:{axj:"what", arrs:[0,2,"3"]},
		 *    fn: function(abcdd){
		 *        return abcdd;
		 *    }
		 * };
		 *
		 * var _arr = ax5.util.map( myArray,  function(index, I){
		 *    return index+1;
		 * });
		 * console.log(_arr);
		 * // [1, 2, 3, 4, 5]
		 *
		 * var _arr = ax5.util.map( myObject,  function(k, v){
		 *    return v * 2;
		 * });
		 * console.log(_arr);
		 * // [2, 4, NaN, NaN]
		 * ```
		 */
		function map(O, _fn) {
			if(is_nothing(O)) return [];
			var key, i = 0, l = O.length, results = [], fn_result;
			if (is_object(O)) {
				for (key in O) {
					if (typeof O[key] != "undefined") {
						fn_result = undefined;
						if ((fn_result = _fn.call(O[key], key, O[key])) === false) break;
						else results.push(fn_result);
					}
				}
			} else {
				for (; i < l;) {
					if (typeof O[i] != "undefined") {
						fn_result = undefined;
						if ((fn_result = _fn.call(O[i], i, O[i++])) === false) break;
						else results.push(fn_result);
					}
				}
			}
			return results;
		}

		/**
		 * 원본 아이템들을 이용하여 사용자 함수의 리턴값이 참인 아이템의 위치나 키값을 반환합니다.
		 * @method ax5.util.search
		 * @param {Object|Array} O
		 * @param {Function|String|Number} _fn - 함수 또는 값
		 * @returns {Number|String}
		 * @example
		 * ```js
		 * var myArray = [0,1,2,3,4,5,6];
		 * var myObject = {a:"123","b":"123",c:123};
		 *
		 * ax5.util.search(myArray,  function(){
		 *    return this > 3;
		 * });
		 * // 4
		 * ax5.util.search(myObject,  function(k, v){
		 *    return v === 123;
		 * });
		 * // "c"
		 * ax5.util.search([1,2,3,4], 3);
		 * // 2
		 * ax5.util.search([1,2], 4);
		 * // -1
		 * ax5.util.search(["name","value"], "value");
		 * // 1
		 * ax5.util.search(["name","value"], "values");
		 * // -1
		 * ax5.util.search({k1:"name",k2:"value"}, "value2");
		 * // -1
		 * ax5.util.search({k1:"name",k2:"value"}, "value");
		 * // "k2"
		 * ```
		 */
		function search(O, _fn) {
			if(is_nothing(O)) return -1;
			var key, i = 0, l = O.length;
			if (is_object(O)) {
				for (key in O) {
					if (typeof O[key] != "undefined" && is_function(_fn) && _fn.call(O[key], key, O[key])) {
						return key;
						break;
					}
					else if (O[key] == _fn) {
						return key;
						break;
					}
				}
			} else {
				for (; i < l;) {
					if (typeof O[i] != "undefined" && is_function(_fn) && _fn.call(O[i], i, O[i])) {
						return i;
						break;
					}
					else if (O[i] == _fn) {
						return i;
						break;
					}
					i++;
				}
			}
			return -1;
		}

		/**
		 * 배열의 왼쪽에서 오른쪽으로 연산을 진행하는데 수행한 결과가 왼쪽 값으로 반영되어 최종 왼쪽 값을 반환합니다.
		 * @method ax5.util.reduce
		 * @param {Array|Object} O
		 * @param {Function} _fn
		 * @returns {Alltypes}
		 * @example
		 * ```js
		 * var aarray = [5,4,3,2,1];
		 * result = ax5.util.reduce( aarray, function(p, n){
		 *   return p * n;
		 * });
		 * console.log(result, aarray);
		 * // 120 [5, 4, 3, 2, 1]
		 *
		 * ax5.util.reduce({a:1, b:2}, function(p, n){
		 *    return parseInt(p|0) + parseInt(n);
		 * });
		 * // 3
		 * ```
		 */
		function reduce(O, _fn) {
			var i, l, token_item;
			if (is_array(O)) {
				i = 0, l = O.length, token_item = O[i];
				for (; i < l - 1;) {
					if (typeof O[i] != "undefined") {
						if (( token_item = _fn.call(root, token_item, O[++i]) ) === false) break;
					}
				}
				return token_item;
			}
			else if (is_object(O)) {
				for (i in O) {
					if (typeof O[i] != "undefined") {
						if (( token_item = _fn.call(root, token_item, O[i]) ) === false) break;
					}
				}
				return token_item;
			}
			else {
				console.error("argument error : ax5.util.reduce - use Array or Object");
				return null;
			}
		}

		/**
		 * 배열의 오른쪽에서 왼쪽으로 연산을 진행하는데 수행한 결과가 오른쪽 값으로 반영되어 최종 오른쪽 값을 반환합니다.
		 * @method ax5.util.reduce_right
		 * @param {Array} O
		 * @param {Function} _fn
		 * @returns {Alltypes}
		 * @example
		 * ```js
		 * var aarray = [5,4,3,2,1];
		 * result = ax5.util.reduce_right( aarray, function(p, n){
		 *    console.log( n );
		 *    return p * n;
		 * });
		 * console.log(result, aarray);
		 * 120 [5, 4, 3, 2, 1]
		 * ```
		 */
		function reduce_right(O, _fn) {
			var i = O.length - 1, token_item = O[i];
			for (; i > 0;) {
				if (typeof O[i] != "undefined") {
					if (( token_item = _fn.call(root, token_item, O[--i]) ) === false) break;
				}
			}
			return token_item;
		}

		/**
		 * 배열또는 오브젝트의 각 아이템을 인자로 하는 사용자 함수의 결과가 참인 아이템들의 배열을 반환합니다.
		 * @method ax5.util.filter
		 * @param {Object|Array} O
		 * @param {Function} _fn
		 * @returns {Array}
		 * @example
		 * ```js
		 * var aarray = [5,4,3,2,1];
		 * result = ax5.util.filter( aarray, function(){
		 *    return this % 2;
		 * });
		 * console.log(result);
		 * // [5, 3, 1]
		 *
		 * var filObject = {a:1, s:"string", oa:{pickup:true, name:"AXISJ"}, os:{pickup:true, name:"AX5"}};
		 * result = ax5.util.filter( filObject, function(){
		 * 	return this.pickup;
		 * });
		 * console.log( ax5.util.to_json(result) );
		 * // [{"pickup": , "name": "AXISJ"}, {"pickup": , "name": "AX5"}]
		 * ```
		 */
		function filter(O, _fn) {
			if(is_nothing(O)) return [];
			var k, i = 0, l = O.length, results = [], fn_result;
			if (is_object(O)) {
				for (k in O) {
					if (typeof O[k] != "undefined") {
						if (fn_result = _fn.call(O[k], k, O[k])) results.push(O[k]);
					}
				}
			} else {
				for (; i < l;) {
					if (typeof O[i] != "undefined") {
						if (fn_result = _fn.call(O[i], i, O[i])) results.push(O[i]);
						i++;
					}
				}
			}
			return results;
		}

		/**
		 * Object를 JSONString 으로 반환합니다.
		 * @method ax5.util.to_json
		 * @param {Object|Array} O
		 * @returns {String} JSON
		 * @example
		 * ```js
		 * var ax = ax5.util;
		 * var myObject = {
		 *    a:1, b:"2", c:{axj:"what", arrs:[0,2,"3"]},
		 *    fn: function(abcdd){
		 *        return abcdd;
		 *    }
		 * };
		 * console.log( ax.to_json(myObject) );
		 * ```
		 */
		function to_json(O) {
			var json_string = "";
			if (ax5.util.is_array(O)) {
				var i = 0, l = O.length;
				json_string += "[";
				for (; i < l; i++) {
					if (i > 0) json_string += ",";
					json_string += to_json(O[i]);
				}
				json_string += "]";
			}
			else if (ax5.util.is_object(O)) {
				json_string += "{";
				var json_object_body = [];
				each(O, function (key, value) {
					json_object_body.push('"' + key + '": ' + to_json(value));
				});
				json_string += json_object_body.join(", ");
				json_string += "}";
			}
			else if (ax5.util.is_string(O)) {
				json_string = '"' + O + '"';
			}
			else if (ax5.util.is_number(O)) {
				json_string = O;
			}
			else if (ax5.util.is_undefined(O)) {
				json_string = "undefined";
			}
			else if (ax5.util.is_function(O)) {
				json_string = '"{Function}"';
			}
			return json_string;
		}

        /**
         * 관용의 JSON Parser
         * @method ax5.util.parse_json
         * @param {String} JSONString
         * @param {Boolean} [force] - 강제 적용 여부 (json 문자열 검사를 무시하고 오브젝트 변환을 시도합니다.)
         * @returns {Object}
         * @example
         * ```
         * console.log(ax5.util.parse_json('{"a":1}'));
         * // Object {a: 1} 
         * console.log(ax5.util.parse_json("{'a':1, 'b':'b'}"));
         * // Object {a: 1, b: "b"}
         * console.log(ax5.util.parse_json("{'a':1, 'b':function(){return 1;}}", true));
         * // Object {a: 1, b: function}
         * console.log(ax5.util.parse_json("{a:1}"));
         * // Object {a: 1}
         * console.log(ax5.util.parse_json("[1,2,3]"));
         * // [1, 2, 3]
         * console.log(ax5.util.parse_json("['1','2','3']"));
         * // ["1", "2", "3"]
         * console.log(ax5.util.parse_json("[{'a':'99'},'2','3']"));
         * // [Object, "2", "3"]
         * ```
         */
        function parse_json(str, force){
            if( force || (re_is_json).test(str) ){
                try {
                    return (new Function('', 'return ' + str))();
                }catch(e){
                    return {error:500, msg:'syntax error'};
                }
            }else {
                return {error:500, msg:'syntax error'};
            }
        }
		
		/**
		 * 타겟 오브젝트의 키를 대상 오브젝트의 키만큼 확장합니다.
		 * @method ax5.util.extend
		 * @param {Object} O - 타겟 오브젝트
		 * @param {Object} _O - 대상 오브젝트
		 * @param {Boolean} [overwrite=false] - 덮어쓰기 여부
		 * @returns {Object} extened Object
		 * @example
		 * ```js
		 * var axf = ax5.util;
		 * var obja = {a:1};
		 * axf.extend(obja, {b:2});
		 * axf.extend(obja, {a:2});
		 * axf.extend(obja, {a:2}, true);
		 * ```
		 */
		function extend(O, _O, overwrite) {
			if (typeof O !== "object" && typeof O !== "function") O = {};
			if (typeof _O === "string") O = _O;
			else {
				if (overwrite === true) {
					for (var k in _O) O[k] = _O[k];
				}
				else {
					for (var k in _O) if (typeof O[k] === "undefined") O[k] = _O[k];
				}
			}
			return O;
		}

		/**
		 * 타겟 오브젝트의 키를 대상 오브젝트의 키만큼 확장합니다. (깊숙히)
		 * @method ax5.util.extend_all
		 * @param {Object} O - 타겟 오브젝트
		 * @param {Object} _O - 대상 오브젝트
		 * @param {Boolean} [overwrite=false] - 덮어쓰기 여부
		 * @returns {Object} extened Object
		 * @example
		 * ```
		 * var aa = {a:1, b:{a:1, b:2}};
		 * ax5.util.extend_all(aa, {b:{a:2, c:3}});
		 * // {"a": 1, "b": {"a": 1, "b": 2, "c": 3}}
		 * // 덮어쓰지 않음.
		 * ax5.util.extend_all(aa, {b:{a:2, c:3}}, true);
		 * // {"a": 1, "b": {"a": 2, "b": 2, "c": 3}}
		 * // 덮어씀.
		 * ```
		 */
		function extend_all(O, _O, overwrite){
			if (typeof O !== "object" && typeof O !== "function") O = {};
			if (typeof _O === "string") O = _O;
			else {
				for (var k in _O){
					if(typeof O[k] === "undefined") {
						O[k] = _O[k];
					}
					else
					if(Object.prototype.toString.call(O[k]) == "[object Object]")
					{
						// 키값이 오브젝트인 경우.
						O[k] = extend_all(O[k], _O[k], overwrite);
					}
					else
					{
						if (overwrite === true) {
							O[k] = _O[k];
						}
					}
				}
			}
			return O;
		}

		/**
		 * 타겟 오브젝트를 복제하여 참조를 다르게 합니다.
		 * @method ax5.util.clone
		 * @param {Object} O - 타겟 오브젝트
		 * @returns {Object} clone Object
		 * @example
		 * ```js
		 * var axf = ax5.util;
		 * var obja = {a:1};
		 * var objb = axf.clone( obja );
		 * obja.a = 3; // 원본 오브젝트 수정
		 * console.log(obja, objb);
		 * // Object {a: 3} Object {a: 1}
		 * ```
		 */
		function clone(O) {
			return extend({}, O);
		}

		/**
		 * 인자의 타입을 반환합니다.
		 * @method ax5.util.get_type
		 * @param {Object|Array|String|Number|Element|Etc} O
		 * @returns {String} window|element|object|array|function|string|number|undefined|nodelist
		 * @example
		 * ```js
		 * var axf = ax5.util;
		 * var a = 11;
		 * var b = "11";
		 * console.log( axf.get_type(a) );
		 * console.log( axf.get_type(b) );
		 * ```
		 */
		function get_type(O) {
			var typeName;
			if(O != null && O == O.window){
				typeName = "window";
			}
			else if (!!(O && O.nodeType == 1)) {
				typeName = "element";
			}
			else if (!!(O && O.nodeType == 11)) {
				typeName = "fragment";
			}
			else if (typeof O === "undefined") {
				typeName = "undefined";
			}
			else if (_toString.call(O) == "[object Object]") {
				typeName = "object";
			}
			else if (_toString.call(O) == "[object Array]") {
				typeName = "array";
			}
			else if (_toString.call(O) == "[object String]") {
				typeName = "string";
			}
			else if (_toString.call(O) == "[object Number]") {
				typeName = "number";
			}
			else if (_toString.call(O) == "[object NodeList]") {
				typeName = "nodelist";
			}
			else if (typeof O === "function") {
				typeName = "function";
			}
			return typeName;
		}

		/**
		 * 오브젝트가 window 인지 판단합니다.
		 * @method ax5.util.is_window
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_window(O) {
			return O != null && O == O.window;
		}
		/**
		 * 오브젝트가 HTML 엘리먼트여부인지 판단합니다.
		 * @method ax5.util.is_element
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_element(O) {
			return !!(O && (O.nodeType == 1 || O.nodeType == 11));
		}
		/**
		 * 오브젝트가 Object인지 판단합니다.
		 * @method ax5.util.is_object
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_object(O) {
			return _toString.call(O) == "[object Object]";
		}
		/**
		 * 오브젝트가 Array인지 판단합니다.
		 * @method ax5.util.is_array
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_array(O) {
			return _toString.call(O) == "[object Array]";
		}
		/**
		 * 오브젝트가 Function인지 판단합니다.
		 * @method ax5.util.is_function
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_function(O) {
			return typeof O === "function";
		}
		/**
		 * 오브젝트가 String인지 판단합니다.
		 * @method ax5.util.is_string
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_string(O) {
			return _toString.call(O) == "[object String]";
		}
		/**
		 * 오브젝트가 Number인지 판단합니다.
		 * @method ax5.util.is_number
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_number(O) {
			return _toString.call(O) == "[object Number]";
		}
		/**
		 * 오브젝트가 NodeList인지 판단합니다.
		 * @method ax5.util.is_nodelist
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_nodelist(O) {
			return (_toString.call(O) == "[object NodeList]" || (O && O[0] && O[0].nodeType == 1));
		}
		/**
		 * 오브젝트가 undefined인지 판단합니다.
		 * @method ax5.util.is_undefined
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_undefined(O) {
			return typeof O === "undefined";
		}
		/**
		 * 오브젝트가 undefined이거나 null이거나 빈값인지 판단합니다.
		 * @method ax5.util.is_nothing
		 * @param {Object} O
		 * @returns {Boolean}
		 */
		function is_nothing(O) {
			return (typeof O === "undefined" || O === null || O === "");
		}
		/**
		 * 오브젝트의 첫번째 아이템을 반환합니다.
		 * @method ax5.util.first
		 * @param {Object|Array} O
		 * @returns {Object}
		 * @example
		 * ```js
		 * ax5.util.first({a:1, b:2});
		 * // Object {a: 1}
		 * ```
		 */
		function first(O) {
			if (is_object(O)) {
				var keys = Object.keys(O);
				var item = {};
				item[keys[0]] = O[keys[0]];
				return item;
			}
			else if (is_array(O)) {
				return O[0];
			}
			else {
				console.error("ax5.util.object.first", "argument type error");
				return undefined;
			}
		}
		/**
		 * 오브젝트의 마지막 아이템을 반환합니다.
		 * @method ax5.util.last
		 * @param {Object|Array} O
		 * @returns {Object}
		 * @example
		 * ```js
		 * ax5.util.last({a:1, b:2});
		 * // Object {b: 2}
		 * ```
		 */
		function last(O) {
			if (is_object(O)) {
				var keys = Object.keys(O);
				var item = {};
				item[keys[keys.length - 1]] = O[keys[keys.length - 1]];
				return item;
			}
			else if (is_array(O)) {
				return O[O.length - 1];
			}
			else {
				console.error("ax5.util.object.last", "argument type error");
				return undefined;
			}
		}

		/**
		 * 쿠키를 설정합니다.
		 * @method ax5.util.set_cookie
		 * @param {String} cname - 쿠키이름
		 * @param {String} cvalue - 쿠키값
		 * @param {Number} [exdays] - 쿠키 유지일수
		 * @param {Object} [opts] - path, domain 설정 옵션
		 * @example
		 * ```js
		 * ax5.util.set_cookie("jslib", "AX5");
		 * ax5.util.set_cookie("jslib", "AX5", 3);
		 * ax5.util.set_cookie("jslib", "AX5", 3, {path:"/", domain:".axisj.com"});
		 * ```
		 */
		function set_cookie(cn, cv, exdays, opts) {
			var expire;
			if (typeof exdays === "number") {
				expire = new Date();
				expire.setDate(expire.getDate() + exdays);
			}
			opts = opts || {};
			return (doc.cookie = [
				escape(cn), '=', escape(cv),
				expire      ? "; expires=" + expire.toUTCString() : "", // use expires attribute, max-age is not supported by IE
				opts.path    ? "; path=" + opts.path : "",
				opts.domain  ? "; domain=" + opts.domain : "",
				opts.secure  ? "; secure" : ""
			].join(""));
		}

		/**
		 * 쿠키를 가져옵니다.
		 * @method ax5.util.get_cookie
		 * @param {String} cname
		 * @returns {String} cookie value
		 * @example
		 * ```js
		 * ax5.util.get_cookie("jslib");
		 * ```
		 */
		function get_cookie(cname) {
			var name = cname + "=";
			var ca = doc.cookie.split(';'), i = 0, l = ca.length;
			for (; i < l; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1);
				if (c.indexOf(name) != -1) return unescape(c.substring(name.length, c.length));
			}
			return "";
		}

		/**
		 * ax5 require
		 * @method ax5.util.require
		 * @param {Array} mods - load modules
		 * @param {Function} callBack - 로드 성공시 호출함수
		 * @param {Function} [errorBack] - 로드 실패시 호출함수
		 * @example
		 * ```js
		 * ax5.info.base_url = "../src/";
		 * ax5.util.require(["ax5_class_sample.js"], function(){
		 * 	alert("ok");
		 * });
		 * ```
		 */
		// RequireJS 2.1.15 소스코드 참고
		function require(mods, callBack, errorBack) {
			var
				head = doc.head || doc.getElementsByTagName("head")[0],
				readyRegExp = info.is_browser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/,
				loadCount = mods.length, loadErrors = [], loaded_src = {}, onloadTimer, onerrorTimer, returned = false,
				scripts = dom.get("script[src]"), styles = dom.get("style[href]"),
				onload = function () {
					if (loadCount < 1 && loadErrors.length == 0 && !returned) {
						if (callBack) callBack({});
						returned = true;
					}
				},
				onerror = function () {
					if (loadCount < 1 && loadErrors.length > 0 && !returned) {
						console.error(loadErrors);
						if (errorBack) errorBack({
							type: "loadFail",
							list: loadErrors
						});
						returned = true;
					}
				};

			// 로드해야 할 모듈들을 doc.head에 삽입하고 로드가 성공여부를 리턴합니다.
			for (var i = 0, l = mods.length; i < l; i++) {
				var src = mods[i], type = right(src, "."), hasPlugin = false,
					plugin, plugin_src = info.base_url + src, attr_nm = (type === "js") ? "src" : "href",
					plug_load, plug_err, s = scripts.length;

				while(s--){
					if (scripts[s].getAttribute(attr_nm) === plugin_src) {
						hasPlugin = true;
						break;
					}
				}

				if (hasPlugin) {

					loadCount--;
					onload();

				} else {

					plugin = (type === "js") ?
						dom.create("script", {type: "text/javascript", src: plugin_src, "data-src": plugin_src}) :
						dom.create("link", {rel: "stylesheet", type: "text/css", href: plugin_src});

					plug_load = function (e, plugin_src) {
						if (e && ( e.type === 'load' || readyRegExp.test((e.currentTarget || e.srcElement).readyState) )){
							if(!loaded_src[plugin_src]) loadCount--;
							if (onloadTimer) clearTimeout(onloadTimer);
							onloadTimer = setTimeout(onload, 1);
						}
					},
					plug_err = function (e) {
						loadCount--;
						loadErrors.push({
							src: info.base_url + src, error:e
						});
						if (onerrorTimer) clearTimeout(onerrorTimer);
						onerrorTimer = setTimeout(onerror, 1);
					};

					ax5.xhr({
						url : plugin_src, contentType: "",
						res : function (response, status) {
							var time_id, hasPlugin = false, scripts = dom.get("script[src]"), s = scripts.length;
							while(s--){
								if (scripts[s].getAttribute(attr_nm) === plugin_src) {
									hasPlugin = true;
									break;
								}
							}

							if(!hasPlugin) head.appendChild(plugin);
							plugin.onload = function(e) {
								plug_load(e, plugin_src);
								if(time_id) clearTimeout(time_id);
							};
							time_id = setTimeout(function(){
								plug_load({type: "load"}, plugin_src);
							}, 500);
						},
						error : function () {
							plug_err(this);
						}
					});
				}
			}
		}

		/**
		 * jsonString 으로 alert 합니다.
		 * @method ax5.util.alert
		 * @param {Object|Array|String|Number} O
		 * @returns {Object|Array|String|Number} O
		 * @example ```js
		 * ax5.util.alert({a:1,b:2});
		 * ax5.util.alert("정말?");
		 * ```
		 */
		function alert(O) {
			win.alert(to_json(O));
			return O;
		}

		/**
		 * 문자열의 특정 문자열까지 잘라주거나 원하는 포지션까지 잘라줍니다.
		 * @method ax5.util.left
		 * @param {String} str - 문자열
		 * @param {String|Number} pos - 찾을 문자열 또는 포지션
		 * @returns {String}
		 * @example
		 * ```js
		 * ax5.util.left("abcd.efd", 3);
		 * // abc
		 * ax5.util.left("abcd.efd", ".");
		 * // abcd
		 * ```
		 */
		function left(str, pos) {
			if (typeof str === "undefined" || typeof pos === "undefined") return "";
			if (is_string(pos)) {
				return (str.indexOf(pos) > -1) ? str.substr(0, str.indexOf(pos)) : str;
			} else if (is_number(pos)) {
				return str.substr(0, pos);
			} else {
				return "";
			}
		}

		/**
		 * 문자열의 특정 문자열까지 잘라주거나 원하는 포지션까지 잘라줍니다.
		 * @method ax5.util.right
		 * @param {String} str - 문자열
		 * @param {String|Number} pos - 찾을 문자열 또는 포지션
		 * @returns {String}
		 * @example
		 * ```js
		 * ax5.util.right("abcd.efd", 3);
		 * // efd
		 * ax5.util.right("abcd.efd", ".");
		 * // efd
		 * ```
		 */
		function right(str, pos) {
			if (typeof str === "undefined" || typeof pos === "undefined") return "";
			str = ''+str;
			if (is_string(pos)) {
				return (str.lastIndexOf(pos) > -1) ? str.substr(str.lastIndexOf(pos) + 1) : str;
			} else if (is_number(pos)) {
				return str.substr(str.length - pos);
			} else {
				return "";
			}
		}

		/**
		 * css형 문자열이나 특수문자가 포함된 문자열을 카멜케이스로 바꾸어 반환합니다.
		 * @method ax5.util.camel_case
		 * @param {String} str
		 * @returns {String}
		 * @example
		 * ```js
		 * ax5.util.camel_case("inner-width");
		 * ax5.util.camel_case("inner_width");
		 * // innerWidth
		 * ```
		 */
		function camel_case(str) {
			return str.replace(re_ms, "ms-").replace(re_snake_case, function (all, letter) {
				return letter.toUpperCase();
			});
		}

		/**
		 * css형 문자열이나 카멜케이스문자열을 스네이크 케이스 문자열로 바꾸어 반환합니다.
		 * @method ax5.util.snake_case
		 * @param {String} str
		 * @returns {String}
		 * @example
		 * ```js
		 * ax5.util.snake_case("innerWidth");
		 * ax5.util.snake_case("inner-Width");
		 * ax5.util.snake_case("inner_width");
		 * // inner-width
		 * ```
		 */
		function snake_case(str) {
			return camel_case(str).replace(re_camel_case, function (all, letter) {
				return "-" + letter.toLowerCase();
			});
		}

		/**
		 * 문자열에서 -. 을 제외한 모든 문자열을 제거하고 숫자로 반환합니다. 옵션에 따라 원하는 형식의 숫자로 변환 할 수 도 있습니다.
		 * @method ax5.util.number
		 * @param {String|Number} str
		 * @param {Object} cond - 옵션
		 * @returns {String|Number}
		 * @example
		 * ```js
		 * var cond = {
		 * 	round: {Number|Boolean} - 반올림할 자릿수,
		 * 	money: {Boolean} - 통화,
		 * 	abs: {Boolean} - 절대값,
		 * 	byte: {Boolean} - 바이트
		 * }
		 *
		 * console.log(ax5.util.number(123456789.678, {round:1}));
		 * console.log(ax5.util.number(123456789.678, {round:1, money:true}));
		 * console.log(ax5.util.number(123456789.678, {round:2, byte:true}));
		 * console.log(ax5.util.number(-123456789.8888, {abs:true, round:2, money:true}));
		 * console.log(ax5.util.number("A-1234~~56789.8~888PX", {abs:true, round:2, money:true}));
		 *
		 * //123456789.7
		 * //123,456,789.7
		 * //117.7MB
		 * //123,456,789.89
		 * //123,456,789.89
		 * ```
		 */
		function number(str, cond) {
			var result, pair = ('' + str).split(re_dot), isMinus = (Number(pair[0]) < 0 || pair[0] == "-0"), returnValue = 0.0;
			pair[0] = pair[0].replace(re_int, "");
			if (pair[1]) {
				pair[1] = pair[1].replace(re_not_num, "");
				returnValue = Number(pair[0] + "." + pair[1]) || 0;
			} else {
				returnValue = Number(pair[0]) || 0;
			}
			result = (isMinus) ? -returnValue : returnValue;

			each(cond, function (k, c) {
				if (k == "round") {
					if(is_number(c)){
						if(c < 0){
							result = +(Math.round(result + "e-" + Math.abs(c)) + "e+" + Math.abs(c));
						}else{
							result = +(Math.round(result + "e+" + c) + "e-" + c);
						}
					}else{
						result = Math.round(result);
					}
				}
				else if (k == "money") {
					result = (function (val) {
						var txtNumber = '' + val;
						if (isNaN(txtNumber) || txtNumber == "") {
							return "";
						}
						else {
							var arrNumber = txtNumber.split('.');
							arrNumber[0] += '.';
							do {
								arrNumber[0] = arrNumber[0].replace(re_money_split, '$1,$2');
							} while (re_money_split.test(arrNumber[0]));
							if (arrNumber.length > 1) {
								return arrNumber.join('');
							} else {
								return arrNumber[0].split('.')[0];
							}
						}
					})(result);
				}
				else if (k == "abs") {
					result = Math.abs(Number(result));
				}
				else if (k == "byte") {
					result = (function (val) {
						val = Number(result);
						var n_unit = "KB";
						var myByte = val / 1024;
						if (myByte / 1024 > 1) {
							n_unit = "MB";
							myByte = myByte / 1024;
						}
						if (myByte / 1024 > 1) {
							n_unit = "GB";
							myByte = myByte / 1024;
						}
						return number(myByte, {round: 1}) + n_unit;
					})(result);
				}
			});

			return result;
		}

		/**
		 * 배열 비슷한 오브젝트를 배열로 변환해줍니다.
		 * @method ax5.util.to_array
		 * @param {Object|Elements|Arguments} O
		 * @returns {Array}
		 * @example
		 * ```js
		 * ax5.util.to_array(arguments);
		 * //
		 * ```
		 */
		function to_array(O) {
			if (typeof O.length != "undefined") return Array.prototype.slice.call(O);
			return [];
		}

		/**
		 * 천번째 인자에 두번째 인자 아이템을 합쳐줍니다. concat과 같은 역할을 하지만. 인자가 Array타입이 아니어도 됩니다.
		 * @method ax5.util.merge
		 * @param {Array|ArrayLike} first
		 * @param {Array|ArrayLike} second
		 * @returns {Array} first
		 * @example
		 * ```
		 *
		 * ```
		 */
		function merge(first, second) {
			var l = second.length,
				i = first.length,
				j = 0;

			if (typeof l === "number") {
				for (; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		}

		/**
		 * 오브젝트를 파라미터형식으로 또는 파라미터를 오브젝트 형식으로 변환합니다.
		 * @method ax5.util.param
		 * @param {Object|Array|String} O
		 * @param {String} [cond] - param|object
		 * @returns {Object|String}
		 * @example
		 * ```
		 * ax5.util.param({a:1,b:'1232'}, "param");
		 * ax5.util.param("a=1&b=1232", "param");
		 * // "a=1&b=1232"
		 * ax5.util.param("a=1&b=1232");
		 * // {a: "1", b: "1232"}
		 * ```
		 */
		function param(O, cond) {
			var p;
			if (is_string(O) && typeof cond !== "undefined" && cond == "param") {
				return O;
			}
			else
			if ( (is_string(O) && typeof cond !== "undefined" && cond == "object") || (is_string(O) && typeof cond === "undefined") ){
				p = {};
				each(O.split(re_amp), function () {
					var item = this.split(re_eq);
					p[item[0]] = item[1];
				});
				return p;
			}
			else
			{
				p = [];
				each(O, function (k, v) {
					p.push(k + "=" + escape(v));
				});
				return p.join('&');
			}
		}

		function encode(s) {
			return encodeURIComponent(s);
		}

		function decode(s) {
			return decodeURIComponent(s);
		}

		function error(){
			ax5.info.onerror.apply(this, arguments);
		}

		/**
		 * webGl context 에 적용할 셰이더를 셰이더 스크립트로 부터 변환합니다.
		 * @method ax5.util.get_shader
		 * @param {WebGLRenderingContext} gl
		 * @param {script|String|Array} script
		 * @param {String} [typ] - x-shader/x-fragment|x-shader/x-vertex
		 * @returns {shader}
		 */
		function get_shader(gl, script, typ){
			if (!script) {
				return null;
			}

			var str = "", s, shader;
			if(is_string(script) || is_array(script)){
				str = [].concat(script).join('');
				if (typ == "x-shader/x-fragment") {
					shader = gl.createShader(gl.FRAGMENT_SHADER);
				} else if (typ == "x-shader/x-vertex") {
					shader = gl.createShader(gl.VERTEX_SHADER);
				} else {
					return null;
				}
			}
			else
			{
				s = script.firstChild;
				while (s) {
					if (s.nodeType == 3) {
						str += s.textContent;
					}
					s = s.nextSibling;
				}
				if (script.type == "x-shader/x-fragment") {
					shader = gl.createShader(gl.FRAGMENT_SHADER);
				} else if (script.type == "x-shader/x-vertex") {
					shader = gl.createShader(gl.VERTEX_SHADER);
				} else {
					return null;
				}
			}

			gl.shaderSource(shader, str);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		}

		var requestAnimFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
					window.setTimeout(callback, 1000/60);
				};
		})();

		function request_ani_frame(o){
			requestAnimFrame(o);
		}

		/**
		 * 날짜 형식의 문자열이나 Date객체를 조건에 맞게 처리 한 후 원하는 return 값으로 반환합니다.
		 * @method ax5.util.date
		 * @param {String|Date} d
		 * @param {Object} cond
		 * @returns {Date|String}
		 * @example
		 * ```js
		 * ax5.util.date('2013-01-01'); // Tue Jan 01 2013 23:59:00 GMT+0900 (KST)
		 * ax5.util.date((new Date()), {add:{d:10}, return:'yyyy/mm/dd'}); // "2015/07/01"
		 * ax5.util.date('1919-03-01', {add:{d:10}, return:'yyyy/mm/dd'}); // "1919/03/11"
		 * ```
		 */
		function date(d, cond){
			function local_date(yy, mm, dd, hh, mi, ss){
				var utc_d, local_d;
				local_d = new Date();
				if(typeof hh === "undefined") hh = 23;
				if(typeof mi === "undefined") mi = 59;
				utc_d = new Date(Date.UTC(yy, mm, dd||1, hh, mi, ss||0));

				if(mm == 0 && dd == 1 && utc_d.getUTCHours() + (utc_d.getTimezoneOffset()/60) < 0){
					utc_d.setUTCHours(0);
				}else{
					utc_d.setUTCHours(utc_d.getUTCHours() + (utc_d.getTimezoneOffset()/60));
				}
				return utc_d;
			}

			var yy, mm, dd, hh, mi,
				aDateTime, aTimes, aTime, aDate,
				utc_d, local_d,
				va;

			if(is_string(d)){
				if(d.length == 0){
					d = new Date();
				}
				else if (d.length > 15) {
					aDateTime = d.split(/ /g), aTimes, aTime,
					aDate = aDateTime[0].split(/\D/g),
					yy = aDate[0];
					mm = parseFloat(aDate[1]);
					dd = parseFloat(aDate[2]);
					aTime = aDateTime[1] || "09:00";
					aTimes = aTime.left(5).split(":");
					hh = parseFloat(aTimes[0]);
					mi = parseFloat(aTimes[1]);
					if (aTime.right(2) === "AM" || aTime.right(2) === "PM") hh += 12;
					d = local_date(yy, mm-1, dd, hh, mi);
				}
				else if(d.length == 14){
					va = d.replace(/\D/g, "");
					d = local_date(va.substr(0, 4), va.substr(4, 2)-1, number(va.substr(6, 2)), number(va.substr(8, 2)), number(va.substr(10, 2)), number(va.substr(12, 2)));
				}
				else if (d.length > 7) {
					va = d.replace(/\D/g, "");
					d = local_date(va.substr(0, 4), va.substr(4, 2)-1, number(va.substr(6, 2)));
				}
				else if (d.length > 4) {
					va = d.replace(/\D/g, "");
					d = local_date(va.substr(0, 4), va.substr(4, 2)-1, 1);
				}
				else if (d.length > 2) {
					va = d.replace(/\D/g, "");
					return local_date(va.substr(0, 4), va.substr(4, 2)-1, 1);
				}
				else
				{
					d = new Date();
				}
			}

			if(typeof cond === "undefined"){
				return d;
			}
			else
			{
				if(cond["add"]){
					d = (function(_d, opts){
						var
							yy, mm, dd, mxdd,
							DyMilli = ((1000 * 60) * 60) * 24;

						if (typeof opts["d"] !== "undefined") {
							_d.setTime(_d.getTime() + (opts["d"] * DyMilli));
						}
						else if (typeof opts["m"] !== "undefined") {
							yy = _d.getFullYear();
							mm = _d.getMonth();
							dd = _d.getDate();
							yy = yy + parseInt(opts["m"] / 12);
							mm += opts["m"] % 12;
							mxdd = days_of_month(yy, mm);
							if (mxdd < dd) dd = mxdd;
							_d = new Date(yy, mm, dd, 12);
						} else if (typeof opts["y"] !== "undefined") {
							_d.setTime(_d.getTime() + ((opts["y"] * 365) * DyMilli));
						} else {
							_d.setTime(_d.getTime() + (opts["y"] * DyMilli));
						}
						return _d;
					})(new Date(d), cond["add"]);
				}
				if(cond["return"]){
					return (function(){
						var fStr = cond["return"], nY, nM, nD, nH, nMM, nS, nDW;

						nY = d.getUTCFullYear();
						nM = set_digit(d.getMonth() + 1, 2);
						nD = set_digit(d.getDate(), 2);
						nH = set_digit(d.getHours(), 2);
						nMM = set_digit(d.getMinutes(), 2);
						nS = set_digit(d.getSeconds(), 2);
						nDW = d.getDay();

						var yre = /[^y]*(yyyy)[^y]*/gi; yre.exec(fStr); var regY = RegExp.$1;
						var mre = /[^m]*(mm)[^m]*/gi; mre.exec(fStr); var regM = RegExp.$1;
						var dre = /[^d]*(dd)[^d]*/gi; dre.exec(fStr); var regD = RegExp.$1;
						var hre = /[^h]*(hh)[^h]*/gi; hre.exec(fStr); var regH = RegExp.$1;
						var mire = /[^m]*(mi)[^i]*/gi; mire.exec(fStr); var regMI = RegExp.$1;
						var sre = /[^s]*(ss)[^s]*/gi; sre.exec(fStr); var regS = RegExp.$1;
						var dwre = /[^d]*(dw)[^w]*/gi; dwre.exec(fStr); var regDW = RegExp.$1;

						if (regY === "yyyy") {
							fStr = fStr.replace(regY, right(nY, regY.length));
						}
						if (regM === "mm") {
							if (regM.length == 1) nM = (d.getMonth() + 1);
							fStr = fStr.replace(regM, nM);
						}
						if (regD === "dd") {
							if (regD.length == 1) nD = d.getDate();
							fStr = fStr.replace(regD, nD);
						}
						if (regH === "hh") {
							fStr = fStr.replace(regH, nH);
						}
						if (regMI === "mi") {
							fStr = fStr.replace(regMI, nMM);
						}
						if (regS === "ss") {
							fStr = fStr.replace(regS, nS);
						}
						if (regDW == "dw") {
							fStr = fStr.replace(regDW, info.week_names[nDW].label);
						}
						return fStr;
					})();
				}
				else{
					return d;
				}
			}
		}

		/**
		 * 원하는 횟수 만큼 자릿수 맞춤 문자열을 포함한 문자열을 반환합니다.
		 * @method ax5.util.set_digit
		 * @param {String|Number} num
		 * @param {Number} length
		 * @param {String} [padder=0]
		 * @param {Number} [radix]
		 * @returns {String}
		 */
		function set_digit(num, length, padder, radix){
			var s = num.toString(radix || 10);
			return times( (padder || '0'), (length - s.length) ) + s;
		}

		function times(s, count) { return count < 1 ? '' : new Array(count + 1).join(s); }

		/**
		 * 년월에 맞는 날자수를 반환합니다.
		 * @method ax5.util.days_of_month
		 * @param {Number} y
		 * @param {Number} m
		 * @returns {Number}
		 */
		function days_of_month(y, m) {
			if(m == 3 || m == 5 || m == 8 || m == 10){
				return 30;
			}
			else if(m == 1){
				return (((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0)) ? 29 : 28;
			}
			else{
				return 31;
			}
		}

		return {
            alert       : alert,
            each        : each,
            map         : map,
            search      : search,
            reduce      : reduce,
            reduce_right: reduce_right,
            filter      : filter,
            to_json     : to_json,
            parse_json  : parse_json,
            extend      : extend,
            extend_all  : extend_all,
            clone       : clone,
            first       : first,
            last        : last,
            left        : left,
            right       : right,
            get_type    : get_type,
            is_window   : is_window,
            is_element  : is_element,
            is_object   : is_object,
            is_array    : is_array,
            is_function : is_function,
            is_string   : is_string,
            is_number   : is_number,
            is_nodelist : is_nodelist,
            is_undefined: is_undefined,
            is_nothing  : is_nothing,
            set_cookie  : set_cookie,
            get_cookie  : get_cookie,
            require     : require,
            camel_case  : camel_case,
            snake_case  : snake_case,
            number      : number,
            to_array    : to_array,
            merge       : merge,
            param       : param,
			error       : error,
			get_shader  : get_shader,
			request_ani_frame : request_ani_frame,
			date        : date,
			set_digit   : set_digit,
			times       : times,
			days_of_month : days_of_month
		}
	})();

	/**
	 * Refer to this by {@link ax5}. <br/>
	 * dom0는 dom(query)를 줄여서 칭하는 말 입니다. ax5.dom 에 있는 함수들과는 다른 개념입니다. ax5.dom0는 query에 의해 만들어진 인스턴스 입니다.
	 * @namespace ax5.dom0
	 * @param {String} query
	 * @example
	 * ```
	 * ax5.dom("#elementid");
	 * var ax = ax5.dom;
	 * ax("#elementid");
	 * // 처러 사용할 수 있습니다.
	 * ```
	 */

	/**
	 * Refer to this by {@link ax5}.
	 * @namespace ax5.dom
	 */
	// dom class instance
	ax5.dom = dom = function (query) {
		var axdom = (function () {
			function ax(query) {
				this.toString = function () {
					return "[object ax5.dom]";
				};
				if(typeof query === 'undefined') {
					U.error("ax5.dom(undefined) is error ");
					return;
				}
				/**
				 * query selected elements
				 * @member {Array} ax5.dom0.elements
				 * @example
				 * ```
				 * ax5.dom("[data-ax-grid").elements
				 * ```
				 */
				this.elements = dom.get(query);
				/**
				 * query selected elements length
				 * @member {Number} ax5.dom0.length
				 * @example
				 * ```
				 * ax5.dom("[data-ax-grid").length
				 * ```
				 */
				this.length = this.elements.length;
				/**
				 * elements에 css 값을 적용또는 반환합니다.
				 * @method ax5.dom0.css
				 * @param {Object|Array|String} O
				 * @returns {ax5.dom0|String|Object}
				 * @example
				 * ```js
				 * ax5.dom("[data-ax-grid]").css({"color":"#ff3300", border:"1px solid #000"});
				 * console.log( ax5.dom("[data-ax-grid]").css("color") );
				 * // rgb(255, 51, 0)
				 * console.log( ax5.dom("[data-ax-grid]").css(["border","color"]) );
				 * // {border: "1px solid rgb(0, 0, 0)", color: "rgb(255, 51, 0)"}
				 * ```
				 */
				this.css = function (O) {
					var rs = dom.css(this.elements, O);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * elements에 className 를 추가, 제거, 확인, 토글합니다.
				 * @method ax5.dom0.class_name
				 * @param {String} [command=has] - add,remove,toggle,has
				 * @param {String} O - 클래스명
				 * @returns {ax5.dom0|String} return - ax5.dom 또는 클래스이름
				 * @example
				 * ```
				 * console.log(
				 * ax5.dom("[data-ax-grid=A]").class_name("A"),
				 * ax5.dom("[data-ax-grid='A']").class_name("has","A")
				 * );
				 * ax5.dom("[data-ax-grid=A]").class_name("add", "adclass").class("remove", "adclass").class("remove", "A");
				 *
				 * ax5.dom("[data-ax-grid=A]").class_name("toggle", "red");
				 * ax5.dom("[data-ax-grid=\"9B\"]").class_name("toggle", "red");
				 * ```
				 */
				this.class_name = function (command, O) {
					var rs = dom.class_name(this.elements, command, O);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * elements에 이벤트를 바인드 합니다.
				 * @method ax5.dom0.on
				 * @param {String} typ - 이벤트 타입
				 * @param {Function} _fn - 이벤트 콜백함수
				 * @returns {ax5.dom0}
				 * @example
				 * ```js
				 * var axd = ax5.dom;
				 * var mydom = axd("[data-event-test=text-box]"),
				 * remove_dom = axd("[data-event-test=remove]");
				 *
				 * mydom.on("click", window.fna);
				 * mydom.on("click", window.fnb);
				 * mydom.on("click", window.fnc);
				 *
				 * remove_dom.on("click", function(){
				 *    mydom.off("click", window.fna);
				 *    remove_dom.off("click");
				 *    alert("이벤트 제거");
				 * });
				 *
				 * // 핸들방식
				 * axd("[data-event-test=text-box]").on("click.fna", window.fna);
				 * axd("[data-event-test=text-box]").on("click.fnb", window.fnb);
				 * axd("[data-event-test=text-box]").on("click.fnc", window.fnc);
				 * ```
				 */
					// todo: event type 모두 체크
				this.on = function (typ, _fn) {
					dom.on(this.elements, typ, _fn);
					return this;
				};
				/**
				 * elements에 이벤트를 언바인드 합니다.
				 * @method ax5.dom0.off
				 * @param {String} typ - 이벤트 타입
				 * @param {Function} [_fn] - 이벤트 콜백함수
				 * @returns {ax5.dom0}
				 * @example
				 * ```js
				 * var axd = ax5.dom;
				 * axd("[data-event-test=text-box]").off("click");
				 * axd("[data-event-test=text-box]").off("click.fnb").off("click.fnc");
				 * ```
				 */
				this.off = function (typ, _fn) {
					dom.off(this.elements, typ, _fn);
					return this;
				};
				// todo : setAttributeNS, setAttribute 차이 찾아보기
				/**
				 * element의 attribute를 추가 삭제 가져오기 합니다.
				 * @method ax5.dom0.attr
				 * @param {Object|String|null} O - json타입또는 문자열
				 * @returns {ax5.dom0|String}
				 * @example
				 * ```js
				 * // set attribute
				 * ax5.dom("[data-ax-grid=A]").attr({"data-ax-spt":"9999", "data-next":"next"});
				 * // get or read
				 * console.log( ax5.dom("[data-ax-grid=A]").attr("data-ax-spt") );
				 * // remove attribute, set null
				 * ax5.dom("[data-ax-grid=A]").attr({"data-next2":null});
				 * ```
				 */
				this.attr = function (O) {
					var rs = dom.attr(this.elements, O);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * element의 attribute를 추가 삭제 가져오기 합니다.
				 * @method ax5.dom0.find
				 * @param {String} query - selector query
				 * @returns {ax5.dom0} ax5.dom0
				 * @example
				 * ```
				 *
				 * ```
				 */
				this.find = function (query) {
					return new axdom(dom.get(this.elements[0], query));
				};

				/**
				 * 형제 엘리먼트중에 다음에 위치한 엘리먼트를 반환합니다.
				 * @method ax5.dom0.next
				 * @param {Number} [times=0] - 횟수
				 * @returns {axdom} ax5.dom0
				 * @example
				 * ```
				 * <div>
				 * 	 <ul id="list-container">
				 * 		 <li data-list-item="0" id="li0">
				 * 		    <div>child>child</div>
				 * 		 </li>
				 * 		 <li data-list-item="1" id="li1"></li>
				 * 		 <li data-list-item="2" id="li2"></li>
				 * 		 <li data-list-item="3" id="li3"></li>
				 * 		 <li data-list-item="4" id="li4"></li>
				 * 		 <li data-list-item="5" id="li5"></li>
				 * 	 </ul>
				 * </div>
				 * <script>
				 * var el = ax5.dom("#list-container");
				 * var li = el.child(el);
				 *
				 * console.log(
				 * 	 (c_li = li.next(2)).elements[0].id,
				 * 	 (c_li = c_li.prev()).elements[0].id
				 * );
				 * </script>
				 * ```
				 */
				this.prev = function (times) {
					return new axdom(dom.prev(this.elements, times));
				};
				/**
				 * 형제 엘리먼트중에 이전에 위치한 엘리먼트를 반환합니다.
				 * @method ax5.dom0.prev
				 * @param {Number} [times=0] - 횟수
				 * @returns {ax5.dom0} ax5.dom0
				 * @example
				 * ```
				 * <div>
				 * 	 <ul id="list-container">
				 * 		 <li data-list-item="0" id="li0">
				 * 		    <div>child>child</div>
				 * 		 </li>
				 * 		 <li data-list-item="1" id="li1"></li>
				 * 		 <li data-list-item="2" id="li2"></li>
				 * 		 <li data-list-item="3" id="li3"></li>
				 * 		 <li data-list-item="4" id="li4"></li>
				 * 		 <li data-list-item="5" id="li5"></li>
				 * 	 </ul>
				 * </div>
				 * <script>
				 * var el = ax5.dom("#list-container");
				 * var li = el.child(el);
				 *
				 * console.log(
				 * 	 (c_li = li.next(2)).elements[0].id,
				 * 	 (c_li = c_li.prev()).elements[0].id
				 * );
				 * </script>
				 * ```
				 */
				this.next = function (times) {
					return new axdom(dom.next(this.elements, times));
				};

				/**
				 * 타겟엘리먼트의 부모 엘리멘트 트리에서 원하는 조건의 엘리먼트를 얻습니다.
				 * @method ax5.dom0.parent
				 * @param {Object} cond - 원하는 element를 찾을 조건
				 * @returns {ax5.dom0} ax5.dom0 - 부모엘리먼트로 만들어진 새로운 ax5.dom0
				 * @example
				 * ```
				 * var dom_child = ax5.dom("#list-container").child();
				 * console.log(
				 *    dom_child.parent({tagname:"div", clazz:"ax5-sample-view"}).elements[0]
				 * );
				 * console.log(
				 *    ax5.dom(dom_child).parent({tagname:"div", clazz:"ax5-sample-view"}).elements[0]
				 * );
				 * // 같은 결과
				 * ```
				 */
				this.parent = function (cond) {
					return new axdom(dom.parent(this.elements, cond));
				};
				/**
				 * 타겟 엘리먼트의 자식들을 반환합니다.
				 * @method ax5.dom0.child
				 * @returns {ax5.dom0} ax5.dom0 - 자식엘리먼트로 만들어진 새로운 ax5.dom0
				 * @example
				 * ```
				 * var dom_child = ax5.dom("#list-container").child();
				 * ax5.dom(dom_child).child();
				 * dom_child.child();
				 * // 원하는 대로~
				 * ```
				 */
				this.child = function () {
					return new axdom(dom.child(this.elements));
				};
				/**
				 * 타겟 엘리먼트의 너비를 반환합니다.
				 * @method ax5.dom0.width
				 * @returns {Number}
				 * @example
				 * ```
				 * console.log(
				 * 	 ax5.dom("#list-container").css({"width":"400px", "box-sizing":"border-box",
				 * 	 "border":"2px solid", "padding":"50px"}).css({"background":"#ccc"}).width()
				 * );
				 * console.log(
				 *    ax5.dom("#list-container").css({"width":"400px", "box-sizing":"content-box",
				 * 	"border":"2px solid", "padding":"50px"}).css({"background":"#ccc"}).width()
				 * );
				 * ```
				 */
				this.width = function () {
					return dom.width(this.elements);
				};
				/**
				 * 타겟 엘리먼트의 높이를 반환합니다.
				 * @method ax5.dom0.height
				 * @returns {Number}
				 * @example
				 * ```
				 * // width 와 동일
				 * ```
				 */
				this.height = function () {
					return dom.height(this.elements);
				};
				/**
				 * 타겟 엘리먼트안에 HTML코드를 바꿔치기 합니다.
				 * @method ax5.dom0.html
				 * @returns {ax5.dom0|String}
				 * @example
				 * ```
				 * console.log( ax5.dom("#list-container").html() );
				 * ax5.dom("#list-container").html("<a href='#1234'>링크");
				 * ```
				 */
				this.html = function (val) {
					var rs = dom.html(this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트에 자식노드를 추가 합니다. (추가되는 위치는 맨 아래 입니다.)
				 * @method ax5.dom0.append
				 * @param {String|Element} val
				 * @returns {ax5.dom0}
				 * @example
				 * ```
				 * ax5.dom("[data-list-item='0']")
				 * .append("ㅈㅏㅇㄱㅣㅇㅕㅇ")
				 * .append("<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>")
				 * .append(ax5.dom.get("#move-item"));
				 * ```
				 */
				this.append = function (val) {
					var rs = dom.manipulate("append", this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트에 자식노드를 추가 합니다. (추가되는 위치는 맨 위 입니다.)
				 * @method ax5.dom0.prepend
				 * @param {String|Element} val
				 * @returns {ax5.dom0}
				 * @example
				 * ```
				 * ax5.dom("[data-list-item='0']")
				 * .prepend("ㅈㅏㅇㄱㅣㅇㅕㅇ")
				 * .prepend("<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>")
				 * .prepend(ax5.dom.get("#move-item"));
				 * ```
				 */
				this.prepend = function (val) {
					var rs = dom.manipulate("prepend", this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트 이전위치에 노드를 추가 합니다.
				 * @method ax5.dom0.before
				 * @param {String|Element} val
				 * @returns {ax5.dom0}
				 * @example
				 * ```
				 * ax5.dom("[data-list-item='0']")
				 * .before("ㅈㅏㅇㄱㅣㅇㅕㅇ")
				 * .before("<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>")
				 * .before(ax5.dom.get("#move-item"));
				 * ```
				 */
				this.before = function (val) {
					var rs = dom.manipulate("before", this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트 다음위치에 노드를 추가 합니다.
				 * @method ax5.dom0.after
				 * @param {String|Element} val
				 * @returns {ax5.dom0}
				 * @example
				 * ```
				 * ax5.dom("[data-list-item='0']")
				 * .after("ㅈㅏㅇㄱㅣㅇㅕㅇ")
				 * .after("<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>")
				 * .after(ax5.dom.get("#move-item"));
				 * ```
				 */
				this.after = function (val) {
					var rs = dom.manipulate("after", this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트 다음위치에 노드를 추가 합니다.
				 * @method ax5.dom0.remove
				 * @example
				 * ```
				 * ax5.dom("[data-list-item='0']").remove();
				 * ```
				 */
				this.remove = function () {
					return dom.remove(this.elements);
				};
				/**
				 * 엘리먼트의 offset 값을 반환합니다.
				 * @method ax5.dom0.offset
				 * @param {Elements|Element} elements
				 * @returns {Object}
				 * @example
				 * ```
				 * console.log(
				 * 	ax5.dom("#query").offset()
				 * );
				 * // {"top": 8, "left": 8}
				 * ```
				 */
				this.offset = function () {
					return dom.offset(this.elements);
				};
				/**
				 * 엘리먼트의 position 값을 반환합니다.
				 * @method ax5.dom0.position
				 * @param {Elements|Element} elements
				 * @returns {Object}
				 * @example
				 * ```
				 * console.log(
				 * 	ax5.dom("#query").position()
				 * );
				 * // {"top": 8, "left": 8}
				 * ```
				 */
				this.position = function () {
					return dom.position(this.elements);
				};
				/**
				 * 엘리먼트의 box model 속성을 반환합니다.
				 * @method ax5.dom0.box_model
				 * @param {String} [cond] - 원하는 박스 속성
				 * @returns {Object}
				 * @example
				 * ```
				 * var axd = ax5.dom;
				 * axd(".ax5-sample-view").box_model()
				 * // {"offset": {"top": 101, "left": 110}, "position": {"top": 101, "left": 110}, "width": 181.71875, "height": 153, "padding": [5,4,3,2], "margin": [1,10,1,10], "border": ["2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)"], "borderWidth": ["2","2","2","2"], "boxSizing": "content-box"}
				 *
				 * axd(".ax5-sample-view").box_model("offset");
				 * axd(".ax5-sample-view").box_model("position");
				 * axd(".ax5-sample-view").box_model("width");
				 * axd(".ax5-sample-view").box_model("height");
				 * axd(".ax5-sample-view").box_model("padding");
				 * axd(".ax5-sample-view").box_model("margin");
				 * axd(".ax5-sample-view").box_model("border");
				 * axd(".ax5-sample-view").box_model("borderWidth");
				 * axd(".ax5-sample-view").box_model("border-width");
				 * axd(".ax5-sample-view").box_model("boxSizing");
				 * axd(".ax5-sample-view").box_model("box-sizing");
				 * // 각각의 박스모델 속성을 지정하여 호출 할 수 있습니다. borderWidth, border-width 중 하나의 방법으로 사용 가능합니다.
				 * ```
				 */
				this.box_model = function (cond) {
					return dom.box_model(this.elements, cond);
				};
				/**
				 * 엘리먼트에 data를 속성을 추가하거나 반환합니다.
				 * @method ax5.dom0.data
				 * @param {String|Object} [command=get] - 명령어 "get|set|remove"
				 * @param {Object|String} O - json타입 또는 문자열
				 * @returns {ax5.dom0|String}
				 * @example
				 * ```
				 * var axd = ax5.dom, axu = ax5.util, res = "";
				 *
				 * var el = axd("#list-container");
				 * el.data({a:1}); // set data
				 * el.data("set", {a:1100, b:[0,1,2,3]}); // set data
				 *
				 * res += el.data("a"); // get data
				 * res += el.data("get", "b"); // get data
				 * console.log(res);
				 * // 11000,1,2,3
				 *
				 * console.log(el.data("b"));
				 * // [0, 1, 2, 3]
				 * el.data("remove", "b"); // remove data
				 * console.log(el.data("b"));
				 * // ""
				 *
				 * el.data("remove"); // remove all
				 * ```
				 */
				this.data = function (command, O) {
					var rs = dom.data(this.elements, command, O);
					return (rs === this.elements) ? this : rs;
				};
				/**
				 * 엘리먼트의 자식을 모두 지워줍니다. 내용을 깨긋히 비워 냅니다.
				 * @method ax5.dom0.empty
				 * @returns {ax5.dom0}
				 * @example
				 * ```
				 * var axd = ax5.dom, axu = ax5.util, res = "";
				 *
				 * axd("#id").empty();
				 * ```
				 */
				this.empty = function (){
					dom.empty(this.elements);
					return this;
				};
				/**
				 * 웹지엘 컨텍스트를 반환합니다.
				 * @method ax5.dom0.get_webgl_context
				 * @returns {wegGlContext}
				 */
				this.get_webgl_context = function (){
					return dom.get_webgl_context(this.elements);
				};
				/**
				 * 엘리먼트의 value값을 반환합니다.
				 * @method ax5.dom0.val
				 * @param {String} [v] - element.value에 부여할 값
				 * @returns {String}
				 */
				this.val = function(v){
					return dom.val(this.elements, v);
				};
			}

			return ax;
		})();
		return new axdom(query);
	};

	// dom functions
	(function () {
        var curCSS;
		//if("내장함수 시작") {
		// 이벤트 바인딩
		function eBind(elem, type, eventHandle) {
			if(!U.is_string(type)) console.error("type=" + type);
			type = U.left(type, ".");
			if (elem.addEventListener) {
				elem.addEventListener(type, eventHandle, false);
			} else if (elem.attachEvent) {
				elem.attachEvent("on" + type, eventHandle);
			}
		}

		// 이벤트 언바인딩
		function eUnBind(elem, type, eventHandle) {
			type = U.left(type, ".");
			if (elem.removeEventListener) {
				if (eventHandle) elem.removeEventListener(type, eventHandle);
				else {
					elem.removeEventListener(type);
				}
			} else if (elem.detachEvent) {
				if (eventHandle) elem.detachEvent("on" + type, eventHandle);
				else elem.detachEvent("on" + type);
			}
		}

		// 엘리먼트 인자 체크
		function va_elem(elem, fn_name) {
			var type = U.get_type(elem);
			if (type === "window") return elem;
			else if (type === "array" && U.is_element(elem[0])) return elem;
			else if (type === "element") return [elem];
			else if (elem && elem.nodeType === 9) return [elem.documentElement];
			else if (elem && elem.toString() == "[object ax5.dom]") return elem.elements;
			else if (type !== "array" && type !== "nodelist") {
				//console.error("ax5.dom." + fn_name + " : elements parameter incorrect");
				return [];
			}
			return elem;
		}

		// 엘리먼트 순서이동
		function sibling(els, forward, times) {
			var prop = (forward == "prev") ? "previousSibling" : "nextSibling", 
				el = [].concat(els)[0];
			times = (typeof times == "undefined" || times < 1) ? 1 : times;
			do {
				el = el[prop];
			}
			while (
				(function () {
					if (!el) return false;
					if (el.nodeType == 1) times--;
					return (times > 0)
				})()
				);
			return el;
		}

        if ( window.getComputedStyle ) {
            curCSS = function (elem, name, num) {
                var width, minWidth, maxWidth, computed, ret, style, left, rs, rsLeft;

                computed = window.getComputedStyle(elem, null),
                ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined,
                style = elem.style;

                if ( computed ) {

                    // A tribute to the "awesome hack by Dean Edwards"
                    // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
                    // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
                    // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
                    if ( re_numnonpx.test( ret ) && re_margin.test( name ) ) {
                        // Remember the original values
                        width = style.width;
                        minWidth = style.minWidth;
                        maxWidth = style.maxWidth;

                        // Put in the new values to get a computed value out
                        style.minWidth = style.maxWidth = style.width = ret;
                        ret = computed.width;

                        // Revert the changed values
                        style.width = width;
                        style.minWidth = minWidth;
                        style.maxWidth = maxWidth;
                    }
                }

                if(num) ret = parseFloat(ret) || 0;
                return ret;
            }
        }
        else{
            curCSS = function(elem, name, num) {
                var width, minWidth, maxWidth, computed, ret, style, left, rs, rsLeft;

                computed = elem.currentStyle,
                ret = computed ? computed[ name ] : undefined,
                style = elem.style;

                // Avoid setting ret to empty string here
                // so we don't default to auto
                if ( ret == null && style && style[ name ] ) {
                    ret = style[ name ];
                }

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                // but not position css attributes, as those are proportional to the parent element instead
                // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
                if ( re_numnonpx.test( ret ) && !re_position.test( name ) ) {

                    // Remember the original values
                    left = style.left;
                    rs = elem.runtimeStyle;
                    rsLeft = rs && rs.left;

                    // Put in the new values to get a computed value out
                    if ( rsLeft ) {
                        rs.left = elem.currentStyle.left;
                    }
                    style.left = name === "fontSize" ? "1em" : ret;
                    ret = style.pixelLeft + "px";

                    // Revert the changed values
                    style.left = left;
                    if ( rsLeft ) {
                        rs.left = rsLeft;
                    }
                }
                ret = ret === "" ? "auto" : ret;

                if(num) ret = parseFloat(ret) || 0;
                return ret;
            }
        }
        // jQuery 1.10.2 소스를 참고하여 curCSS를 재작성하였습니다.


		// 엘리먼트 스타일 값 가져오기
		function style(el, key, fn_nm) {
			if (U.is_string(key)) {
				return curCSS( el, key );
			}
			else if (U.is_array(key)) {
				var css = {}, i = 0, l = key.length;
				for (; i < l; i++) {
					css[key[i]] = curCSS(el, key[i]);
				}
				return css;
			}
			return null;
		}

		// 박스사이즈 구하기
		function box_size(els, fn_nm, opts) {
			var d = -1, tag_nm = "",
				el = [].concat(els)[0];
			
			if (U.is_window(el)) {
				return el.document.documentElement[U.camel_case("client-" + fn_nm)];
			}
			else {
				var _sbs = U.camel_case("scroll-" + fn_nm), _obs = U.camel_case("offset-" + fn_nm), _cbs = U.camel_case("client-" + fn_nm);
				if (el) {
					tag_nm = el.tagName.toLowerCase();
					if (tag_nm == "html") {
						d = Math.max(doc.body[_sbs], el[_sbs], doc.body[_obs], el[_obs], el[_cbs]);
					}
					else {
						if (el.getBoundingClientRect) {
							d = el.getBoundingClientRect()[fn_nm];
						}

						if (typeof d == "undefined") {
							d = style(el, fn_nm, fn_nm);
							var box_cond = (fn_nm == "width") ?
								style(el, ["box-sizing", "padding-left", "padding-right", "border-left-width", "border-right-width"], fn_nm) :
								style(el, ["box-sizing", "padding-top", "padding-bottom", "border-top-width", "border-bottom-width"], fn_nm);

							if (box_cond["box-sizing"] == "content-box") {
								d = parseInt(d) + (ax5.util.reduce(box_cond, function (p, n) {
									return U.number(p | 0) + U.number(n);
								}));
							}
						}
					}
				}
			}
			return U.number(d);
		}

		// nodeName check
		function node_name(el, node_nm) {
			return el.nodeName && el.nodeName.toLowerCase() === node_nm.toLowerCase();
		}

		// createFragment
		function create_fragment(elems) {
			var safe = safe_fragment.appendChild( doc.createElement("div")), tmp, nodes = [], tag, wrap, tbody,
                elem, i = 0, l = elems.length, j;
            // safe = doc.createDocumentFragment();

			for (; i < l; i++) {
				elem = elems[i];
				if (elem || elem === 0) {
					if (U.get_type(elem) == "fragment") {
						nodes.push(elem.firstChild);
					}
					else if (U.get_type(elem) == "element") {
						nodes.push(elem);
					}
					else if (!re_html.test(elem)) {
						nodes.push(doc.createTextNode(elem));
						//safe.appendChild(doc.createTextNode(elem));
					}
					else {
						tmp = safe.appendChild(doc.createElement("div"));
						// Deserialize a standard representation
						tag = ( re_tag.exec(elem) || ["", ""] )[1].toLowerCase();
						wrap = tag_map[tag] || [ 0, "", "" ];
						tmp.innerHTML = wrap[1] + elem.replace(re_single_tags, "<$1></$2>") + wrap[2];

						// Descend through wrappers to the right content
						j = wrap[0];
						while (j--) {
							tmp = tmp.lastChild;
						}
						
						U.merge(nodes, tmp.childNodes);

						// Fix #12392 for WebKit and IE > 9
						tmp.textContent = "";

						// Fix #12392 for oldIE
						while (tmp.firstChild) {
							tmp.removeChild(tmp.firstChild);
						}

						// Remember the top-level container for proper cleanup
						tmp = safe.lastChild;
						//tmp = safe.firstChild;
                        safe.removeChild(tmp);
                        tmp = null;
					}
				}
			}

			i = 0;
			while ((elem = nodes[i++])) {
				if(elem.nodeName == "SCRIPT"){
					var s = doc.createElement('script');
					s.type = elem.type;
					if(elem.src) s.src = elem.src;
					s.text = elem.innerHTML;
					safe.appendChild( s );
				}else{
					safe.appendChild( elem );
				}
			}
			//console.log(safe.innerHTML);
			return safe;
		}
		
		// 엘리먼트와 자식 엘리먼트의 이벤트와 데이터를 모두 지워줍니다.
		function clear_element_data(el){
			var e_hds, ei, el,
				c_el, ci, cl;
			
			for(var hd in el.e_hd){
				if(typeof el.e_hd[hd] === "function"){
					eUnBind(el, hd, el.e_hd[hd]);
				}else{
					for(var ehi=0;ehi<el.e_hd[hd].length;ehi++)
						eUnBind(el, hd, el.e_hd[hd][ehi]);
				}
			}
			if(el["e_hd"]) delete el["e_hd"];
			if(el["ax5_data"]) delete el["ax5_data"];
			// todo : attributes 걸리는 것이 없지만 혹시나 모를 데이터를 위해.
			if(ax5.info.browser.name !== "ie" && ax5.info.browser.version > 7){
				for(var a in el.attributes) {
					if (typeof el.attributes[a] === "object") {
						try {
							el.attributes[a] = null;
						}catch(e){}
					}
				}
			}

			// 자식들도 확인 합니다.
			if(el.hasChildNodes()){
				c_el = el.childNodes, ci = 0, cl = c_el.length;
				for (;ci < cl; ci++)
					clear_element_data(c_el[ci]);
			}
		}
		
		// jQuery.ready.promise jquery 1.10.2 를 참고하여 재 작성 했습니다.
		/**
		 * document 로드 완료를 체크 합니다.
		 * @method ax5.dom.ready
		 * @param {Function} _fn - 로드완료시 호출함수
		 * @example
		 * ```js
		 * var a = 1;
		 * setTimeout(function(){
		 *    ax5.dom.ready(function(){
		 *        console.log("test" + a);
		 *        console.log(ax5.util.left("axisj-ax5", "-"));
		 *    });
		 * }, 1000);
		 * ```
		 */
		function ready(_fn) {
			var is_ready = false;
			promise(function () {
				if (is_ready) return;
				is_ready = ax5.dom.is_ready = true;
				_fn();
			});
		}

		function promise(_fn) {
			if (doc.readyState === "complete") {
				setTimeout(_fn);
			} else {
				if (doc.addEventListener) {
					doc.addEventListener("DOMContentLoaded", _fn, false);
					win.addEventListener("load", _fn, false);
				} else {
					doc.attachEvent("onreadystatechange", _fn);
					win.attachEvent("onload", _fn);
					// If IE and not a frame
					var top = false;
					try {
						top = win.frameElement == null && doc.documentElement;
					} catch (e) {
					}

					if (top && top.doScroll) {
						(function doScrollCheck() {
							if (!ax5.dom.is_ready) {
								try {
									// Use the trick by Diego Perini
									// http://javascript.nwbox.com/IEContentLoaded/
									top.doScroll("left");
								} catch (e) {
									return setTimeout(doScrollCheck, 50);
								}
								// and execute any waiting functions
								_fn();
							}
						})();
					}
				}
			}
		}

		/**
		 * 브라우저 resize 이벤트를 캐치합니다.
		 * @method ax5.dom.resize
		 * @param {Function} _fn - 캐치후 호출될 함수
		 * @example
		 * ```
		 * ax5.dom.resize(function(){
		 * 	console.log( 1, document.body.clientWidth );
		 * });
		 * ```
		 */
		function resize(_fn) {
			ready(function() {
				eBind(window, "resize", _fn);
			});
		}
		/**
		 * 브라우저 scroll 이벤트를 캐치하여 사용자 함수를 호출 하거나 스트롤 포지션을 리턴합니다.
		 * @method ax5.dom.scroll
		 * @param {Function} [_fn] - 캐치후 호출될 함수
		 * @example
		 * ```
		 * ax5.dom.scroll(function(){
		 * 	console.log( 1, ax5.dom.scroll().top );
		 * });
		 * ```
		 */
		function scroll(_fn) {

			if(typeof _fn === "undefined"){
				return {
					top: docElem.scrollTop || doc.body.scrollTop,
					left: docElem.scrollLeft || doc.body.scrollLeft
				}
			}else{
				ready(function(){
					eBind(window, "scroll", _fn);
				});
				return false;
			}
		}

		/**
		 * CSS Selector를 이용하여 HTML Elements를 찾습니다.
		 * @method ax5.dom.get
		 * @param {String|Element|ax5.dom0} query - CSS Selector | Element
		 * @param {String} sub_query - CSS Selector
		 * @returns {Array} elements
		 * @example
		 * ```js
		 * ax5.dom.get("#element01");
		 * ax5.dom.get("input[type='text']");
		 * ax5.dom.get( ax5.dom.get("input[type='text']") );
		 * ```
		 */
		function get(query, sub_query) {
			var els, r_els = [], p_els;
			var i = 0, l = query.length;
			if (query.toString() === "[object ax5.dom]") {
                r_els = query.elements;
			}
			else if (U.is_window(query)) r_els.push(query);
			else if (U.is_element(query)) r_els.push(query);
			else if (U.is_array(query) || U.is_nodelist(query)) {
				for (i=0; i < l; i++)  if (U.is_element(query[i])) r_els.push(query[i]);
			}
			else if (U.is_string(query) && query.substr(0, 1) === "#") r_els.push(doc.getElementById(query.substr(1)));
			else {
                els = doc.querySelectorAll(query), l = els.length;
				for (i=0; i < l; i++) r_els.push(els[i]);
			}
			if (typeof sub_query !== "undefined") {
				p_els = (info.browser.name == "ie" && info.browser.version < 8) ? doc : r_els[0];
                r_els = [], els = p_els.querySelectorAll(sub_query), l = els.length;
				for (i=0; i < l; i++) r_els.push(els[i]);
			}
			return r_els;
		}

		/**
		 * CSS Selector를 이용하여 HTML Element를 찾습니다.
		 * @method ax5.dom.get_one
		 * @param {String|Element} query - CSS Selector | Element
		 * @param {String} sub_query - CSS Selector
		 * @returns {Element} element
		 * @example
		 * ```js
		 * ax5.dom.get_one("#element01");
		 * ax5.dom.get_one("input[type='text']");
		 * ```
		 */
		function get_one(query, sub_query) {
			return get(query, sub_query)[0];
		}

		/**
		 * createElement 구문을 효과적으로 수행합니다.
		 * @method ax5.dom.create
		 * @param {String} node_nm - 엘리먼트 이름
		 * @param {Object} attr - 엘리먼트 속성정보
		 * @param {String} val - innerHTML 값
		 * @returns {Element}
		 * @example
		 * ```js
		 * ax5.dom.create("script", {type:"text/javascript", src:"../ax5.js"});
		 * ax5.dom.create("div", {id:"createEleId", "class":"createEleClass"}, "<a>내가만든</a>");
		 * ```
		 */
		function create(node_nm, attr, val) {
			/*
			 HTML - Use http://www.w3.org/1999/xhtml
			 SVG - Use http://www.w3.org/2000/svg
			 XBL - Use http://www.mozilla.org/xbl
			 XUL - Use http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul
			 document.createElementNS("http://www.w3.org/1999/xhtml","div");
			 document.createElement("div")
			 document.createTextNode(text)
			 */
			var element = doc.createElement(node_nm);
			for (var k in attr) {
				element.setAttribute(k, attr[k]);
			}
			if(val) element.appendChild(create_fragment([].concat(val)));
			return element;
		}

		/**
		 * Elements에 CSS속성을 읽고 씁니다.
		 * @method ax5.dom.css
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {Object|Array|String} CSS
		 * @returns {String|Object|Elements}
		 * @example
		 * ```js
		 * ax5.dom.css(ax5.dom.get("#abcd"), {"color":"#ff3300"});
		 * ax5.dom.css(ax5.dom.get("#abcd"), {"width":100});
		 * ```
		 */
		function css(els, O) {
			els = va_elem(els, "css");
			if (U.is_string(O) || U.is_array(O)) {
				return style(els[0], O, "css");
			}
			else {
				var i = 0, l = els.length, k, matchs;
				for (; i < l; i++) {
					for (k in O) {
						//els[i].style[U.camel_case(k)] = (matchs = re_numsplit.exec(O[k])) ? Math.max(0, matchs[1]) + ( matchs[2] || "px" ) : O[k];
						els[i].style[U.camel_case(k)] = (matchs = re_numsplit.exec(O[k])) ? matchs[1] + ( matchs[2] || "px" ) : O[k];
						// todo : top 값을 음수로 설정하는 경우 오류 발생 일단 예외처리.
					}
				}
			}
			return els;
		}
		// todo : opacity 컨트롤 테스트

		/**
		 * elements에 className 를 추가, 제거, 확인, 토글합니다.
		 * @method ax5.dom.class_name
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {String} [command=has] - add,remove,toggle,has
		 * @param {String} O - 클래스명
		 * @returns {String|Elements} return - elements 또는 클래스이름
		 * @example
		 * ```js
		 * ax5.dom.class_name(ax5.dom.get("#abcd"), "class-text"); // has 와 동일
		 * ax5.dom.class_name(ax5.dom.get("#abcd"), "add", "class-text");
		 * ax5.dom.class_name(ax5.dom.get("#abcd"), "remove", "class-text");
		 * ax5.dom.class_name(ax5.dom.get("#abcd"), "has", "class-text");
		 * ax5.dom.class_name(ax5.dom.get("#abcd"), "toggle", "class-text");
		 * ```
		 */

		// todo : class_name 여러개의 class 인자 동시 처리 지원
		function class_name(els, command, O) {
			var cns;
			els = va_elem(els, "clazz");
			if (command === "add" || command === "remove" || command === "toggle") {
				O = [].concat(O);
				for (var di = 0; di < els.length; di++) {
					cns = els[di]["className"];
					if(cns !== "") cns = cns.split(re_class_name_split);
					else cns = [];
					if (command === "add") {
						O.forEach(function(O){
							if (U.search(cns, function () {
									return O.trim() == this;
								}) == -1) cns.push(O.trim());
						});
					} else if (command === "remove") {
						O.forEach(function(O) {
							cns = U.filter(cns, function () {
								return O.trim() != this;
							});
						});
					} else if (command === "toggle") {
						O.forEach(function(O) {
							var class_count = cns.length;
							cns = U.filter(cns, function () {
								return O.trim() != this;
							});
							if (class_count === cns.length) cns.push(O.trim());
						});
					}



					els[di]["className"] = cns.join(" ");
				}
				return els;
			}
			else { // has
				if (typeof O === "undefined") O = command;
                cns = els[0]["className"].trim().split(re_class_name_split);
				if (U.is_string(O)) { // hasClass
					// get Class Name
					return (U.search(cns, function () {
						return this.trim() === O
					}) > -1);
				} else {
					console.error("set_class argument error");
				}
				return els;
			}
		}

		/**
		 * elements에 attribute를 추가, 제거, 확인 합니다.
		 * @method ax5.dom.attr
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {Object|String} O - json타입또는 문자열
		 * @returns {String|Elements} return - elements 또는 속성값
		 * @example
		 * ```
		 * ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), {"data-ax-spt":"ABCD"}); // set attribute
		 * ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), {"data-ax-spt":"9999", "data-next":"next"}); // set attribute
		 * ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), "data-ax-spt"); // get attribute
		 * ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), {"data-next":null}); // remove attribute
		 * ```
		 */
		function attr(els, O) {
			els = va_elem(els, "attr");
			var i = 0, l = els.length, k;
			if (U.is_object(O)) {
				for (; i < l; i++) {
					for (k in O){
						if(O[k] == null){
							els[i].removeAttribute(k);
						}else{
							els[i].setAttribute(k, O[k]);
						}
					}
				}
			}
			else if (U.is_string(O)) {
				return els[0].getAttribute(O);
			}
			return els;
		}

		/**
		 * elements에 이벤트를 바인드 합니다.
		 * @method ax5.dom.on
		 * @param {Array} elements
		 * @param {String} type - 이벤트 타입
		 * @param {Function} _fn - 이벤트 콜백함수
		 * @example
		 * ```js
		 * var fna = function(){console.log("fna")};
		 * var fnb = function(){console.log("fnb")};
		 * var fnc = function(){console.log("fnc")};
		 *
		 * var mydom = ax5.dom.get("[data-event-test=text-box]"), remove_dom = ax5.dom.get("[data-event-test=remove]");
		 *
		 * ax5.dom.on(mydom, "click", window.fna);
		 * ax5.dom.on(mydom, "click", window.fnb);
		 * ax5.dom.on(mydom, "click", window.fnc);
		 *
		 * ax5.dom.on(remove_dom, "click", function(){
		 * 	ax5.dom.off(mydom, "click", window.fna);
		 * 	ax5.dom.off(remove_dom, "click");
		 * 	alert("이벤트 제거");
		 * });
		 *
		 * // 핸들방식
		 * ax5.dom.on(mydom, "click.fna", window.fna);
		 * ax5.dom.on(mydom, "click.fnb", window.fnb);
		 * ax5.dom.on(mydom, "click.fnc", window.fnc);
		 * ```
		 */
		function on(els, typ, _fn) {
			els = va_elem(els, "on");
			for (var i = 0; i < els.length; i++) {
				var __fn, _d = els[i];
				if(!_d) break;
				if (!_d.e_hd) _d.e_hd = {};
				if (typeof _d.e_hd[typ] === "undefined") {
					__fn = _d.e_hd[typ] = _fn;
				} else {
					if (!U.is_array(_d.e_hd[typ])) _d.e_hd[typ] = [_d.e_hd[typ]];
					_d.e_hd[typ].push(_fn);
					__fn = _d.e_hd[typ][_d.e_hd[typ].length - 1];
				}
				eBind(_d, typ, __fn);
			}
		}

		/**
		 * elements에 이벤트를 언바인드 합니다.
		 * @method ax5.dom.off
		 * @param {Array} elements
		 * @param {String} type - 이벤트 타입
		 * @param {Function} [_fn] - 이벤트 콜백함수
		 * @example
		 * ```js
		 * var mydom = ax5.dom.get("[data-event-test=text-box]")
		 * ax5.dom.off(mydom, "click");
		 * ax5.dom.off(mydom, "click.fnb");
		 * ```
		 */
		function off(els, typ, _fn) {
			els = va_elem(els, "off");
			for (var i = 0; i < els.length; i++) {
				var _d = els[i];
				if(_d.e_hd) {
					if (U.is_array(_d.e_hd[typ])) {
						var _na = [];
						for (var i = 0; i < _d.e_hd[typ].length; i++) {
							if (_d.e_hd[typ][i] == _fn || typeof _fn === "undefined") eUnBind(_d, typ, _d.e_hd[typ][i]); else _na.push(_d.e_hd[typ][i]);
						}
						_d.e_hd[typ] = _na;
					} else {
						if (_d.e_hd[typ] == _fn || typeof _fn === "undefined") {
							eUnBind(_d, typ, _d.e_hd[typ]);
							delete _d.e_hd[typ]; // 함수 제거
						}
					}
				}
			}
		}

		/**
		 * 타겟 엘리먼트의 자식을 반환합니다.
		 * @method ax5.dom.child
		 * @param {Element|Elements} elements
		 * @returns {Elements} elements
		 * @example
		 * ```
		 * <ul id="list-container">
		 * 	 <li data-list-item="0">
		 * 		<div>child>child</div>
		 * 	 </li>
		 * 	 <li data-list-item="1"></li>
		 * 	 <li data-list-item="2"></li>
		 * 	 <li data-list-item="3"></li>
		 * 	 <li data-list-item="4"></li>
		 * 	 <li data-list-item="5"></li>
		 * </ul>
		 * <script>
		 * var el = ax5.dom.get("#list-container");
		 * console.log(
		 * 	 ax5.dom.child(el)[1].tagName,
		 * 	 ax5.dom.attr(ax5.dom.child(el)[1], "data-list-item")
		 * );
		 * // LI 1
		 * </script>
		 * ```
		 */
		function child(els) {
			els = va_elem(els, "child");
			var return_elems = [], i = 0, l;
			if (els[0]) {
				l = els[0].children.length;
				for (; i < l; i++) {
					return_elems.push(els[0].children[i]);
				}
			}
			return return_elems;
		}

		/**
		 * 타겟엘리먼트의 부모 엘리멘트 트리에서 원하는 조건의 엘리먼트를 얻습니다.
		 * @method ax5.dom.parent
		 * @param {Element} elements - target element
		 * @param {Object|Function} cond - 원하는 element를 찾을 조건
		 * @returns {Element}
		 * @example
		 * ```
		 * // cond 속성정의
		 * var cond = {
		 * 	tagname: {String} - 태그명 (ex. a, div, span..),
		 * 	clazz: {String} - 클래스명
		 * 	[, 그 외 찾고 싶은 attribute명들]
		 * };
		 * console.log(
		 * 	ax5.dom.parent(e.target, {tagname:"a", clazz:"ax-menu-handel", "data-custom-attr":"attr_value"})
		 * );
		 * // cond 함수로 처리하기
		 * ax5.dom.on(fnObj.layout.client_main, "click.app_expand", function(e){
		 * 	var target = ax5.dom.parent(e.target, function(target){
		 * 		if(ax5.dom.class_name(target, "aside")){
		 * 			return true;
		 * 		}
		 * 		else if(ax5.dom.class_name(target, "client-main")){
		 * 			return true;
		 * 		}
		 * 	});
		 * 	//client-aside
		 * 	if(target.id !== "client-aside"){
		 * 		fnObj.layout.expand_menu();
		 * 	}
		 * });
		 * ```
		 */
		function parent(els, cond) {
			els = va_elem(els, "parent");
			var _target = els[0];
			if (_target) {
				while ((function () {
					var result = true;
					if(typeof cond === "undefined"){
						_target = (_target.parentNode) ? _target.parentNode : false;
					}
					else
					if(U.is_function(cond)){
						result = cond(_target);
					}
					else
					if(U.is_object(cond)) {
						for (var k in cond) {
							if (k === "tagname") {
								if (_target.tagName.toLocaleLowerCase() != cond[k]) {
									result = false;
									break;
								}
							} else if (k === "clazz" || k === "class_name") {
								if("className" in _target) {
									var klasss = _target.className.split(re_class_name_split);
									var hasClass = false;
									for (var a = 0; a < klasss.length; a++) {
										if (klasss[a] == cond[k]) {
											hasClass = true;
											break;
										}
									}
									result = hasClass;
								}else{
									result = false;
									break;
								}
							} else { // 그외 속성값들.
								if(_target.getAttribute) {
									if (_target.getAttribute(k) != cond[k]) {
										result = false;
										break;
									}
								}else{
									result = false;
									break;
								}
							}
						}
					}
					return !result;
				})()) {
					if (_target.parentNode) {
						_target = _target.parentNode;
					} else {
						_target = false;
						break;
					}
				}
			}
			return _target;
		}

		/**
		 * 형제 엘리먼트중에 앞서 위치한 엘리먼트를 반환합니다.
		 * @method ax5.dom.prev
		 * @param {Elements|Element} elements
		 * @param {Number} [times=1] - 횟수
		 * @returns {Element|null} element - 원하는 위치에 아이템이 없으면 null 을 반환합니다.
		 * @example
		 * ```
		 * <div>
		 * 	 <ul id="list-container">
		 * 		 <li data-list-item="0" id="li0">
		 * 			<div>child>child</div>
		 * 		 </li>
		 * 		 <li data-list-item="1" id="li1"></li>
		 * 		 <li data-list-item="2" id="li2"></li>
		 * 		 <li data-list-item="3" id="li3"></li>
		 * 		 <li data-list-item="4" id="li4"></li>
		 * 		 <li data-list-item="5" id="li5"></li>
		 * 	 </ul>
		 * </div>
		 * <script>
		 * var el = ax5.dom.get("#list-container");
		 * var li = ax5.dom.child(el)[0];
		 * var c_li;
		 *
		 * console.log(
		 * 	 (c_li = ax5.dom.next(li, 2)).id,
		 * 	 (c_li = ax5.dom.prev(c_li)).id
		 * );
		 * </script>
		 * ```
		 */
		function prev(els, times) {
			els = va_elem(els, "prev");
			return sibling(els, "prev", times);
		}

		/**
		 * 형제 엘리먼트중에 다음에 위치한 엘리먼트를 반환합니다.
		 * @method ax5.dom.next
		 * @param {Elements|Element} elements
		 * @param {Number} [times=1] - 횟수
		 * @returns {Element|null} element - 원하는 위치에 아이템이 없으면 null 을 반환합니다.
		 * @example
		 * ```
		 * <div>
		 * 	 <ul id="list-container">
		 * 		 <li data-list-item="0" id="li0">
		 * 			<div>child>child</div>
		 * 		 </li>
		 * 		 <li data-list-item="1" id="li1"></li>
		 * 		 <li data-list-item="2" id="li2"></li>
		 * 		 <li data-list-item="3" id="li3"></li>
		 * 		 <li data-list-item="4" id="li4"></li>
		 * 		 <li data-list-item="5" id="li5"></li>
		 * 	 </ul>
		 * </div>
		 * <script>
		 * var el = ax5.dom.get("#list-container");
		 * var li = ax5.dom.child(el)[0];
		 * var c_li;
		 *
		 * console.log(
		 * 	 (c_li = ax5.dom.next(li, 2)).id,
		 * 	 (c_li = ax5.dom.prev(c_li)).id
		 * );
		 * </script>
		 * ```
		 */
		function next(els, times) {
			els = va_elem(els, "next");
			return sibling(els, "next", times);
		}

		/**
		 * 엘리먼트의 너비를 반환합니다.
		 * @method ax5.dom.width
		 * @param {Elements|Element} elements
		 * @returns {Number} width
		 * @example
		 * ```js
		 * var el = ax5.dom.get("#list-container")
		 * ax5.dom.width(el);
		 * ```
		 */
		function width(els) {
			els = va_elem(els, "width");
			return box_size(els, "width");
		}

		/**
		 * 엘리먼트의 너비를 반환합니다.
		 * @method ax5.dom.height
		 * @param {Elements|Element} elements
		 * @returns {Number} width
		 * @example
		 * ```js
		 * var el = ax5.dom.get("#list-container")
		 * ax5.dom.height(el);
		 * ```
		 */
		function height(els) {
			els = va_elem(els, "height");
			return box_size(els, "height");
		}

		/**
		 * 엘리먼트의 자식을 모두 지워줍니다. 내용을 깨긋히 비워 냅니다.
		 * @method ax5.dom.empty
		 * @param {Elements|Element} elements
		 * @returns {Elements}
		 * @example
		 * ```js
		 * var el = ax5.dom.get("#list-container");
		 * ax5.dom.empty(el);
		 * ```
		 */
		function empty(els) {
			els = va_elem(els, "empty");
			var i = 0, l = els.length, el;
			for (; i < l; i++) {
				el = els[i];
				while (el.firstChild) {
					clear_element_data(el.firstChild);
					el.removeChild(el.firstChild);
				}
				if (el.options && node_name(el, "select")) {
					el.options.length = 0;
				}
			}
			return els;
		}

		/**
		 * 엘리먼트안에 HTML코드를 바꿔치기 합니다.
		 * @method ax5.dom.html
		 * @param {Elements|Element} elements
		 * @param {String} [htmlcode]
		 * @returns {Elements|String}
		 * @example
		 * ```js
		 * var el = ax5.dom.get("#list-container");
		 * console.log( ax5.dom.html(el) );
		 * ax5.dom.html(el, "<a href='#1234'>링크");
		 * ```
		 */
		function html(els, val) {
			els = va_elem(els, "html");
            var tag, wrap;
			if (typeof val == "undefined") {
				return els[0].innerHTML;
			} else {
                tag = ( re_tag.exec(val) || ["", ""] )[1].toLowerCase();
				if (U.is_number(val)) val = ''+val;
				if (U.is_string(val) && !re_noInnerhtml.test(val)) {
                    if(tag_not_support_innerhtml[tag]){
                        append(empty(els), val);
                    }else{
                        val = val.replace(re_single_tags, "<$1></$2>");
                        var i = 0, l = els.length;
                        for (; i < l; i++) {
                            if("innerHTML" in els[i]) els[i].innerHTML = val;
                        }
                    }
				}
				else if (U.is_element(val) || U.is_nodelist(val)) {
					append(empty(els), val);
				}
				return els;
			}
		}

		/**
		 * 엘리먼트에 자식노드를 추가 합니다. (추가되는 위치는 맨 아래 입니다.)
		 * @method ax5.dom.append
		 * @param {Elements|Element} elements
		 * @param {String|Element} val
		 * @returns {Elements|Element}
		 * @example
		 * ```
		 * var el = ax5.dom.get("[data-list-item='0']");
		 * ax5.dom.append(el, "ㅈㅏㅇㄱㅣㅇㅕㅇ");
		 * ax5.dom.append(el, "<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>");
		 * ax5.dom.append(ax5.dom.get("[data-list-item='2']"), ax5.dom.get("#move-item"));
		 * ```
		 */
		function append(els, val) {
			// todo : 빈 노드에 append 할때 빈 div 태그 생성됨.
			return manipulate("append", els, val);
		}

		/**
		 * 엘리먼트에 자식노드를 추가 합니다. (추가되는 위치는 맨 처음 입니다.)
		 * @method ax5.dom.prepend
		 * @param {els|Element} elements
		 * @param {String|Element} val
		 * @returns {Elements|Element}
		 * @example
		 * ```
		 * var el = ax5.dom.get("[data-list-item='0']");
		 * ax5.dom.prepend(el, "ㅈㅏㅇㄱㅣㅇㅕㅇ");
		 * ax5.dom.prepend(el, "<div>장기영<a href='#ABCDE'>이건 어렵다</a></div>");
		 * ax5.dom.prepend(ax5.dom.get("[data-list-item='2']"), ax5.dom.get("#move-item"));
		 * ```
		 */
		function prepend(els, val) {
			return manipulate("prepend", els, val);
		}

		/**
		 * 엘리먼트에 앞에 노드를 추가합니다.
		 * @method ax5.dom.before
		 * @param {Elements|Element} elements
		 * @param {String|Element} val
		 * @returns {Elements|Element}
		 * @example
		 * ```
		 * var el = ax5.dom.get("[data-list-item='0']");
		 * ax5.dom.before(el, "before");
		 * ```
		 */
		function before(els, val) {
			return manipulate("before", els, val);
		}

		/**
		 * 엘리먼트에 다음에 노드를 추가합니다.
		 * @method ax5.dom.after
		 * @param {Elements|Element} elements
		 * @param {String|Element} val
		 * @returns {Elements|Element}
		 * @example
		 * ```
		 * var el = ax5.dom.get("[data-list-item='0']");
		 * ax5.dom.after(el, "after");
		 * ```
		 */
		function after(els, val) {
			return manipulate("after", els, val);
		}

		/**
		 * 노드추가 조작 함수
		 * @private
		 * @method ax5.dom.manipulate
		 * @param {String} act - 조작방식
		 * @param {Elements|Element} elements
		 * @param {String} val - 추가하려는 html tag 또는 문자열
		 * @returns {Elements|Element}
		 */
		function manipulate(act, els, val) {
			els = va_elem(els, act);
			var flag, i = 0, l = els.length,
				el = [].concat(val), cf = create_fragment, els = els, _el;

			if (act === "append") {
				for (; i < l; i++) {
					_el = cf(el);
					while(_el.firstChild){
						els[i].appendChild(_el.firstChild);
					}
				}
			}
			else if (act == "prepend") {
				for (; i < l; i++) {
					_el = cf(el);
					while(_el.firstChild) {
						els[i].insertBefore(_el.firstChild, els[i].firstChild);
					}
				}
			}
			else if (act == "before") {
				for (; i < l; i++) {
					_el = cf(el);
					while(_el.firstChild){
						els[i].parentNode.insertBefore(_el.firstChild, els[i]);
					}
				}
			}
			else if (act == "after") {
				for (; i < l; i++) {
					_el = cf(el);
					while(_el.firstChild){
						els[i].parentNode.insertBefore(_el.firstChild, els[i].nextSibling);
					}
				}
				//els[i].parentNode.insertBefore(cf(el), els[i].nextSibling);
			}
			return els;
		}

		/**
		 * 엘리먼트를 제거 합니다.
		 * @method ax5.dom.remove
		 * @param {Elements|Element} elements
		 * @example
		 * ```
		 * var el = ax5.dom.get("[data-list-item='0']");
		 * ax5.dom.remove(el);
		 * ```
		 */
		function remove(els, val) {
			els = va_elem(els, "remove");
			var i = 0, l = els.length;
			for (; i < l; i++) {
				if (els[i].parentNode) {
					clear_element_data(els[i]);
					els[i].parentNode.removeChild(els[i]);
				}
			}
		}

		/**
		 * 엘리먼트의 offset 값을 반환합니다.
		 * @method ax5.dom.offset
		 * @param {Elements|Element} elements
		 * @returns {Object}
		 * @example
		 * ```
		 * console.log(
		 * ax5.util.to_json(ax5.dom.offset(el))
		 * );
		 * // {"top": 8, "left": 8}
		 * ```
		 */
		function offset(els) {
			els = va_elem(els, "offset");
			var el = els[0], box;
			if (el.getBoundingClientRect) {
				box = el.getBoundingClientRect();
			}
			return {
				top : box.top + ( win.pageYOffset || (docElem.scrollTop || doc.body.scrollTop) ) - ( docElem.clientTop || 0 ),
				left: box.left + ( win.pageXOffset || (docElem.scrollLeft || doc.body.scrollLeft) ) - ( docElem.clientLeft || 0 )
			}
		}

		function offset_parent(el) {
			var offsetParent = el.offsetParent || docElem;
			while (offsetParent && ( !node_name(offsetParent, "html") && curCSS(offsetParent, "position") === "static" )) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || docElem;
		}

		/**
		 * 엘리먼트의 상대 offset 값을 반환합니다.
		 * @method ax5.dom.position
		 * @param {Elements|Element} elements
		 * @returns {Object}
		 * @example
		 * ```
		 * console.log(
		 * ax5.util.to_json(ax5.dom.position(el))
		 * );
		 * // {"top": 8, "left": 8}
		 * ```
		 */
		function position(els) {
			els = va_elem(els, "position");
			var el = els[0], el_parent,
				pos = {top: 0, left: 0}, parentPos = {top: 0, left: 0};

			if (css(el, "position") === "fixed") {
				pos = el.getBoundingClientRect();
			}
			else {
				el_parent = offset_parent(el);
				// Get correct offsets
				pos = offset(el);
				if (!node_name(el_parent, "html")) {
					parentPos = offset(el_parent);
				}
				// Add offsetParent borders
				parentPos.top += curCSS(el_parent, "borderTopWidth", "float");
				parentPos.left += curCSS(el_parent, "borderLeftWidth", "float");
			}
			return {
				top : pos.top - parentPos.top - (curCSS(el, "marginTop", "float") || 0),
				left: pos.left - parentPos.left - (curCSS(el, "marginLeft", "float") || 0)
			};
		}

		/**
		 * 엘리먼트의 box model 속성을 반환합니다.
		 * @method ax5.dom.box_model
		 * @param {Elements|Element} elements
		 * @param {String} [cond] - 원하는 박스 속성
		 * @returns {Object}
		 * @example
		 * ```
		 * var axd = ax5.dom;
		 * axd.box_model(el);
		 * // {"offset": {"top": 101, "left": 110}, "position": {"top": 101, "left": 110}, "width": 181.71875, "height": 153, "padding": [5,4,3,2], "margin": [1,10,1,10], "border": ["2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)","2px double rgb(34, 34, 34)"], "borderWidth": ["2","2","2","2"], "boxSizing": "content-box"}
		 *
		 * axd.box_model(el, "offset");
		 * axd.box_model(el, "position");
		 * axd.box_model(el, "width");
		 * axd.box_model(el, "height");
		 * axd.box_model(el, "padding");
		 * axd.box_model(el, "margin");
		 * axd.box_model(el, "border");
		 * axd.box_model(el, "borderWidth");
		 * axd.box_model(el, "border-width");
		 * axd.box_model(el, "boxSizing");
		 * axd.box_model(el, "box-sizing");
		 * // 각각의 박스모델 속성을 지정하여 호출 할 수 있습니다. borderWidth, border-width 중 하나의 방법으로 사용 가능합니다.
		 * ```
		 */
		function box_model(els, cond) {
			els = va_elem(els, "box_model");
			var el = els[0],
				model = {};
			if (cond) cond = U.camel_case(cond);
			if (typeof cond === "undefined" || cond == "offset") {
				model.offset = offset(el);
			}
			if (typeof cond === "undefined" || cond == "position") {
				model.position = position(el);
			}
			if (typeof cond === "undefined" || cond == "width") {
				model.width = width(el);
			}
			if (typeof cond === "undefined" || cond == "height") {
				model.height = height(el);
			}
			if (typeof cond === "undefined" || cond == "padding") {
				model.padding = U.map(style(el, ["padding-top", "padding-right", "padding-bottom", "padding-left"]), function (k, v) {
					return parseFloat(v);
				});
			}
			if (typeof cond === "undefined" || cond == "margin") {
				model.margin = U.map(style(el, ["margin-top", "margin-right", "margin-bottom", "margin-left"]), function (k, v) {
					return parseFloat(v);
				});
			}
			if (typeof cond === "undefined" || cond == "border") {
				model.border = U.map(style(el, ["border-top", "border-right", "border-bottom", "border-left"]), function (k, v) {
					return v;
				});
			}
			if (typeof cond === "undefined" || cond == "borderWidth") {
				model.borderWidth = U.map(style(el, ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"]), function (k, v) {
					return parseFloat(v);
				});
			}
			if (typeof cond === "undefined" || cond == "boxSizing") {
				model.boxSizing = style(el, "box-sizing");
			}

			return (typeof cond === "undefined") ? model : model[cond];
		}

		/**
		 * 엘리먼트에 data를 속성을 추가하거나 반환합니다.
		 * @method ax5.dom.data
		 * @param {Elements|Element} elements
		 * @param {String|Object} [command=get] - 명령어 "get|set|remove"
		 * @param {Object|String} O - json타입 또는 문자열
		 * @returns {Elements|Element|String}
		 * @example
		 * ```
		 * var axd = ax5.dom, axu = ax5.util, res = "";
		 *
		 * var el = axd.get("#list-container");
		 * axd.data(el, {a:1}); // set data
		 * axd.data(el, "set", {a:1100, b:[0,1,2,3]}); // set data
		 *
		 * res += axd.data(el, "a"); // get data
		 * res += axd.data(el, "get", "b"); // get data
		 * console.log(res);
		 * // 11000,1,2,3
		 *
		 * console.log(axd.data(el, "b"));
		 * // [0, 1, 2, 3]
		 * axd.data(el, "remove", "b"); // remove data
		 * console.log(axd.data(el, "b"));
		 * // ""
		 *
		 * axd.data(el, "remove"); // remove all
		 * ```
		 */
		function data(els, command, O) {
			//console.log(els, command, O);
			els = va_elem(els, "data");
			var i = 0, l = els.length, k;
			if (command === "set" || (typeof O === "undefined" && U.is_object(command))) {
				if (typeof O === "undefined") O = command;
				for (; i < l; i++) {
					for (k in O) {
						if (typeof els[i].ax5_data === "undefined") els[i].ax5_data = {};
						els[i].ax5_data[k] = O[k];
					}
				}
			}
			else if (command !== "remove" && (command === "get" || command === "read" || (typeof O === "undefined" && U.is_string(command)))) {
				if (typeof O === "undefined") O = command;
				if (!U.is_string(O)) return els;
				return (typeof els[0].ax5_data[O] === "undefined") ? "" : els[0].ax5_data[O];
			}
			else if (command === "remove") {
				if (typeof O === "undefined") {
					for (; i < l; i++) {
						els[i].ax5_data = {};
					}
				}
				else if (U.is_string(O)) {
					for (; i < l; i++) {
						delete els[i].ax5_data[O];
					}
				}
				else {
					for (; i < l; i++) {
						each(O, function () {
							delete els[i].ax5_data[this];
						});
					}
				}
			}
			return els;
		}

		/**
		 * 웹지엘 컨텍스트를 반환합니다.
		 * @method ax5.dom.get_webgl_context
		 * @returns {wegGlContext}
		 */
		function get_webgl_context(els){
			els = va_elem(els, "get_webgl_context");
			var apis = ['experimental-webgl','webgl','webkit-3d','moz-webgl','3d'],
				i = apis.length, el = els[0], ctx;
			while (i--) if (ctx = el.getContext(apis[i], {antialias: true})) break;
			if (ctx == null) alert("WebGL is not available");
			return ctx;
		}

		/**
		 * 엘리먼트 value값을 반환합니다.
		 * @method ax5.dom.val
		 * @param {Elements|Element} elements
		 * @param {String} [v] - element.value에 부여할 값
		 * @returns {String}
		 */
		function val(els, v){
			els = va_elem(els, "val");
			if(els[0] && 'value' in els[0]){
				if(typeof v !== "undefined") els[0].value = v;
				return els[0].value;
			}else{
				return null;
			}
		}

		U.extend(ax5.dom, {
			ready     : ready,
			scroll    : scroll,
			resize    : resize,
			get       : get,
			get_one   : get_one,
			create    : create,
			css       : css,
			class_name: class_name,
			attr      : attr,
			on        : on,
			off       : off,
			child     : child,
			parent    : parent,
			prev      : prev,
			next      : next,
			html      : html,
			width     : width,
			height    : height,
			append    : append,
			prepend   : prepend,
			before    : before,
			after     : after,
			manipulate: manipulate,
			remove    : remove,
			empty     : empty,
			offset    : offset,
			position  : position,
			box_model : box_model,
			data      : data,
			get_webgl_context: get_webgl_context,
			val       : val
		});
	})();

	if (typeof module === "object" && module && 'exports' in module) {
		module.exports = ax5; // commonJS
	} else {
		root.ax5 = ax5;
		if (typeof define === "function" && define.amd) define("_ax5", [], function () {
			return ax5;
		}); // requireJS
	}

}).call(this);

ax5.xhr = (function (){
	var U = ax5.util, getXHR;

	try{
		new ActiveXObject("Msxml2.XMLHTTP");
		getXHR = function(){return new ActiveXObject("Msxml2.XMLHTTP");}
	}catch(e){
		try{
			new ActiveXObject("Microsoft.XMLHTTP");
			getXHR = function(){return new ActiveXObject("Microsoft.XMLHTTP");}
		}catch(e){
			getXHR = "XMLHttpRequest" in window ? function(){return new XMLHttpRequest();} : function(){};
		}
	}
	
	function request(queue, onend){
		var cfg = queue.pop(), http, that, i,
            time_id, ontimeout;
		
		if (typeof cfg === "undefined") {
			onend();
		}
		else
		{
			cfg = U.extend_all(cfg, ax5.xhr.options);
			if (cfg.url != "") {
				http = getXHR();
				// 파라미터 값 문자열로 맞춤 : 오브젝트이면 문자열로 치환합니다.
				cfg.param = U.param(cfg.param, "param");
				// method : GET이면 url 뒤에 ? 파라미터 연결
				if(cfg.method.toUpperCase() == "GET" && cfg.param != "") {
					cfg.url = (cfg.url.search(/\?/) != -1) ? cfg.url + "&" + cfg.param : cfg.url + "?" + cfg.param;
				}

				if (!cfg.response)  cfg.response = cfg.res; // 함수이름 확장
				// xhr.open
				if (cfg.username)   http.open(cfg.method, cfg.url, cfg.async, cfg.username, cfg.password);
				else                http.open(cfg.method, cfg.url, cfg.async);

				// header 셋팅
				if(cfg.method.toUpperCase() == "GET"){
					// GET이면 head 무시
					cfg.header.accept = "*/*", cfg.header['content-type'] = "text/html";
				}
				
				try {
					for ( i in cfg.header ) {
						http.setRequestHeader( i, cfg.header[i] );
					}
				} catch(e) {}
				
				//  authorization headers. The default is false.
				if("withCredentials" in http) http.withCredentials = cfg.withCredentials;
				// todo : withCredentials 이 지원되지 않는 브라우저 일 때 대처법 필요

				// 응답
				http.onreadystatechange = function () {
					if (http.readyState == 4) {
                        if(time_id == -1) return;
                        clearTimeout(time_id), time_id = -1;
						that = {};
						that.response_url= ("responseURL" in http) ? http.responseURL : "";
						that.status      = ("status" in http) ? http.status : "";
						that.result      = http.statusText;
						that.state       = http.readyState;
						that.type        = http.responseType;

						try {
							that.data = ("responseText" in http) ? http.responseText : "";
							if(http.responseType == "JSON" && typeof that.data == "string") that.data = U.parse_json(that.data);
						}catch(e){}

						if (http.status == 200) {
							if (cfg.response) cfg.response.call(that, that.data, that.status, http);
							else console.log(http);
						}
						else
						if (http.status != 0)
						{
							that.error = that.result; // 에러키 추가
							if (cfg.error) {
								cfg.error.call(that, that);
							} else {
								if (cfg.response) cfg.response.call(that, that.data, that.status, http);
								else console.log(http);
							}
						}
						request(queue, onend);
					}
				};
                ontimeout = function(){
                    if(time_id == -1) return;
                    if(http.readyState !== 4) http.abort();
                    time_id = -1;
	                //http.onreadystatechange = null;
                    
                    that = {error:"timeout"};
                    if (cfg.error) {
                        cfg.error.call(that, that);
                    } else {
                        if (cfg.response) cfg.response.call(that, that, that.data, that.status, http);
                        else console.log(http);
                    }
                };
                if( "ontimeout" in http ) http.timeout = cfg.timeout, http.ontimeout = ontimeout;
                else time_id = setTimeout( ontimeout, cfg.timeout);

				http.onerror = function(e){
					that = cfg;
					//that.error = "error";
					if (cfg.error) {
						cfg.error.call(that, that);
					} else {
						if (cfg.response) cfg.response.call(that, that, that.data, that.status, http);
						else console.log(http);
					}
				};

				// 데이터 전송
				http.send(cfg.param);
			}
			
		}
	}
	
	// todo : CORS지원 / 예외사항 처리
	/**
	 * Refer to this by {@link ax5}. <br/>
	 * ax5.xhr({Object}[, {Function}]); 으로 사용하는 함수입니다. XHR요청을 개별또는 큐단위로 처리 합니다.
	 * @namespace ax5.xhr
	 * @param {Object} opts
	 * @param {Function} [onend] - xhr전송이 완료되면 호출되는 콜백함수
	 * @example
	 * ```
	 * // request 옵션정의
	 * config = {
	 * 	header         : {
	 * 		//setRequestHeader 로 추가하게될 헤드 속성
	 * 		'content-type' : {String} ["application/x-www-form-urlencoded; charset=UTF-8"] - request 되는 문서의 content Type,
	 * 		'accept'       : {String} ["*＼*"] - 서버에 응답받기 희망하는 문서 타입,
	 * 	},
	 * 	method         : {String} ["GET"],
	 * 	url            : {String} [""],
	 * 	param          : {String|Object} [""] - 파라미터 형식이나 오브젝트 형식 모두 지원합니다.,
	 * 	async          : {Boolean} [true] - 비동기 요청 여부,
	 * 	username       : {String} [""] - XMLHttpRequest 스펙에 정의된 open() 옶션 사용 안해봐서 잘 모름,
	 * 	password       : {String} [""] - XMLHttpRequest 스펙에 정의된 open() 옶션 사용 안해봐서 잘 모름,
	 * 	withCredentials: {Boolean} [false] - 자격증명을 사용하게 할지 여부,
	 * 	crossDomain    : {Boolean} [false] - 크로스 도메인 허용 여부 : header 속성이 약간 바뀝니다.,
	 * 	timeout        : 0
	 * }
	 * 
	 * ax5.xhr({
	 *    method: "POST",
	 *    url   : "data.php",
	 *    param : "str=1234",
	 *    res   : function (response, status) {
	 *        console.log("success");
	 *        console.log(this);
	 *    },
	 *    error : function () {
	 *        console.log("error");
	 *        console.log(this);
	 *    }
	 * });
	 * 
	 * // req 또는 request 둘다 사용 가능합니다.
	 * ax5.xhr({
	 *    url   : "data.php",
	 *    param : "str=1234",
	 *    res   : function (response, status) {
	 *        // status 값이 200 인지 판단 가능
	 *        console.log(this);
	 *    }
	 * });
	 * // 위와 같이 필요한 옵션만 정의 해서 사용 가능합니다.
	 * 
	 * // 요청을 큐로 만들어 순차적으로 작동하게 하고 종료 시점을 컨트롤 할 수 있습니다.
	 * var xhr_queue = [];
	 * xhr_queue.push({
	 *    method: "POST",
	 *    url   : "../samples/ax5/xhr/data.php",
	 *    param : "str=1234",
	 *    res   : function (response, status) {
	 *        console.log(response);
	 *    }
	 * });
	 * xhr_queue.push({
	 *    method: "POST",
	 *    url   : "../samples/ax5/xhr/data.php",
	 *    param : "str=1234",
	 *    res   : function (response, status) {
	 *        console.log(response);
	 *    }
	 * });
	 * 
	 * ax5.xhr(xhr_queue, function() {
	 *    console.log("큐 완료")
	 * });
	 * ```
	 */
	return function(opts, onend){
		var queue = [].concat(opts);
		request(queue, function(){
			if(onend) onend();
		});
	}
})();

(function () {
	var U = ax5.util, 
		options = {
			header      : {
				'accept'      : "*/*",
				'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
			},
			method         : "GET",
			url            : "",
			param          : "",
			async          : true,
			username       : "",
			password       : "",
			withCredentials: false,
			crossDomain    : false,
			timeout        : 3000
		};
		
/**
 * @member {type} ax5.xhr.options
 * @example
 * ```
 * ax5.xhr.options = {
 * 	header         : {
 * 		//setRequestHeader 로 추가하게될 헤드 속성
 * 		'content-type' : {String} ["application/x-www-form-urlencoded; charset=UTF-8"] - request 되는 문서의 content Type,
 * 		'accept'       : {String} ["*＼*"] - 서버에 응답받기 희망하는 문서 타입,
 * 	},
 * 	method         : {String} ["GET"],
 * 	url            : {String} [""],
 * 	param          : {String|Object} [""] - 파라미터 형식이나 오브젝트 형식 모두 지원합니다.,
 * 	async          : {Boolean} [true] - 비동기 요청 여부,
 * 	username       : {String} [""] - XMLHttpRequest 스펙에 정의된 open() 옶션 사용 안해봐서 잘 모름,
 * 	password       : {String} [""] - XMLHttpRequest 스펙에 정의된 open() 옶션 사용 안해봐서 잘 모름,
 * 	withCredentials: {Boolean} [false] - 자격증명을 사용하게 할지 여부,
 * 	crossDomain    : {Boolean} [false] - 크로스 도메인 허용 여부 : header 속성이 약간 바뀝니다.,
 * 	timeout        : 0
 * } 
 * ```
 */

/**
 * ax5.xhr 통신 기본 값을 설정합니다.
 * @method ax5.xhr.config
 * @param {Object} opts - XHR 요청옵션 기본 값
 * @returns {Object} opts
 * @example
 * ```
 * ax5.xhr.config({
 *	header      : {
 *		'accept'      : "*.*",
 *		'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
 *	},
 *	method         : "GET",
 *	url            : "",
 *	param          : "",
 *	async          : true,
 *	username       : "",
 *	password       : "",
 *	withCredentials: false,
 *	crossDomain    : false,
 *	timeout        : 0
 * });
 *
 * ax5.xhr.config({
 *	header      : {
 *		'accept' : "*.html"
 *	}
 * });
 * // ax5.xhr 요청 기본값 설정
 * ```
 */
	function config(opts){
		options = U.extend_all(options, opts, true);
		return options;
	}

	ax5.util.extend(ax5.xhr, {
		options: options,
		config : config
	});
})();

/**
 * @class ax5.ui.root
 * @classdesc ax5 ui class 코어 클래스 모든 클래스의 공통 함수를 가지고 있습니다.
 * @version v0.0.1
 * @author tom@axisj.com
 * @logs
 * 2014-12-12 tom : 시작
 * @example
 * ```
 * var myui = new ax5.ui.root();
 * ```
 */
ax5.ui = (function (core) {

	function ax_ui() {
		// 클래스 인스턴스 초기화
		this.main = (function(){
			this.config = {};
			this.name = "root";
		}).apply(this, arguments);

		/**
		 * 클래스의 속성 정의 메소드 속성 확장후에 내부에 init 함수를 호출합니다.
		 * @method ax5.ui.root.set_config
		 * @param {Object} config - 클래스 속성값
		 * @param {Boolean} [call_init=true] - init 함수 호출 여부
		 * @returns {ax5.ui.ax_ui}
		 * @example
		 * ```
		 * var myui = new ax5.ui.root();
		 * myui.set_config({
		 * 	id:"abcd"
		 * });
		 * ```
		 */
		this.set_config = function (cfg, call_init) {
			core.util.extend_all(this.config, cfg, true);
			if (typeof call_init == "undefined" || call_init === true) {
				this.init();
			}
			return this;
		};
		this.init = function () {
			console.log(this.config);
		};

		this.bind_window_resize = function(callBack){

			setTimeout((function(){
				ax5.dom.resize((function(){
					if(this.bind_window_resize__) clearTimeout(this.bind_window_resize__);
					this.bind_window_resize__ = setTimeout((function(){
						callBack.call(this);
					}).bind(this), 10);
				}).bind(this));
			}).bind(this), 100);

		};
	}

	return {
		root: ax_ui
	}
})(ax5);