/**
 * xy 核心方法 -v0.0.1
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
;(function(window, XY, undefined){

  var me = this
    , EMPTY = ''
    , __eventTarget = {}
    , __tplCache = {}
    , __isType = function(obj, type){
        return Object.prototype.toString.call(obj) === '[object '+ type +']';
      };

  /**
   * console 兼容
   */
  window.console || (console = { log: function(){}, dir: function(){}, error: function(){} });

  /*
   * 将源对象的成员复制到目标对象中
   * @param { Object } 目标对象
   * @param { Object } 源对象
   * @param { Boolean } 是否覆盖 默认为true(覆盖)
   * @param { Array } 只复制该数组中在源对象中的属性
   * @return { Object } 目标对象
   */
  XY.mix = function( target, source, override, whitelist ){
    if( !target || !source ) return;
    if( override === undefined ){
      override = true;
    }

    var prop, len, i,
      _mix = function( prop ){
        if( override === true || !(prop in target) ){
          target[ prop ] = source[ prop ];
        }
      };      
    
    if( whitelist && (len = whitelist.length) ){
      for( i = len; i; ){
        prop = whitelist[--i];
        if( prop in source ){
          _mix( prop );
        }
      }
    }else{
      for( prop in source ){
        _mix( prop );
      }
    }
    
    return target;
  };

  /**
   * 基础工具方法
   */
  XY.mix(XY, {

    version: '0.0.1',

    browser: {}, // 存储浏览器名和版本数据

    module: {}, // 模块加载器缓存对象

    /**
     * 生成一个随机 id
     */
    uniqueId: function(pre, length){
      var text = pre || 'xyJS_'
        , length = length || 6
        , possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

      for(var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    },

    /*
     * 将多个对象合并成一个新对象，后面的对象属性将覆盖前面的
     * 常用于合并配置对象
     * @param { Object } 一个或多个对象
     * @return { Object } 合并后的新对象
     */
    merge: function(){
      var result = {};
      for(var i = 0, len = arguments.length; i < len; i++){
        XY.mix(result, arguments[i]);
      }

      return result;
    },

    /**
     * 遍历对象并执行回调
     * @param  {Object}   obj     待遍历对象
     * @param  {Function} fn      回调函数
     * @param  {Object}   context 上下文
     * @return {Object}           返回遍历的对象
     */
    each: function(obj, fn, context){
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
    },

    /*
     * 将对象转换成真实数组
     * 常用于将arguments, NodeList等array-like对象转换成真实数组
     * @param {} source 任意类型的数据
     * @param {Array} target 目标数组
     * @return {Array} 真实的数组
     */
    makeArray: function(source, target){
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
    },

    /**
     * 去除首尾空格
     */
    trim: function(str){
      if(typeof str === 'string'){
        return str.replace(/^\s*|\s*$/g, EMPTY);
      }
    },

    /**
     * 封装字符探针
     */
    indexOf: function(i, objective){
      if(objective){
        if(objective.indexOf(i) !== -1){
          return true;
        }else{
          return false;
        }
      }
    },

    isObject: function(obj){
      return __isType(obj, 'Object');
    },

    isArray: function(obj){
      return __isType(obj, 'Array');
    },

    isString: function(obj){
      return __isType(obj, 'String');
    },

    isNumber: function(obj){
      return __isType(obj, 'Number');
    },

    isFunction: function(obj){
      return __isType(obj, 'Function');
    },

    isRegExp: function(obj){
      return __isType(obj, 'RegExp');
    },

    isUndefined: function(obj){
      return __isType(obj, 'Undefined');
    },

    isNodelist: function(obj){
      return __isType(obj, 'Nodelist');
    },

    /**
     * 引入模块
     */
    install: function(mod, fn){
      XY.mix(XY[mod] = {}, fn.call(me, X, X[mod]));
    },

    // 函数节流
    throttle: function(opt){
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
    },

    /**
     * base64 编码
     */
    base64Encode: function(input){
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
    },

    /**
     * base64 解码
     */
    base64Decode: function(input){
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
    },

    parseXML: function( data ) {
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
    },
    
    encodeJSON: function( o ) {
      if ( typeof o === 'string' ){
        return window.JSON ? JSON.parse( o ) : eval( "(" + o + ')' );
      }else{
        return o ;
      }
    },

    decodeJSON: function (json) {
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
    },

    encodeHTML: function(str){
      return String(str).replace(/["<>& ]/g, function(all){
        return "&" + {
            '"': 'quot',
            '<': 'lt',
            '>': 'gt',
            '&': 'amp',
            ' ': 'nbsp'
        }[all] + ";";
      });
    },

    decodeHTML: function(str){
      return String(str).replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g, "&");
    },

    isEmptyObject: function( obj ){
      var name;
      for( name in obj ){
        return false;
      }
      return true;
    },

    setCookie: function(name, value, time){
      var date = new Date();
      time = time || 7;
      date.setTime(date.getTime() + time*24*60*60*1000);
      document.cookie = name + "=" + value + "; expires=" + date.toGMTString()+"; path=/";
    },

    getCookie: function(name){
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
    },

    delCookie: function(name, path, domain){
      XY.setCookie( name, '', 'Thu, 01 Jan 1970 00:00:00 GMT', path, domain );
    },

    template: function(str, data){
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
    },

    /**
     * 自定义事件(观察者模式)
     */
    EventTarget: {
      on: function(name, handle){
        // __eventTarget[name] = handle;
        if(name.indexOf(',') > -1){
          var names = name.split(',');
          for(var i = 0; i < names.length; i++){
            this.on(names[i], handle);
          }
        }else{
          var ev = __eventTarget[name] || (__eventTarget[name] = []);
          ev.push(handle);
        }
        return this;
      },

      fire: function(){
        // if(!XY.isUndefined(__eventTarget[name])){
        //   __eventTarget[name].call(me, obj);
        // }
        var args = Array.prototype.slice.call(arguments, 0)
          , ev = args.shift()
          , scope = this;

        if(typeof ev !== 'string'){
          scope = ev;
          ev = args.shift();
        }

        var handle = __eventTarget[ev];
        if(handle instanceof Array){
          for(var i = 0, p; p = handle[i++]; ){
            this.eventTag = ev;
            p.apply(scope, args);
          }
        }
        return this;
      },

      detach: function(name, handle){
        // if(!XY.isUndefined(__eventTarget[name])){
        //   __eventTarget[name] = null;
        // }
        var ev = __eventTarget[name];
        if(ev){
          if(!!handle){
            for(var i = 0, p; p = ev[i++]; ){
              if(handle === p){
                ev.splice(i-1, 1);
                i--;
              }
            }
          }else{
            __eventTarget[name] = null;
          }
        }
        return this;
      }
    }

  });

  
  /**
   * 定义模块全局方法(AMD规范)
   * @param  {String} name    模块名
   * @param  {String/Array} deps    依赖模块列表，单个可以用字符串形式传参，多个用数组形式传参
   * @param  {Function} factory 工厂函数，模块内容(参数对应依赖模块的外部接口)
   */
  window.define = function(name, deps, factory){
    

    
  };


})(window, window.XY || {});

