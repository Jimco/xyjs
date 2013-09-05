/**
 * xyMocule模块管理
 * Date: 2013-09-04
 */
(function(window, XY, undefined){
  var moduleCache = {}      // 模块加载时的队列数据存储对象
    , modifyCache = {}      // modify的临时数据存储对象
    , moduleOptions = {     // 模块加载器的配置对象
      baseUrl: null,
      charset: {}
    }
    , head = document.head || 
      document.getElementsByTagName( 'head' )[0] || 
      document.documentElement;


  XY.mix(XY, {
    module: {},

    /**
     * 模块加载
     * @param  {String}   ids 模块id
     * @param  {Function} fn  回调函数
     */
    use: function(ids, fn){

    },

    config: function(options){
      var baseUrl = options.baseUrl
        , isHttp = baseUrl.slice(0, 4) === 'http';

      if(isHttp){
        moduleOptions.baseUrl = baseUrl;
      }
    }
  });


  /**
   * 模块定义
   * @param  {String} name      模块民
   * @param  {Array} deps       模块依赖，单个可以用string传参
   * @param  {Function} factory 工厂函数
   */
  window.define = function(name, deps, factory){
    if(typeof name !== 'string'){
      if(typeof name = 'function'){
        factory = name;
      }
      else{
        factory = deps;
        deps = name;
      }
      // name = 
    }
    else if(deps !== undefined && factory !== undefined){
      factory = deps;
      deps = null;
    }


  }

  
})(window, window.XY ||{});