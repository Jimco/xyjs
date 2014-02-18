/**
 * xy 核心方法 -v0.0.1
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
;(function(window, XY, undefined){

  var me = this
    , moduleCache = {}    // 模块缓存对象
    , eventSplitter = /\s+/
    // 浏览器判定的正则    
    , rUA = [ /ms(ie)\s(\d\.\d)/,                       // IE
            /(chrome)\/(\d+\.\d+)/,                     // chrome
            /(firefox)\/(\d+\.\d+)/,                    // firefox                  
            /version\/(\d+\.\d+)(?:\.\d)?\s(safari)/,   // safari
            /(opera)(?:.*version)\/([\d.]+)/ ];         // opera;

  /*
   * 将源对象的成员复制到目标对象中
   * @param {Object}  target 目标对象
   * @param {Object}  source 源对象
   * @param {Boolean} override 是否覆盖 默认为true(覆盖)
   * @param {Array}   whitelist 只复制该数组中在源对象中的属性
   * @return {Object} 目标对象
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

    VERSION: '0.0.1',

    /**
     * @property {string} PATH 脚本库的运行路径
     * @type string
     */
    PATH: (function() {
      var sTags = document.getElementsByTagName("script");
      return sTags[sTags.length - 1].src.replace(/(^|\/)[^\/]+\/[^\/]+$/, "$1");
    }()),

    __uuid__: 2,

    // 存储浏览器名和版本数据
    browser: (function(){
      var ua = navigator.userAgent.toLowerCase()
        , len = rUA.length
        , i = 0
        , matches;
      
      for( ; i < len; i++ ){
        if( (matches = ua.match(rUA[i])) ) break;
      }
      
      if(!matches){
          matches = [];
      }
      if(matches[2] === 'safari'){
        matches[2] = matches[1];
        matches[1] = 'safari';
      }
      
      return {
          browser : matches[1] || '',
          version : matches[2] || 0
      };
    }()),

    /**
     * 生成一个随机 id
     */
    guid: function(pre){
      return ( pre || 'xyJS_' ) + 
        ( +new Date() ) + 
        ( Math.random() + '' ).slice( -8 );
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
     * 引入模块
     */
    install: function(mod, fn){
      XY.mix(XY[mod] = {}, fn.call(me, XY, XY[mod]));
    },

    /**
     * 获得一个命名空间
     * @param {String} sSpace 命名空间符符串。如果命名空间不存在，则自动创建。
     * @param {Object} root (Optional) 命名空间的起点。当没传root时：如果sSpace以“.”打头，则是默认为XY为根，否则默认为window。
     * @return {any} 返回命名空间对应的对象
     */
    namespace: function(sSpace, root){
      var arr = sSpace.split('.')
        , i = 0
        , nameI;

      if(sSpace.indexOf('.') === 0){
        i = 1;
        root = root || XY;
      }
      root = root || window;

      for( ; nameI = arr[i++]; ){
        if(!root[nameI]){
          root[nameI] = {};
        }
        root = root[nameI];
      }
      return root;
    },

    /**
     * AMD 风格模块化
     * @param  {String}   module       模块名
     * @param  {Array}   dependencies  当前模块所依赖的模块
     * @param  {Function} fn           当前模块主题函数
     */
    define: function(module, dependencies, fn){
      if(typeof define === 'function' && define.amd){
        define(module, dependencies, fn);
      }
      else{
        if(dependencies && dependencies.length){
          for(var i = 0, l = dependencies.length; i < l; i++){
            dependencies[i] = moduleCache[dependencies[i]];
          }
        }
        moduleCache[module] = fn.apply(this, dependencies || []);
      }
    },

    /**
     * 自定义事件管理器(观察者模式)
     * 数据格式如：
     * {
     *   tail: {Object},
     *   next: {
     *     callback: {Function},
     *     context: {Object},
     *     next: {
     *       callback: {Function},
     *       context: {Object},
     *       next: {Object}
     *     }
     *   }
     * }
     * events允许指定多个事件名称, 通过空白字符进行分隔(如空格, 制表符等)
     * 当事件名称为"all"时, 在调用trigger方法触发任何事件时, 均会调用"all"事件中绑定的所有回调函数
     */
    EventTarget: {
      on: function(evts, callback, context){
        var evt, calls, node, tail, list;
        
        if(!callback) return this;
        
        evts = evts.split(eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        while( evt = evts.shift() ){
          list = calls[evt];
          node = list ? list.tail : {};
          node.next = tail = {};
          node.context = context;
          node.callback = callback;
          calls[evt] = {
            tail: tail,
            next: list ? list.next : node
          };
        }
        
        return this;
      },

      fire: function(evts){
        var evt, node, calls, tail, args, all, rest;

        if( !(calls = this._callbacks) ) return this;

        all = calls.all;
        evts = evts.split(eventSplitter);
        rest = Array.prototype.slice.call(arguments, 1);

        while( evt = evts.shift() ){
          if( node = calls[evt] ){
            tail = node.tail;
            while( (node = node.next) !== tail ){
              node.callback.apply(node.context || this, rest);
            }
          }

          if(node = all){
            tail = node.tail;
            args = [evt].concat(rest);

            while( (node = node.next) !== tail ){
              node.callback.apply(node.context || this, args);
            }
          }
        }

        return this;
      },

      off: function(evts, callback, context){
        var evt, calls, node, tail, cb, ctx;

        if( !(calls = this._callbacks) ) return;
        if( !(evts || callback || context) ){
          delete this._callbacks;
          return this;
        }

        // 如果没有指定events, 则解析已绑定所有事件的名称列表
        evts = evts ? evts.split(eventSplitter) : Object.keys(calls);

        while( evt = evts.shift() ){
          node = calls[evt];
          delete calls[evt];

          if( !node || (callback || context) ) continue;

          tail = node.tail;
          while( (node = node.next) !== tail ){
            cb = node.callback;
            ctc = node.context;

            if( (callback && cb !== callback) || (context && ctx !== context) ){
              this.on(evt, cb, ctx);
            }
          }
        }

        return this;
      }
    },

    /**
     * XY无冲突化，还原可能被抢用的window.XY变量
     * @method noConflict
     * @static
     * @return {json} 返回XY的命名空间 
     */
    noConflict: (function() {
      var _previousXY = window.XY;
      return function() {
        window.XY = _previousXY;
        return XY;
      }
    }())

  });
  
  window.XY = XY;

})(window, window.XY || {});
