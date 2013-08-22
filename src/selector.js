/**
 * 选择器模块
 * Author: xjiancong@gmail.com
 * Date: 2013-08-18
 */
(function(window, document, XY, undefined){

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
        var index, name, tagName, matches, type;

        type = nextSelector !== undefined ? 'RELATIVE' :
          ~selector.indexOf(':') ? 'PSEUDO' :
          ~selector.indexOf('#') ? 'ID' :
          ~selector.indexOf('[') ? 'ATTR' :
          ~selector.indexOf('.') ? 'CLASS' : 'TAG';

        if(!context){
          switch(type){
            case 'CLASS':
              index = selector.indexOf('.');
              name = ' ' + selector.substring(index + 1) + ' ';
              tagName = selector.substring(0, index);
            break;

            case 'TAG':
              name = selector.toUpperCase()
            break;

            case 'ID':
              index = selector.indexOf('#');
              name = selector.substring(index + 1);
              tagName = selector.substring(0, index).toUpperCase();
            break;
          }

          return [type, name, tagName];
        }

        return xySelector.finder[type](selector, context, nextSelector);
      },

      indexFilter: function(name, i){
        return name === 'even' ? i % 2 === 0 : 
          name === 'odd' ? i % 2 === 1 : 
          ~name.indexOf('n') ? (name === 'n' || i % parseInt(name) === 0) :
          parseInt(name) === i;
      }
    };

    xySelector.finder = {
      // id选择器
      ID: function(selector){
        return document.getElementById( selector.substring(selector.indexOf('#') + 1) );
      },

      // class选择器
      CLASS: function(selector, context) {
        var elems = []
          , index = selector.indexOf('.')
          , tagName = selector.substring(0, index) || '*'
          , className = ' ' + selector.substring(index + 1) + ' '
          , i = 0, l = 0, elem, len, name;

        context = xySelector.finder.TAG(tagName, context, true);
        len = context.length;

        for( ; i < len; i++){
          elem = context[i];
          name = elem.className;
          if( name && ~(' ' + name + ' ').indexOf(className) ){
            elems[l++] = elem;
          }
        }

        elem = context = null;
        return elems;
      },

      // tag 选择器
      TAG: function(selector, context, noCheck){
        var elems = []
          , prevElem = context[0]
          , contains = XY.contains
          , makeArray = XY.makeArray
          , len = context.length
          , i = 0, elem;

        noCheck = noCheck || len === 1;

        for( ; i < len; i++){
          elem = context[i];
          if(!noCheck){
            if(!contains(prevElem, elem)){
              prevElem = elem;
              elems = makeArray(elem.getElementsByTagName(selector), elems);
            }
          }
          else{
            elems = makeArray(elem.getElementsByTagName(selector), elems);
          }
        }

        prevElem = elem = context = null;
        return elems;
      },

      // 属性选择器
      ATTR: function(selector, context, isFiltered){

      },

      // 关系选择器
      RELATIVE: function(selector, context, nextSelector){
        var matches = xySelector.adapter(nextSelector)
          , type = matches[0]
          , filter = xySelector.filter[type] || type
          , name = matches[1] || nextSelector;

        return xySelector.filter.relatives[selector](filter, name, matches[2], context);
      },

      // 伪类选择器
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
        empty: function(elem){
          return !elem.firstChild;
        },

        not: function(elem, name, tagName, filter){
          return !filter(elem, name, tagName);
        },

        form : function( elem, attr, val ){
          return elem.tagName === 'INPUT' && elem.type !== 'hidden' && elem[attr] === val; 
        },  
        
        enabled : function( elem ){
          return this.form( elem, 'disabled', false );
        },
        
        disabled : function( elem ){
          return this.form( elem, 'disabled', true );
        },
        
        checked : function( elem ){
          return this.form( elem, 'checked', true );
        },
        
        selected : function( elem ){
          return elem.tagName === 'OPTION' && elem.selected === true;
        },

        hidden : function( elem ){      
          return ( !elem.offsetWidth && !elem.offsetHeight ) || ( elem.currentStyle && elem.currentStyle.display === "none" );
        },
        
        visible : function( elem ){
          return !this.hidden( elem );
        },

        animated : function( elem ){
          return xyData.data( elem, 'anim', 'animQueue' ) !== undefined;
        }

      },

      // 关系选择器的过滤器
      relatives: {
        // 子节点
        '>': function(filter, name, tagName, context){
          var isType = XY.isString(filter)
            , elems = []
            , i = 0
            , l = 0
            , len = context.length
            , child, clen, children, j;

          for( ; i < len; i++){
            children = context[i].childNodes
            clen = children.length;

            for(j = 0; j < clen; j++){
              child = children[j];
              if( child.nodeType === 1 && (isType || filter(child, name, tagName)) ){
                elems[l++] = child;
              }
            }
          }

          child = children = context = null;
          return isType ? xySelector.finder[filter](name, elems, true) : elems;
        },

        // 相邻节点
        '+': function(filter, name, tagName, context){
          var isType = XY.isString(filter)
            , elems = []
            , len = context.length
            , i = 0
            , l = 0
            , nextElem;

          for( ; i < len; i++){
            nextElem = xySelector.next(context[i]);
            if( nextElem && (isType || filter(nextElem, name, tagName)) ){
              elems[l++] = nextElem;
            }
          }

          nextElem = context = null;
          return isType ? xySelector.finder[filter](name, elems, true) : elems;
        },

        // 同级节点
        '~': function(filter, name, tagName, context){
          var isType = XY.isString(filter)
            , elems = []
            , i = 0
            , l = 0
            , len, nextElem;

          context = xySelector.unique(context, true);
          len = context.length;

          for( ; i < len; i++){
            nextElem = context[i].nextSibling;
            while(nextElem){
              if( nextElem.nodeType === 1 && (isType || filter(nextElem, name, tagName)) ){
                elems[l++] = nextElem; 
              }
              nextElem = nextElem.nextSibling;
            }
          }

          nextElem = context = null;
          return isType ? xySelector.finder[filter](name, elems, true) : elems;
        }
      }
    };


  XY.mix(XY, {

    unique: function(nodelist){
      return xySelector.unique(nodelist);
    },

    // 检测a元素是否包含了b元素
    contains: function(a, b){
      if(a.compareDocumentPosition){
        return !!(a.compareDocumentPosition(b) & 16);
      }
      // IE支持contains
      else{
        return a !== b && a.contains(b);
      }

      return false;
    },

    // DOM 元素过滤器
    filter: function(source, selector){
      var target = []
        , l = 0
        , matches, filter, type, name, elem, tagName, len, i;
        
      source = XY.makeArray( source );
      len = source.length;
        
      if( XY.isString(selector) ){
        matches = xySelector.adapter( selector );
        filter = xySelector.filter[ matches[0] ];
        name = matches[1];
        tagName = matches[2];
        
        if(!filter) type = matches[0];
        
        if(type){
          target = easySelector.finder[ type ](selector, source, true);
        }
        else{
          for( i = 0; i < len; i++ ){
            elem = source[i];
            if( filter(elem, name, tagName) ){
              target[ l++ ] = elem; 
            }         
          }
        }
      }   
      else if( E.isFunction(selector) ){
        for( i = 0; i < len; i++ ){
          elem = source[i];
          if( selector.call(elem, i) ){
            target[ l++ ] = elem;
          }
        }     
      }
      
      source = elem = null;
      return target;
    },

    query: function(selector, context){
      context = context || document;
      if(!XY.isString(selector)) return context;

      var elems = []
        , contains = XY.contains
        , makeArray = XY.makeArray
        , nodelist, selector, result, prevElem
        , lastElem, nextMatch, matches, elem, len, i;

      // 标准浏览器和IE8+支持querySelectorAll
      if(document.querySelectorAll){
        try{
          context = makeArray(context);
          len = context.length;
          prevElem = context[0];
          for( i = 0 ; i < len; i++){
            elem = context[i];
            if(!contains(prevElem, elem)){
              prevElem = elem;
              elems = makeArray( elem.querySelectorAll(selector), elems );
            }
          }
          prevElem = elem = context = null;
          // debugger;
          return elems;
        }
        catch(e){};
      }

      matches = selector.split(',');
      len = matches.length;

      for(i = 0; i < len; i++){
        nodelist = [context];
        // 将选择器进行分割 #list .item a => ['#list', '.item', 'a']
        selectors = matches[i].replace(rRelative, function(symbol){
          return ' ' + symbol + ' ';
        }).match(/[^\s]+/g);

        for(var j = 0, clen = selectors.length; j < clen; j++){
          result = selectors[j];
          lastElem = makeArray( nodelist[nodelist.length - 1] );

          // 关系选择器特殊处理
          nextMatch = /[>\+~]/.test(result.charAt(0)) ? selectors[++j] : undefined;
          elem = xySelector.adapter(result, lastElem, nextMatch);

          if(!elem) return elems;
          nodelist[nodelist.length++] = elem;
        }

        elems = makeArray(nodelist[nodelist.length - 1], elems);
      }

      nodelist = result = lastElem = context = elem = null;
      return len > 1 ? XY.unique(elems) : elems;
    }
  });

})(window, document, window.XY || {});
