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
        if(elem.nodeType === 1){
          var xuid = XY.xuid;
          return !isSet || xuid in elem ?
            elem[xuid] :
            (elem[xuid] = ++XY.__uid__);
        }

        return XY.isWindow(elem) ? 0 :
          elem.nodeType === 9 ? 1 :
          elem.tagName === 'HTML' ? 2 : -1;
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
      data: function(elem, type, name, val, overwrite){
        var cache = XY.cache
          , isUndefined = val === undefined
          , index = xyData.getCacheIndex(elem, !isUndefined)
          , result;

        if(index !== undefined){
          if( !(index in cache) ){
            cache[index] = {};
          }

          cache = cache[index];

          if( !(type in cache) ){
            cache[type] = {};
          }

          result = cache[type][name];

          if( isUndefined || (!overwrite && result !== undefined) ){
            return result;
          }

          if(overwrite || !isUndefined){
            cache[type][name] = val;
            return val;
          }
        }
      },

      /**
       * 移除缓存
       * @param  {[type]} elem [description]
       * @param  {[type]} type [description]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      removeData: function(elem, type, name){
        var index = xyData.getCacheIndex(elem)
          , cache = XY.cache;

        if(index in cache){
          cache = cache[index];

          if(name && cache[type]){
            delete cache[type][name];
          }

          // 无参数或空对象都删除所有的数据
          if(!name || XY.isEmptyObject(cache[type])){
            cache[type] = null;
            delete cache[type];
          }

          if(XY.isEmptyObject(cache)){
            delete XY.cache[index];
            cache = null;
          }

          // 索引值小于3都无需删除DOM元素上的索引值
          if(index < 3) return;

          // 缓存中无数据了则删除DOM元素上的索引值
          if(cache === undefined){
            try{
              delete elem[ XY.xuid ];
            }
            catch(_){
              elem.removeAttribute(XY.xuid);
            }
          }
        }
      },

      hasData: function(elem){
        var index = xyData.getCacheIndex(elem);
        return !!(index !== undefined && XY.cache[index]);
      }
    };

  XY.mix(XY.prototype, {
    data: function(name, val){
      if(val === undefined){
        return xyData.data(this[0], 'data', name);
      }

      return this.forEach(function(){
        xyData.data(this, 'data', name, val, true);
      });
    },

    removeData: function(name) {
      return this.forEach(function(){
        xyData.removeData(this, 'data', name);
      })
    }
  });

})(window, window.XY || {});
