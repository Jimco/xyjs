/**
 * 常见原生ECMAScript5方法扩展
 * Author: xiejiancong.com
 * Date: 2012-09-24
 */ 
var AP = Array.prototype
  , DP = Date.prototype
  , FP = Function.prototype
  , SP = String.prototype
  
  , hasOwnProperty = Object.prototype.hasOwnProperty;
  
if( !AP.indexOf ){
  // ECMAScript 5 15.4.4.15
  // item: 要查找的数组元素（必需）
  // i: 查找的起始索引（可选）
  AP.indexOf = function( item, i ){
    var len = this.length;
      
    i = parseInt( i ) || 0;
      
    if( i < 0 ){
      i += len;
    }

    for( ; i < len; i++ ){
      if( this[i] === item ){
        return i;
      }
    }
    
    return -1;
  };
}

if( !AP.lastIndexOf ){
  // ECMAScript 5 15.4.4.15
  // lastIndexOf为indexOf的反转版，lastIndexOf是从右到左的查找顺序，indexOf是从左到右的查找顺序
  AP.lastIndexOf = function( item, i ){
    var len = this.length;
    
    i = parseInt( i ) || len - 1;
    
    if( i < 0 ){
      i += len;
    }
    
    for( ; i >= 0; i-- ){
      if( this[i] === item ){
        return i;
      }
    }
    
    return -1;
  };
}
  
if( !AP.every ){
  
  // ECMAScript 5 15.4.4.16
  // 遍历数组并执行回调，如果每个数组元素都满足回调函数的测试则返回true，否则返回false
  // fn: 遍历时执行的回调函数，回调函数接受3个参数，第一个参数是当前遍历的元素数组，第二个参数是
  // 当前遍历的索引，第三个参数则是整个数组
  // context: 回调函数的this指向对象
  AP.every = function( fn, context ){
    var len = this.length,
      i = 0;
  
    for( ; i < len; i++ ){
      if( !fn.call(context, this[i], i, this) ){
        return false;
      }
    }
    
    return true;
  };
}

if( !AP.some ){
  // ECMAScript 5 15.4.4.17
  // 遍历数组并执行回调，如果其中一个数组元素满足回调函数的测试则返回true，否则返回false
  // fn: 遍历时执行的回调函数。回调函数接受3个参数，第一个参数是当前遍历的数组元素，第二个参数是
  // 当前遍历的索引，第三个参数则是整个数组
  // context: 回调函数的this指向对象
  AP.some = function( fn, context ){
    var len = this.length,
      i = 0;
  
    for( ; i < len; i++ ){
      if( fn.call(context, this[i], i, this) ){
        return true;
      }
    }
    
    return false;
  };
}
  
if( !AP.forEach ){
  // ECMAScript 5 15.4.4.18   
  // 遍历数组并执行回调
  // fn: 遍历时执行的回调函数。回调函数接受3个参数，第一个参数是当前遍历的数组元素，第二个参数是
  // 当前遍历的索引，第三个参数则是整个数组
  // context: 回调函数的this指向对象
  AP.forEach = function( fn, context ){   
    var len = this.length,
      i = 0;
      
    for( ; i < len; i++ ){
      fn.call( context, this[i], i, this );
    }
  };
}

if( !AP.map ){
  // ECMAScript 5 15.4.4.19
  // 遍历数组并执行回调，根据回调函数的返回值合并成一个新数组
  // fn: 遍历时执行的回调函数。回调函数接受3个参数，第一个参数是当前遍历的数组元素，第二个参数是
  // 当前遍历的索引，第三个参数则是整个数组
  // context: 回调函数的this指向对象
  AP.map = function( fn, context ){
    var len = this.length,
      arr = [],
      i = 0,
      j = 0;
    
    for( ; i < len; i++ ){
      arr[ j++ ] = fn.call( context, this[i], i, this );
    }
    
    return arr;
  };
}

if( !AP.filter ){
  // ECMAScript 5 15.4.4.20 
  // 遍历数组并执行回调，将满足回调函数测试的数组元素过滤到一个新的数组中，原数组保持不变。
  // // fn: 遍历时执行的回调函数。回调函数接受3个参数，第一个参数是当前遍历的数组元素，第二个参数是
  // 当前遍历的索引，第三个参数则是整个数组
  // context: 回调函数的this指向对象
  AP.filter = function( fn, context ){
    var len = this.length,
      arr = [],
      i = 0,
      j = 0,
      result;

    for( ; i < len; i++ ){
      result = this[i];
      
      if( fn.call(context, result, i, this) ){
        arr[ j++ ] = result;
      }
    }
    
    return arr;   
  };
}
  
