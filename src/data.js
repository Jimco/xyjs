/**
 * data 缓存模块
 * Author: xjiancong@gmail.com
 * Date: 2013-08-25
 * rely: core.js lang.js lang-patch.js
 */
;(function(window, XY, undefined){

  XY.cache = {};

  var xyData = {
      /**
       * 获取和设置元素的缓存索引值，小于3的索引值都是为特殊元素准备的
       * @param  {[type]}  elem  [description]
       * @param  {Boolean} isSet [description]
       * @return {[type]}        [description]
       */
      getCacheIndex: function(elem, isSet){

      },

      /**
       * 写入/读取缓存
       * @param  {[type]} elem      [description]
       * @param  {[type]} type      [description]
       * @param  {[type]} name      [description]
       * @param  {[type]} value     [description]
       * @param  {[type]} overwrite [description]
       * @return {[type]}           [description]
       */
      data: function(elem, type, name, value, overwrite){

      },

      /**
       * 移除缓存
       * @param  {[type]} elem [description]
       * @param  {[type]} type [description]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      removeData: function(elem, type, name){

      },

      hasData: function(elem){

      }
    }

})(window, window.XY || {});
  
  