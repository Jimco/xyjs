/**
 * xy 核心方法 -v0.0.1
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
;(function(window, XY, undefined){

  var me = this
    , rQuickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
    , rProtocol = /^(http(?:s)?\:\/\/|file\:.+\:\/)/
    , rModId = /([^\/?]+?)(\.(?:js|css))?(\?.*)?$/
    , rReadyState = /loaded|complete|undefined/
    , eventSplitter = /\s+/
    , moduleCache = {}  // 模块加载时的队列数据存储对象
    , modifyCache = {}  // modify的临时数据存储对象

    , head = document.head || 
      document.getElementsByTagName( 'head' )[0] || 
      document.documentElement
    , baseElem = head.getElementsByTagName( 'base' )[0]

    , moduleOptions = {
      baseUrl: null,
      charset: {}
    };

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

    version: '0.0.1',

    __uuid__: 2,

    browser: {}, // 存储浏览器名和版本数据

    module: {}, // 模块加载器缓存对象

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
     * DOM文档树加载完毕
     * @param  {Function} handle 事件处理函数
     */
    ready: function(handle){
      var doc = document;
      if(doc.addEventListener){
        doc.addEventListener('DOMContentLoaded', function(){
          doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
          handle();
        }, false);
      }else if(doc.attachEvent){
        doc.attachEvent('onreadystatechange', function(){
          if(doc.readyState === 'interactive' || doc.readyState === 'complete'){
            doc.detachEvent('onreadystatechange', arguments.callee);
            handle();
          }
        })
      }
    },

    /*
     * 加载模块
     * @param {String} 模块标识
     * @param {Function} 回调函数
     */
    use: function(ids, fn){
      ids = typeof ids === 'string' ? [ids] : ids;

      var module = XY.module
        , modUrls = []
        , modNames = []
        , namesCache = []
        , i = 0
        , mod, modName, modUrl, result, useKey;

      for( ; i < ids.length; i++){
        result = xyModule.parseModId(ids[i], moduleOptions.baseUrl);
        modName = result[0];
        modUrl = result[1];
        mod = module[modName];
        if(!mod) mod = module[modName] = {};

        // 将模块名和模块路径添加到队列中
        modNames[modNames.length++] = modName;
        modUrls[modUrls.length++] = modUrl;
      }

      // 生成队列随机 key
      useKey = modNames.join('_') + '_' + XY.xuid + (++XY.__uuid__);
      // 复制模块名，在输出exports时会用到
      namesCache = namesCache.concat(modNames);

      moduleCache[useKey] = {
        callback: fn,
        names: modNames,
        namesCache: namesCache,
        urls: modUrls
      };

      xyModule.load(useKey);
    },

    /*
     * 给模块添加modify方法以便在正式返回exports前进行修改
     * @param {String} 模块名
     * @param {Function} 修改exports的函数，该函数至少要有一个返回值
     */
    modify: function(name, fn){
      modifyCache[name] = fn;
    },

    /*
     * 修改模块加载器的配置
     * @param {Object}
     */
    config: function(options){
      var baseUrl = options.baseUrl
        , isHttp = baseUrl.slice(0, 4) === 'http'；

      if(isHttp){
        moduleOptions.baseUrl = baseUrl;
      }
      else{
        moduleOptions.baseUrl = xyModule.mergePath(baseUrl, document.location.href)
      }

      moduleOptions.charset = XY.merge(moduleOptions.charset, options.charset);
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
    }

  });

  XY.xuid = XY.guid();
  
  var xyModule = {
      // 初始化模块加载器时获取 baseUrl(即当前 js 文件加载的 url)
      init: function(){
        var scripts = document.getElementsByTagName('script')
          , script = scripts[scripts.length - 1]
          , initMod = script.getAttribute('data-main')
          , url = script.hasAttribute ? script.src : script.getAttribute('src', 4);

        moduleOptions.baseUrl = url.slice(0, url.lastIndexOf('/') + 1);

        if(initMod){
          XY.use(initMod);
        }

        scripts = script = null;
      },

      /**
       * 获取当前运行的脚本文件的名称
       * 用于获取匿名模块的模块名
       */
      getCurrentScript: function(){
        var script, scripts, i, stack;

        try{
          XY[XY.xuid]();
        }
        catch(e){
          stack = e.stack;
        }

        if(stack){
          stack = stack.split(/[@ ]/g).pop();
          stack = stack[0] === '(' ? stack.slice(1, -1) : stack.replace(/\s/, '');

          return stack.replace(/(:\d+)?:\d+$/i, '').match(rModId)[1];
        }

        scripts = head.getElementsByTagName('script');

        for(i = scripts.length - 1 ; i >= 0; i--){
          script = scripts[i];
          if(script.calssName === modClassName && script.readyState === 'interactive'){
            break;
          }
        }

        return script.src.match(rModId)[1];
      },

      /**
       * 将模块标识(相对路径)和基础路径合并成新的真正的模块路径(不含模块的文件名)
       */
      mergePath: function(id, url){
        var isHttp = url.slice(0, 4) === 'http'
          , domain = ''
          , i = 0
          , protocol, urlDir, idDir, dirPath, len, dir;

        protocol = url.match(rProtocol)[1];
        url = url.slice(protocol.length);

        if(isHttp){
          domain = url.slice( 0, url.indexOf('/') + 1 );
          url = url.slice(domain.length);
        }

        urlDir = url.split('/');
        urlDir.pop();

        idDir = id.splite('/');
        idDir.pop();
        len = idDir.length;

        for( ; i < len; i++){
          dir = idDir[i];
          if(dir === '..'){
            urlDir.pop();
          }
          else if(dir !== '.'){
            urlDir.push(dir);
          }
        }

        dirPath = urlDir.join('/');
        dirPath = dirPath === '' ? '' : dirPath + '/';
        return protocol + domain + dirPath;
      },

      /**
       * 解析模块标识，返回模块名和模块路径
       * @param  {String} id  模块标识
       * @param  {string} url 基础路径 baseUrl
       * @return {Array}      [模块名， 模块路径]
       */
      parseModId: function(id, url){
        var isAbsoluteId = rProtocol.test( id )        
          , result = id.match( rModId )
          , modName = result[1]
          , suffix = result[2] || '.js'
          , search = result[3] || ''
          , baseUrl, modUrl;
        
        // 模块标识为绝对路径时，标识就是基础路径
        if(isAbsoluteId){
          url = id;
          id = '';
        }

        baseUrl = easyModule.mergePath( id, url );
        modUrl = baseUrl + modName + suffix + search;
        return [ modName, modUrl ];
      },

      /*
       * 将依赖模块列表的外部接口(exports)合并成arguments
       * @param {Array} deps 依赖模块列表
       * @param {Array} 返回值数组
       */
      getExports: function(deps){
        if(deps){
          var len = deps.length
            , module = XY.module
            , arr = []
            , i = 0, j = 0, dep;

          for( ; i < len; i++){
            arr[j++] = module[ dep[i] ].exports;
          }

          return arr;
        }

        return [];
      },

      isLoaded: function(mod){

      },

      factoryHandle: function(name, mod, factory, data){

      },

      fireFactory: function(useKey){

      },

      complete: function(mod){

      },

      create: function(url, name, useKey){

      },

      /*
       * 加载模块
       * @param {String} 用来访问存储在moduleCache中的数据的属性名
       */ 
      load: function(useKey){
        var data = moduleCache[useKey]
          , urls = data.urls
          , charset = moduleOptions.charset
          , url = urls.shift()
          , name = data.names.shift()
          , module = XY.module
          , mod = module[name]
          , script

          // script 加载完成后执行的函数
          , complete = function(){
              // 队列没加载完将继续加载
              if(url.length){
                xyModule.load(useKey);
              }
              else{
                var namesCache = data.namesCache
                  , len = namesCache.length
                  , args = []
                  , i = 0, j = 0, result;

                // 合并模块的 exports 为 arguments
                for( ; i < len; i++){
                  args[j++] = module[namesCache[i]].exports;
                }

                // 执行 use 的回调
                if(data.callback){
                  data.callback.apply(null, args);
                }

                // 删除队列数据
                delete moduleCache[useKey];
              }

              // 删除模块缓存中的队列属性值
              delete mod.useKey;
            };

        // 已加载过的模块不重复加载，但如果有回调还是需要执行回调
        if(mod.status === 4){
          complete();
          return;
        }

        script = document.createElement('script');
        script.async = 'async';
        script.src = url;

        // 如果有配置 charset，则指定 charset
        if(charset[name]){
          script.charset = charset[name];
        }

        script.onload = script.onerror = script.onreadystatechange = function(){
          if(rReadyState.test(script.readyState)){
            script.onload = script.onerror = script.onreadystatechange = null;
            head.removeChild(script);
            script = null;

            complete();
          }
        }

        mod.useKey = useKey;
        mod.status = 1; // 开始加载模块

        baseElem ? head.insertBefore(script, head.firstChild) : head.appendChild(script); 
      }
    };

  
  /**
   * 定义模块全局方法(AMD规范)
   * @param  {String} name    模块名
   * @param  {String/Array} deps    依赖模块列表，单个可以用字符串形式传参，多个用数组形式传参
   * @param  {Function} factory 工厂函数，模块内容(参数对应依赖模块的外部接口)
   */
  window.define = function(name, deps, factory){

    if(typeof name !== 'string'){
      if(typeof name === 'function'){
        factory = name;
      }
      else{
        factory = deps;
        deps = name;
      }
      name = xyModule.getCurrentScript()
    }
    else if(deps !== undefined && factory === undefined){
      factory = deps;
      deps = null;
    };

    var module = XY.module
      , mod = module[name]
      , isRepeat = false
      , isLoaded = true
      , names = []
      , urls = []
      , insertIndex = 0
      , pullIndex = 0
      , useKey, data, modUrl, factorys, baseUrl, depMod, depName, result, exports, args, depsData, repeatDepsData, i, repeatName;

    // 在模块都合并的情况下直接执行factory
    if(!mod){
      mod = module[name] = {};
      if(deps) mod.deps = deps;

      xyModule.factoryHandle(name, mod, factory);
      return;
    }

    useKey = mod.useKey;
    data = moduleCache[useKey];
    modUrl = mod.url;

    mod.status = 2;
    mod.deps = [];

    // 如果有依赖模块，先加载依赖模块
    if(deps && deps.length){
      baseUrl = modUrl.slice(0, modUrl.lastIndexOf('/') + 1);
    }

    // 该模块无依赖模块就直接执行其factory
    if(isLoaded){
      xyModule.factoryHandle(name, mod, factory, data);
    }

    xyModule.fireFactory(useKey);

    // 无依赖列表将删除依赖列表的数组
    if(!mod.deps.length){
      delete mod.deps;
    }
  };

  window.XY = XY;

})(window, window.XY || {});
