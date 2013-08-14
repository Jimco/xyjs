/**
 * 自定义扩展模块
 * Author: xiejiancong.com
 * Date: 2012-09-24
 * require:
 *  core.js 
 *  lang-patch.js
 */
 
(function(window, XY, undefined){
  
  var rValidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
    , rValidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g
    , rValidbraces = /(?:^|:|,)(?:\s*\[)+/g
    , rSelectForm = /^(?:select|form)$/i
    , rValidchars = /^[\],:{}\s]*$/  
    
    , toString = Object.prototype.toString
    , __tplCache = {};

  /**
   * console 兼容
   */
  window.console || (console = { log: function(){}, dir: function(){}, error: function(){} });
  

  XY.type = function( obj ){
    return toString.call( obj ).slice( 8, -1 ).toLowerCase();
  };

  // 类型判断
  [ 'Array', 'Function', 'Object', 'RegExp', 'NodeList' ].forEach(function( type ){
    XY[ 'is' + type ] = function( obj ){
      return obj && toString.call( obj ) === '[object ' + type + ']';
    };
  });

  [ 'Boolean', 'Number', 'String' ].forEach(function( type ){
    XY[ 'is' + type ] = function( obj ){
      return typeof obj === type.toLowerCase();
    };
  });

  // 标准浏览器使用原生的判断方法
  if( Array.isArray ){
    XY.isArray = Array.isArray;
  }

  // 判断是否为空对象
  XY.isEmptyObject = function( obj ){
    var name;
    for( name in obj ){
      return false;
    }
    return true;
  };
  
  // 判断是否为纯粹的对象
  XY.isPlainObject = function( obj ){
    if( !obj || !XY.isObject(obj) ){
      return false;
    }
    var name;
    
    try{
      for( name in obj ){
        if( !Object.prototype.hasOwnProperty.call(obj,name) ){
          return false;
        }
      }
    }
    catch( _ ){
      return false;
    }
      
    return true;
  };
  
  XY.isWindow = function( obj ) {
    return obj && typeof obj === 'object' && 'setInterval' in obj;
  };

  /*
   * 遍历对象并执行回调
   * obj: 对象
   * fn: 回调函数(如果回调函数的返回值为false将退出循环)
   * context: 上下文
   * return: Object 
   */
  XY.each = function( obj, fn, context ){    
    var isObj = obj.length === undefined || typeof obj === 'function'
      , i;      
    
    if( isObj ){
      for( i in obj ){
        if( fn.call(context, i, obj[i]) === false ){
          break;
        }
      }
    }
    
    return obj;
  };
  
  /*
   * 将对象转换成真实数组
   * 常用于将arguments, NodeList等array-like对象转换成真实数组
   * source: 任意类型的数据
   * target: 目标数组
   * return: 真实的数组
   */
  XY.makeArray = function( source, target ){
    target = target || [];
    var i = 0
      , len = source.length;

    if( source !== null && source !== undefined ){
      if( XY.isArray(source) && XY.isArray(target) && !target.length ){
        return source;
      } 
      
      if( typeof len !== 'number' || 
        typeof source === 'string' || 
        XY.isFunction(source) || 
        XY.isRegExp(source) || 
        source === window ||
        // select元素有length属性，select[0]将直接返回第一个option
        // form元素也有length属性
        source.tagName && rSelectForm.test(source.tagName) ){
          target[ target.length++ ] = source;
      }
      else{
        for( ; i < len; i++ ){
          target[ target.length++ ] = source[i];
        }
      }
    }
    
    return target;
  };

  XY.parseXML = function( data ) {
    var xml, tmp;
    try {
      // 标准浏览器
      if ( window.DOMParser ) { 
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , 'text/xml' );
      }
      // IE6/7/8
      else{
        xml = new ActiveXObject( 'Microsoft.XMLDOM' );
        xml.async = 'false';
        xml.loadXML( data );
      }
    } catch( e ) {
      xml = undefined;
    }
    
    return xml;
  };
  
  XY.parseJSON = function( data ) {
    if ( !data || !XY.isString(data) ){
      return null;
    }

    data = data.trim();
    
    // 标准浏览器可以直接使用原生的方法
    if( window.JSON && window.JSON.parse ){
      return window.JSON.parse( data );
    }
    
    if ( rValidchars.test( data.replace( rValidescape, '@' )
      .replace( rValidtokens, ']' )
      .replace( rValidbraces, '')) ) {

      return (new Function( 'return ' + data ))();
    }
  };

  XY.decodeJSON = function (json) {
    if (window.JSON && window.JSON.stringify) {
      return JSON.stringify(json);
    }
    var html = [];
    if(typeof json == 'object') {
      if(json instanceof Array){
        var ar = [];
        html.push("[");
        for(var i = 0; i < json.length; i ++) {
          ar.push(this.decodeJSON(json[i]));
        }
        html.push(ar.join());
        html.push("]");
      } else {
        html.push("{");
        var ar = [];
        for(var p in json) {
          ar.push("\"" + p + "\":" + (this.decodeJSON(json[p])));
        }
        html.push(ar.join());
        html.push("}");
      }
      return html.join("");
    } else {
      if(typeof json !== 'number') {
        return "\"" + ( json || "" ) + "\"";
      } else {
        return json;
      }
    }
  };

  // 函数节流
  XY.throttle = function(opt){
    var timer = null
      , t_start
      , fn = opt.fn
      , context = opt.context
      , delay = opt.delay || 100
      , mustRunDelay = opt.mustRunDelay || 50;

    return function(){
      var args = arguments
        , t_curr = +new Date();
      context = context || this;
      
      clearTimeout(timer);
      if(!t_start){
        t_start = t_curr;
      }
      if(mustRunDelay && t_curr - t_start >= mustRunDelay){
        fn.apply(context, args);
        t_start = t_curr;
      }
      else {
        timer = setTimeout(function(){
          fn.apply(context, args);
        }, delay);
      }
    };
  };

  /**
   * base64 编码
   */
  XY.base64Encode = function(input){
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      , output = ''
      , chr1, chr2, chr3, enc1, enc2, enc3, enc4
      , i = 0;

    input = window.utf8Encode(input);

    while (i < input.length){
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) { enc3 = enc4 = 64; }
      else if (isNaN(chr3)) { enc4 = 64; }

      output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }

    return output;
  };

  /**
   * base64 解码
   */
  XY.base64Decode = function(input){
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      , output = ''
      , chr1, chr2, chr3
      , enc1, enc2, enc3, enc4
      , i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) { output = output + String.fromCharCode(chr2); }
      if (enc4 !== 64) { output = output + String.fromCharCode(chr3); }
    }

    output = XY.Util.utf8Decode(output);

    return output;
  };

  XY.encodeHTML = function(str){
    return String(str).replace(/["<>& ]/g, function(all){
      return "&" + {
          '"': 'quot',
          '<': 'lt',
          '>': 'gt',
          '&': 'amp',
          ' ': 'nbsp'
      }[all] + ";";
    });
  };

  XY.decodeHTML = function(str){
    return String(str).replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g, "&");
  };

  XY.setCookie = function(name, value, time){
    var date = new Date();
    time = time || 7;
    date.setTime(date.getTime() + time*24*60*60*1000);
    document.cookie = name + "=" + value + "; expires=" + date.toGMTString()+"; path=/";
  };

  XY.getCookie = function(name){
    var search = name + '=';
    if(document.cookie.length > 0){ 
      offset = document.cookie.indexOf(search); 
        if(offset != -1){ 
          offset += search.length; 
          end = document.cookie.indexOf(';',offset); 
          if(end == -1) end = document.cookie.length;
          return document.cookie.substring(offset, end); 
        }else{
          return ''; 
        }
    }else{
      return '';
    }
  };

  XY.delCookie = function(name, path, domain){
    XY.setCookie( name, '', 'Thu, 01 Jan 1970 00:00:00 GMT', path, domain );
  };

  XY.template = function(str, data){
    var fn = !/\W/.test(str) ? tplCache[str] = tplCache[str] ||
      XY.template(document.getElementById(str).innerHTML) :
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        "with(obj){p.push('" +
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    return data ? fn( data ) : fn;
  };
  
  // 首字母大写转换
  XY.capitalize = function( str ){
    var firstStr = str.charAt(0);
    return firstStr.toUpperCase() + str.replace( firstStr, '' );
  };

  window.XY = XY;

})(window, window.XY || {});