if( !AP.reduce ){
  // ECMAScript 5 15.4.4.21 
  // 遍历数组并执行回调，将previous元素与next元素传入回调函数中进行计算，
  // 回调的返回值作为previous元素继续与next元素再进行计算，最后返回计算结果
  // fn: 遍历时执行的回调函数。回调函数接受4个参数，第一个参数是 previous 数组元素，
  // 第二个参数是 next 数组元素，第三个参数是当前遍历的数组索引，第四个参数是数组本身
  // result: previous的初始值，默认为数组的第1个元素
  AP.reduce = function( fn, result ){   
    var len = this.length,
      i = 0;
      
    if( result === undefined ){
      result = this[i++];
    }
    
    for( ; i < len; i++ ){
      result = fn( result, this[i], i, this );
    }
    
    return result;
  };
}

if( !AP.reduceRight ){
  // ECMAScript 5 15.4.4.22
  // 该方法是reduce的反转版，只是计算顺序是从右到左，reduce是从左到右
  AP.reduceRight = function( fn, result ){
    var len = this.length,
      i = len - 1;
      
    if( result === undefined ){
      result = this[i--];
    }
    
    for( ; i >= 0; i-- ){
      result = fn( result, this[i], i, this );
    }
    
    return result;
  };  
}

// 修复IE6-7的unshift不返回数组长度的BUG
if( [].unshift(1) !== 1 ){
  var unshift = AP.unshift;
  AP.unshift = function(){
    unshift.apply( this, arguments );
    return this.length;
  };
}

if( !Date.now ){
  // 返回据1970年1月1日之间的毫秒数
  Date.now = function(){
    return +new Date;
  };
  
  DP.getYear = function(){
    return this.getFullYear() - 1900;
  };
  
  DP.setYear = function( year ){
    return this.setFullYear( year );
  };
}

if( !FP.bind ){
  // ECMAScript 5 15.3.4.5
  // 创建一个绑定函数，绑定函数会以创建它时传入bind方法的第一个参数作为this, 传入bind方法的
  // 第二个以及以后的参数会按顺序加上原函数的参数来调用原函数
  // context: 绑定函数的this指针
  // 1个或多个参数，当绑定函数被调用时，这些参数会按顺序加上原函数运行时的参数
  FP.bind = function( context ){    
    if( arguments.length < 2 && context === undefined ){
      return this;
    }
    
    var self = this,
      Nop = function(){},
      args = AP.slice.call( arguments, 1 ),           
      Bound = function(){
        var newArg = args.concat.apply( args, arguments );
          context = this instanceof Nop && context ? this : context;
          
        return self.apply( context, newArg );
      };
      
    Nop.prototype = this.prototype;
    Bound.prototype = new Nop();
    return Bound;
  };
}

if( !Object.keys ){
  // ECMAScript 5 15.2.3.14
  // 遍历对象，将对象的属性名组成数组返回( 不包含原型链上的属性名 )
  // obj: 待遍历的对象
  Object.keys = function( obj ){
    var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable( 'toString' ),
      arr = [],
      i = 0,
      j = 0,
      name, dontEnums, len;

    for( name in obj ){
      if( hasOwnProperty.call(obj, name) ){
        arr[ j++ ] = name;
      }
    }
    
    // 修复IE的for in的BUG
    if( hasDontEnumBug ){
      dontEnums = 'propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor'.split( ',' );
      len = dontEnums.length;
      for( ; i < len; i++ ){
        name = dontEnums[i];
        if( hasOwnProperty.call(obj, name) ){
          arr[ j++ ] = name;
        }
      }
    }
    
    return arr;
  };
}

if( !SP.trim ){
  // 字符串首尾去空格
  SP.trim = function(){
    // http://perfectionkills.com/whitespace-deviations/
    var whiteSpaces = [
        '\\s',
        '00A0', 
        '1680', 
        '180E', 
        '2000-\\u200A',
        '200B', 
        '2028', 
        '2029', 
        '202F', 
        '205F', 
        '3000'
      ].join('\\u'),
      
      trimLeftReg = new RegExp( '^[' + whiteSpaces + ']' ),
      trimRightReg = new RegExp( '[' + whiteSpaces + ']$' );
      
    return this.replace( trimLeftReg, '' ).replace( trimRightReg, '' );
  };
}
