/**
 * 选择器模块
 * Author: xjiancong@gmail.com
 * Date: 2013-08-18
 */
(function(window, XY, undefined){

  var hasDuplicate = false       // 是否有重复的DOM元素
    , hasParent = false          // 是否有重复得父元素
    , baseHasDuplicate = true    // 检测浏览器是否支持自定义的sort函数

    // 使用elem.getAttribute( name, 2 )确保这些属性的返回值在IE6/7下和其他浏览器保持一致
    , rAttrUrl = /action|cite|codebase|data|href|longdesc|lowsrc|src|usemap/
    , rAttr = /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/
    , rPseudo = /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
    , rRelative = /[>\+~]/g

    , attrMap = {
        'class': 'className',
        'for': 'htmlFor',
        'id': 'id',
        'title': 'title',
        'type': 'type'
      };

  [0, 0].sort(function(){
    baseHasDuplicate = false;
    return 0;
  });

  var xySelector = {
      unique: function(nodelist, isParent){

      },

      getAttribute: function(elem, name){

      },

      // 查找nextSibling元素
      next: function(prev){

      },

      prev: function(next){

      },

      /**
       * 选择器的适配器
       * @param  {String} selector     选择器字符串
       * @param  {Object} context      查找范围
       * @param  {String} nextSelector 关系选择器的第二级选择器
       * @return {Array}              
       * 无查找范围返回[ 选择器类型, 处理后的基本选择器, tagName ]
       * 有查找范围将返回该选择器的查找结果
       */
      adapter: function(selector, context, nextSelector) {
        
      },

      indexFilter: function(name, i){

      }
    };

    xySelector.finder = {
      ID: function(selector){
        return document.getElementById( selector.subString(selector.indexOf('#') + 1) );
      },

      CLASS: function(selector, context) {
        
      },

      TAG: function(selector, context, noCheck){

      },

      ATTR: function(selector, context, isFiltered){

      },

      RELATIVE: function(selector, context, nextSelector){

      },

      PSEUDO: function(selector, context, isFiltered){

      }
    }

    xySelector.filter = {
      ID: function(elem, name, tagName){
        var isTag = tagName === '' || elem.tagName === tagName;

        return isTag && elem.id === name;
      },

      CLASS: function(elem, name, tagName){
        var className = elem.className
          , isTag = tagName === '' || elem.tagName === tagName;

        return isTag && className && ~(' ' + className + ' ').indexOf(name); 
      },

      TAG: function(elem, name){
        return elem.tagName === name;
      },

      // 伪类选择器的过滤器
      pseudos: {

      },

      // 关系选择器的过滤器
      relatives: {

      }
    }


  XY.mix(XY, {
    // DOM 元素过滤器
    filter: function(source, selector){

    },

    query: function(selector, context){

    }
  });

})(window, window.XY || {});
