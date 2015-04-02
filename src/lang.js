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
    
    , ObjProto = Object.prototype
    , toString = ObjProto.toString
    , nativeForeach = Array.prototype.forEach
    , breaker = {}
    , tplCache = {}
    , TimerRes = {};

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

  /**
   * 遍历对象并执行回调
   * @param  {Objece|Array} obj    待遍历对象或数组
   * @param  {Function} iterator   回调函数
   * @param  {Object} context      上下文
   */
  XY.each = function( obj, iterator, context ){
    if(obj === null) return;

    if(nativeForeach && obj.forEach === nativeForeach){
      obj.forEach(iterator, context);
    }
    else if(obj.length === +obj.length){
      for(var i = 0; i < obj.length; i++){
        if( i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    }
    else{
      for(var key in obj){
        if( XY.has(obj, key) ){
          if( iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  XY.has = function(obj, key){
    return ObjProto.hasOwnProperty.call(obj, key);
  };

  /**
   * 数组去重
   * @param  {Array} arr  待处理的数组
   * @return {Array}     去重得到的新数组
   */
  XY.distinct = function(arr){
    var tempArray = []
      , temp = ''
      , index = 0;

    for(var i = 0; i < arr.length; i++){
      temp = arr[i];
      for(var j = 0; j < tempArray.length; j++){
        if(temp === tempArray[j]){
          temp = '';
          break;
        }
      }
      if(!temp == null || temp !== ''){
        tempArray[index] = temp;
        index++;
      }
    }
    return tempArray;
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
  
  XY.JSONparse = function( data ) {
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

  XY.JSONstringify = function (json) {
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
   * @property {string} PATH 脚本库的运行路径
   * @type string
   */
  XY.PATH = (function() {
    var sTags = document.getElementsByTagName('script');
    return sTags[sTags.length - 1].src.replace(/(^|\/)[^\/]+\/[^\/]+$/, '$1');
  });

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
        , callbackReplacer = options.callbackReplacer || /%callbackfun%/ig;

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

    input = XY.utf8Encode(input);

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

    output = XY.utf8Decode(output);

    return output;
  };

  XY.utf8Encode = function(string){
    string = string.replace(/\r\n/g, '\n');  
    var utftext = '';  
    for (var n = 0; n < string.length; n++) {  
      var c = string.charCodeAt(n);  
      if (c < 128) {
        utftext += String.fromCharCode(c);  
      } 
      else if((c > 127) && (c < 2048)) {  
        utftext += String.fromCharCode((c >> 6) | 192);  
        utftext += String.fromCharCode((c & 63) | 128);  
      } 
      else {  
        utftext += String.fromCharCode((c >> 12) | 224);  
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
        utftext += String.fromCharCode((c & 63) | 128);  
      }  

    }  
    return utftext; 
  };

  XY.utf8Decode = function(utftext){
    var string = '';  
    var i = 0;  
    var c = c1 = c2 = 0;  
    while ( i < utftext.length ) {  
      c = utftext.charCodeAt(i);  
      if (c < 128) {  
        string += String.fromCharCode(c);  
        i++;  
      } 
      else if((c > 191) && (c < 224)) {  
        c2 = utftext.charCodeAt(i+1);  
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
        i += 2;  
      } 
      else {  
        c2 = utftext.charCodeAt(i+1);  
        c3 = utftext.charCodeAt(i+2);  
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
        i += 3;
      }  
    }  
    return string;
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

  /**
   * 简单路由
   */
  XY.miniRoute = function() {
      var args = arguments;

      for(var i = 0, l = args.length; i < l; i++) {
          var item = args[i],
              path = item['path'],
              func = item['func'];

          if(path && func) {
              var params = pathname.match(path);
              if(params) {
                  func.apply(item, params);
              }
          }
      }
  };
  
  // 首字母大写转换
  XY.capitalize = function( str ){
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  };

  /** 
   * 解析url或search字符串。
   * @method queryUrl
   * @static
   * @param {String} s url或search字符串
   * @param {String} key (Optional) 参数名。
   * @return {Json|String|Array|undefined} 如果key为空，则返回解析整个字符串得到的Json对象；否则返回参数值。有多个参数，或参数名带[]的，参数值为Array。
   */
  XY.queryUrl = function(url, key) {
    url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
    var json = {};
    //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
    url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
      //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
      try {
        key = decodeURIComponent(key);
      } catch(e) {}

      try {
        value = decodeURIComponent(value);
      } catch(e) {}

      if (!(key in json)) {
        json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
      }
      else if (json[key] instanceof Array) {
        json[key].push(value);
      }
      else {
        json[key] = [json[key], value];
      }
    });
    return key ? json[key] : json;
  };

  /** 
   * 将所有tag标签消除，即去除<tag>，以及</tag>
   * @method stripTags
   * @static
   * @param {String} s 字符串
   * @return {String} 返回处理后的字符串
   */
  XY.stripTags = function(s) {
    return s.replace(/<[^>]*>/gi, '');
  };

  /**
   * 原生 setInterval 封装
   * @param {Function} fn      回调函数(必须)
   * @param {Number}   timeout 时间间隔(必须)
   * @param {String}   ns      命名空间(可选)
   */
  XY.setInterval = function(fn, timeout, ns) {
    if(!ns) ns = 'g';
    if(!TimerRes[ns]) TimerRes[ns] = [];
    TimerRes[ns].push(setInterval(fn, timeout));
  }

  /**
   * 原生 clearInterval 封装
   * @param  {[type]} rid 由 setInterval() 返回的 ID 值
   * @param  {[type]} ns  命名空间
   * @return {[type]}     
   */
  XY.clearInterval = function(rid, ns) {
    var k, v, k1, i, len, i1, len1, resArr, j;

    if(typeof rid == 'number') {
      for(k in TimerRes) {
        v = TimerRes[i];
        for(i = 0, len = v.length; i < len; i++) {
          if(rid == v[i]) {
            v.splice(i, 1);
            clearInterval(rid);
            return;
          }
        }
      }
    }

    if(typeof rid == 'string') {
      ns = rid;
      resArr = TimerRes[ns];
      j = resArr.length;
      while(j != 0) {
        XY.clearInterval(resArr[resArr.length - 1]);
      }
    }

    if(arguments.length == 0) {
      for(k1 in TimerRes) {
        XY.clearInterval(k1);
      }
    }

  }


  /**
   * 抛出异常
   * @method error
   * @static
   * @param { obj } 异常对象
   * @param { type } Error (Optional) 错误类型，默认为Error
   */
  XY.error = function(obj, type) {
    type = type || Error;
    throw new type(obj);
  }

  window.XY = XY;

})(window, window.XY || {});
