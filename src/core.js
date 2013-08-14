/**
 * xy 核心方法 -v0.0.1
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
;(function(window, XY, undefined){

  var me = this
    , EMPTY = ''
    , rQuickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
    , rReadyState = /loaded|complete|undefined/
    , __eventTarget = {}
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
      if(options.baseUrl){
        moduleOptions.baseUrl = options.baseUrl;
      }
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
       * 解析模块标识，返回模块名和模块路径
       * @param  {String} id  模块标识
       * @param  {string} url 基础路径 baseUrl
       * @return {Array}      [模块名， 模块路径]
       */
      parseModId: function(id, url){
        var modName = id
          , modUrl, startIndex, endIndex, href, dLen, hLen;

        if(~id.indexOf('/')){
          startIndex = id.lastIndexOf('/') + 1;
          endIndex = id.indexOf('.js') ? id.lastIndexOf('.js') : id.length;

          modName = id.slice(startIndex, endIndex);
        }

        if(id.slice(0, 4) === 'http'){
          modUrl = id;
        }
        else if(id.charAt(0) === '.'){
          url = url.match( /([\w:]+\/\/)(.+)/ );
          href = url[2].split( '/' );
          hLen = href.length - 2;
          dLen = id.match( /\.\.\//g ).length;
          dLen = dLen > hLen ? hLen : dLen;
          href.splice( href.length - dLen - 1, dLen );
          id = id.replace( /(\.\.\/)+/, '' );

          modUrl = url[1] + href.join( '/' ) + id + '.js';
        }
        else{
          modUrl = url + id + '.js';
        }

        return [modName, modUrl];
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
            arr[j++] = module[dep[i]].exports;
          }

          return arr;
        }
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
    var module = XY.module
      , mod = module[name]
      , toDepData = module.toDepData
      , getExports = xyModule.getExports
      , modUrl = mod.url
      , data, urls, names, baseUrl, i, j, depMods, depName, result, exports, toDepMod, args;

    // 存储模块依赖列表的数组
    mod.deps = [];
    mod.status = 2; // 开始解析模块内容

    if(typeof deps === 'function'){
      factory = deps;
      deps = null;
    }

    // 如果有依赖，先加载依赖模块
    if(deps){
      deps = typeof deps === 'string' ? [deps] : deps;
      baseUrl = modUrl.slice(0, modUrl.lastIndexOf('/')+1);
      // 取出当前模块的队列数据
      data = moduleCache[mod.useKey];
      
      urls = data.urls;
      names = data.names;

      // 遍历依赖模块列表，如果该依赖模块没有加载过，
      // 则将该依赖模块名和模块路径添加到当前模块加载队列的数据去进行加载
      for(i = deps.length - 1 ; i >= 0; i--){
        result = xyModule.parseModId(deps[i], baseUrl);
        depName = result[0];
        depMod = module[depName];
        mod.deps.unshift(depName);

        if(depMod){
          deps.splice(i, 1);
          continue;
        }else{
          depMod = module[depName] = {};
        }

        names.unshift(depName);
        urls.unshift( (depMod.url = result[1]) );
      }

      // 将当前模块名和factory存储到最后一个依赖模块的缓存中
      // 当最后一个依赖模块加载完毕才执行当前模块的factory
      if( deps.length ){
        depMod = module[ deps[deps.length - 1] ];   
        depMod.toDepData = toDepData || [];     
        depMod.toDepData.unshift({ 
          name : name, 
          factory : factory
        });
      }
    }

    if(!deps || !deps.length){
      // 模块解析完毕，所有的依赖模块也都加载完，但还未输出exports
      mod.status = 3;
      
      args = getExports(mod.deps);  
      exports = factory.apply(null, args);
      
      if(exports !== undefined){
        // 如果有绑定modify方法，将在正式返回exports前进行修改
        if(modifyCache[name]){
          exports = modifyCache[ name ]( exports );
          // 修改后即删除modify方法
          delete modifyCache[ name ];
        }
        // 存储exports到当前模块的缓存中
        mod.exports = exports;
      }
      
      // 当前模块加载并执行完毕，exports已可用
      mod.status = 4;
      
      // 执行被依赖模块的factory
      if( toDepData ){    
        for( i = 0; i < toDepData.length; i++ ){
          result = toDepData[i];
          toDepMod = module[ result.name ];
          // 被依赖模块完成解析，但还未输出exports
          toDepMod.status = 3;        
          
          args = getExports( toDepMod.deps ); 
          exports = result.factory.apply( null, args );
          
          if( exports !== undefined ){
            if( modifyCache[result.name] ){
              exports = modifyCache[ result.name ]( exports );
              delete modifyCache[ result.name ];
            }
            // 缓存被依赖模块的exports到该模块中
            toDepMod.exports = exports;
          }
          // 被依赖模块加载并执行完毕，exports已可用
          toDepMod.status = 4;
        }
      }
    }

    if(!mod.deps.length){
      delete mod.deps;
    }

    // 删除当前模块的被依赖模块的相关数据
    delete mod.toDepData;
  };

  window.XY = XY;

})(window, window.XY || {});
