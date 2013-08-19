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
      /**
       * 对一组DOM元素按照在DOM树中的顺序进行排序
       * 同时删除同级或重复的DOM元素
       * @param  {Array}  nodelist  DOM数组
       * @param  {Boolean} isParent 是否检测重复的父元素，如果该参数为true，将删除同级元素，只保留第一个
       * @return {Array}            
       */
      unique: function(nodelist, isParent){
        if(nodelist.length < 2) return nodelist;

        var i = 0
          , k = 1
          , len = nodelist.length;

        hasDuplicate = baseHasDuplicate;
        hasParent = isParent;

        // IE的DOM元素都支持sourceIndex
        if(nodelist[0].sourceIndex){
          var arr = []
            , obj = {}
            , elems = []
            , j = 0, index, elem;

          for( ; i < len; i++){
            elem = nodelist[i];
            index = (hasParent ? elem.parentNode.sourceIndex : elem.sourceIndex) + 1e8;

            if(!obj[index]){
              ( arr[j++] = new String(index) ).elem = elem;
              obj[index] = true;
            }
          }

          arr.sort();

          while(j){
            elems[--j] = arr[j].elem;
          }

          arr = null;
          return elems;
        }
        // 标准浏览器的DOM元素都支持compareDocumentPosition
        else{
          nodelist.sort(function(a, b){
            if(hasParent){
              a = a.parentNode;
              b = b.parentNode;
            }

            if(a === b){
              hasDuplicate = true;
              return 0;
            }

            return a.compareDocumentPosition(b) & 4 ? -1 : 1;
          });

          if(hasDuplicate){
            for( ; k < nodelist.length; k++){
              elem = nodelist[k];
              if(hasParent ? elem.parentNode === nodelist[k - 1].parentNode : elem === nodelist[k - 1]){
                nodelist.splice(k--, 1);
              }
            }
          }

          return nodelist;
        }
      },

      getAttribute: function(elem, name){
        return attrMap[name] ? elem[ attrMap[name] ] || null : 
          rAttrUrl.test(name) ? elem.getAttribute(name, 2) :
          elem.getAttribute(name);
      },

      // 查找nextSibling元素
      next: function(prev){
        prev = prev.nextSibling;
        while(prev){
          if(prev.nodeType === 1){
            return prev;
          }
          prev = prev.nextSibling;
        }
      },

      prev: function(next){
        next = next.previousSibling;
        while(next){
          if(next.nodeType === 1){
            return next;
          }
          next = next.previousSibling;
        }
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
