/**
 * 语言自定义扩展模块
 * Author: xiejiancong.com
 * Date: 2012-09-24
 * require:
 *  application.js 
 *  lang-patch.js
 */
 
(function(window, XY, undefined){
  
  var rValidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
    , rValidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g
    , rValidbraces = /(?:^|:|,)(?:\s*\[)+/g
    , rSelectForm = /^(?:select|form)$/i
    , rValidchars = /^[\],:{}\s]*$/  
    
    , toString = Object.prototype.toString;

  XY.type = function( obj ){
    return toString.call( obj ).slice( 8, -1 ).toLowerCase();
  };

  // 类型判断
  [ 'Array', 'Function', 'Object', 'RegExp' ].forEach(function( type ){
    XY[ 'is' + type ] = function( obj ){
      return obj && toString.call( obj ) === '[object ' + type + ']';
    };
  });

  [ 'Boolean', 'Number', 'String' ].forEach(function( type ){
    XY[ 'is' + type ] = function( obj ){
      return typeof obj === type.toLowerCase();
    };
  });

  // 标准浏览器使用原生的判断方法
  if( Array.isArray ){
    XY.isArray = Array.isArray;
  }

  // 判断是否为空对象
  XY.isEmptyObject = function( obj ){
    var name;
    for( name in obj ){
      return false;
    }
    return true;
  };
  
  // 判断是否为纯粹的对象
  XY.isPlainObject = function( obj ){
    if( !obj || !XY.isObject(obj) ){
      return false;
    }
    var name;
    
    try{
      for( name in obj ){
        if( !Object.prototype.hasOwnProperty.call(obj,name) ){
          return false;
        }
      }
    }
    catch( _ ){
      return false;
    }
      
    return true;
  };
  
  XY.isWindow = function( obj ) {
    return obj && typeof obj === 'object' && 'setInterval' in obj;
  };

  /*
   * 遍历对象并执行回调
   * obj: 对象
   * fn: 回调函数(如果回调函数的返回值为false将退出循环)
   * context: 上下文
   * return: Object 
   */
  XY.each = function( obj, fn, context ){    
    var isObj = obj.length === undefined || typeof obj === 'function'
      , i;      
    
    if( isObj ){
      for( i in obj ){
        if( fn.call(context, i, obj[i]) === false ){
          break;
        }
      }
    }
    
    return obj;
  };
  
  /*
   * 将对象转换成真实数组
   * 常用于将arguments, NodeList等array-like对象转换成真实数组
   * source: 任意类型的数据
   * target: 目标数组
   * return: 真实的数组
   */
  XY.makeArray = function( source, target ){
    target = target || [];
    var i = 0
      , len = source.length;

    if( source !== null && source !== undefined ){
      if( XY.isArray(source) && XY.isArray(target) && !target.length ){
        return source;
      } 
      
      if( typeof len !== 'number' || 
        typeof source === 'string' || 
        XY.isFunction(source) || 
        XY.isRegExp(source) || 
        source === window ||
        // select元素有length属性，select[0]将直接返回第一个option
        // form元素也有length属性
        source.tagName && rSelectForm.test(source.tagName) ){
          target[ target.length++ ] = source;
      }
      else{
        for( ; i < len; i++ ){
          target[ target.length++ ] = source[i];
        }
      }
    }
    
    return target;
  };

  XY.parseXML = function( data ) {
    var xml, tmp;
    try {
      // 标准浏览器
      if ( window.DOMParser ) { 
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , 'text/xml' );
      }
      // IE6/7/8
      else{
        xml = new ActiveXObject( 'Microsoft.XMLDOM' );
        xml.async = 'false';
        xml.loadXML( data );
      }
    } catch( e ) {
      xml = undefined;
    }
    
    return xml;
  };
  
  XY.parseJSON = function( data ) {
    if ( !data || !XY.isString(data) ){
      return null;
    }

    data = data.trim();
    
    // 标准浏览器可以直接使用原生的方法
    if( window.JSON && window.JSON.parse ){
      return window.JSON.parse( data );
    }
    
    if ( rValidchars.test( data.replace( rValidescape, '@' )
      .replace( rValidtokens, ']' )
      .replace( rValidbraces, '')) ) {

      return (new Function( 'return ' + data ))();
    }
  };
  
  // 首字母大写转换
  XY.capitalize = function( str ){
    var firstStr = str.charAt(0);
    return firstStr.toUpperCase() + str.replace( firstStr, '' );
  };

  window.XY = XY;

})(window, window.XY || {});
