/**
 * 自定义扩展模块
 * Author: xiejiancong.com
 * Date: 2012-09-24
 * rely: core.js lang-patch.js
 */
;(function(window, XY, undefined){
  
  var rValidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
    , rValidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g
    , rValidbraces = /(?:^|:|,)(?:\s*\[)+/g
    , rSelectForm = /^(?:select|form)$/i
    , rValidchars = /^[\],:{}\s]*$/  
    
    , toString = Object.prototype.toString
    , tplCache = {};

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
  
  XY.encodeJSON = function( data ) {
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

  /**
   * 函数节流方法
   * @param  {Function} func 执行函数
   * @param  {Number} wait   时间间隔
   * @return {Function}      返回一个函数，该函数会自动调用func，并进行节流控制
   * eg:
   * var lazyUpdate = XY.throttle(updatePosition, 100);
   * $(window).scroll(lazyUpdate);
   */
  XY.throttle = function(func, wait){
    var context, args, timeout, throttling, more,result
      , whenDone = XY.debounce(function(){
        more = throttling = false;  
      }, wait);

    return function(){
      context = this;
      args = arguments;
      var later = function(){
          timeout = null;
          if(more) func.apply(context, args);
          whenDone();
        };

      if(!timeout) timeout = setTimeout(later, wait);

      if(throttling){
        more = true;
      }
      else{
        result = func.apply(context, args);
      }

      whenDone();
      throttling = true;
      return result;
    }
  };

  /**
   * 函数节流方法
   * @param  {Function} func     执行函数
   * @param  {Number} wait       允许的时间间隔
   * @param  {Boolean} immediate 是否立即执行，true为立即调用，false为在时间截止时调用
   * @return {Function}          返回一个函数，该函数会自动调用func，并进行节流控制
   * eg:
   * var lazyLayout = XY.debounce(calculateLayout, 300);
   * $(window).resize(lazyLayout);
   */
  XY.debounce = function(func, wait, immediate){
    var timeout;
    return function(){
      var context = this
        , args = arguments
        , later = function(){
          timeout = null;
          if(!immediate) func.apply(context, args);
        };

      if(immediate && !timeout) func.apply(context, args);

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    }
  };

  /**
   * 异步加载脚本
   * @method loadJs
   * @static
   * @param { String } url Javascript文件路径
   * @param { Function } callback (Optional) Javascript加载后的回调函数
   * @param { Option } options (Optional) 配置选项，例如charset
   */
  XY.loadJs = function(url, callback, options) {
    options = options || {};
    var head = document.getElementsByTagName('head')[0] || document.documentElement
      , script = document.createElement('script')
      , done = false;

    script.src = url;
    if (options.charset) {
      script.charset = options.charset;
    }
    if ( 'async' in options ){
      script.async = options['async'] || '';
    }
    script.onerror = script.onload = script.onreadystatechange = function() {
      if(!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")){
        done = true;

        if(callback) callback();
        script.onerror = script.onload = script.onreadystatechange = null;
        head.removeChild(script);
      }
    };
    head.insertBefore(script, head.firstChild);
  };

  /**
   * 加载jsonp脚本
   * @method loadJsonp
   * @static
   * @param { String } url Javascript文件路径
   * @param { Function } callback (Optional) jsonp的回调函数
   * @param { Option } options (Optional) 配置选项，目前除支持loadJs对应的参数外，还支持：
      {RegExp} callbackReplacer (Optional) 回调函数的匹配正则。默认是：/%callbackfun%/ig；如果url里没找到匹配，则会添加“callback=%callbackfun%”在url后面
      {Function} oncomplete (Optional) Javascript加载后的回调函数
   */
  XY.loadJsonp = (function(){
    var seq = new Date() * 1;
    return function (url , callback , options){
      options = options || {};
      var funName = "XYJsonp" + seq++
        , callbackReplacer = options .callbackReplacer || /%callbackfun%/ig;

      window[funName] = function (data){
        if(callback) callback(data);
        window[funName] = null;
        try{
          delete window[funName];
        }catch(e){};
      };

      if(callbackReplacer.test(url)){
        url = url.replace(callbackReplacer,funName);
      } 
      else{
        url += (/\?/.test( url ) ? '&' : '?') + 'callback=' + funName;
      }
      XY.loadJs(url , options.oncomplete , options);
    };
  }());


  /**
   * 加载css样式表
   * @method loadCss
   * @static
   * @param { String } url Css文件路径
   */
  XY.loadCss = function(url) {
    var head = document.getElementsByTagName('head')[0] || document.documentElement,
    css = document.createElement('link');
    css.rel = 'stylesheet';
    css.type = 'text/css';
    css.href = url;
    head.insertBefore(css, head.firstChild);
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
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  };

  window.XY = XY;

})(window, window.XY || {});
