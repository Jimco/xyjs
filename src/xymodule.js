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

    use: function(){

    },

    config: function(options){
      var baseUrl = options.baseUrl
        , isHttp = baseUrl.slice(0, 4) === 'http';

      if(isHttp){
        moduleOptions.baseUrl = baseUrl;
      }
    }
  });


  window.define = function(name, deps, factory){

  }

  
})(window, window.XY ||{});