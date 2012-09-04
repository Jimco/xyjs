/**
 * application
 * By xiejiancong.com
 * 2012-09-04
 */

(function(W){
  XY = W.XY ||  {} ;
  
  var DOC = document;
  
  //判断是否IE浏览器
  XY.isIE = !-[1,];

  //浏览器判定 是否IE6
  XY.isIE6 = XY.isIE && !window.XMLHttpRequest;

  XY.ability = {
    placeholder:function(){ return 'placeholder' in DOC.createElement("input"); }(),
    flash:function(){
        var plg = navigator.plugins ;
        return plg.length > 0 && function(){
            for(var i=0,p;p=plg[i++];){
	      if( p.name.toLowerCase().indexOf("shockwave flash") > -1 ){
	        return true;
	      }
	    }
	    return false;
          }() ;
    }(),
    audioMp3Supported:function(){
      if( typeof HTMLAudioElement === 'function' || typeof HTMLAudioElement === 'object' ){
        var a = new Audio();
        return a.canPlayType("audio/mpeg");
      }
      return false;
    }(),
    localStorage:function(){
      return !!window.localStorage;
    }(),
    fixedSupport:function(){
      var div = DOC.createElement("div") ,
          divstyle = div.style ;
      divstyle.cssText = "position:absolute;position:fixed;"
      return divstyle['position'] == 'fixed';
    }()
  };

  XY.isEmptyObject = function( obj ){
    return ( typeof obj === 'object' ) && function(){
      for(var p in obj ){}
      return p === undefined ;
    }();
  };


  //参数化url
  XY.params = function( u ){
    u = u || location.search;
    /*
    * 如果u为undefined则使用location.search
    * 如果两个都没有，就返返回一个false
    */
    if( !u ){ return false; }
    var p = u.split("\?");
    var o = {};
    p = p.length ==2 ? p[1] : p[0];
    var list = p.split("\&");
    for( var i=0; i<list.length; i++ ){
      var m = list[i];
      m = m.split("\=");
      o[m[0]] = m.slice(1,m.length).join("=") || "";
    }
    return o ;
  };

  XY.decodeParams = function ( para ){
    if( typeof para !== 'object' ){
      return para;
    }else{
      var html = [];
      for(var p in para ){
        html.push( p + "=" + encodeURIComponent( para[p]) );
      }
      return html.join("&");
    }
  };
  /*
  * @author darrel
  * @params [html:String,data:JSON ]
  * 模版
  */
  XY.template = function( html , data , reg ){
    var reg = reg ||  /\{([\w-]+)\}/g ;
    return html.replace( reg, function( m , name ){
      if( data[name] !== undefined ){
        var ret ;
        if(data[name] instanceof Function){
          ret =  data[name].call(data);
        }else{
          ret =  data[name];
        }
        return reg.test( ret ) ?  
          M.template( ret , data , reg ) : ret ;                  
      }else{
        return "" ;
      }
    });
  };

  //返回当前url或设置转跳 
  XY.locate = function( url ){
    if(!!!url){
      return window.location.href;
    }else{
      window.location.href = url;
    }
  };
  /*
  *类方法重载
  *如果想针对某类进行扩展方法或重载可以用这个方法
  * eg.
  * <code>
  *   XY.override( XY.Object , {
  *     test:function(){
  *       // to do
  *     }
  *   })
  * </code>
  * 这样XY.Object就有了test方法
  */
  XY.override = function( origclass , overrides ){
    if( overrides ){
      //$.extend( origclass.prototype , overrides )
      for(var p in overrides){
         origclass.prototype[p] = overrides[p];
	 //把方法或属性写入原型链之中
	 //如果原型链中已经有这个属性或方法则会覆盖，
	 //否则就是新增
      }
    }
  };
 
  //类的继承方法
  XY.extend = function( superclass , subclass ){
    var F = function(){ } , 
      sb  = subclass ,
      sbp ,
      overrides = sb ,
      spp = superclass.prototype ;
    var oc = Object.prototype.constructor;
    /*if( typeof subclass == 'object'){
      /*
      * 如果subclass没有构造函数（typeof {} == 'object' ,
      * typeof function(){} == 'function'）
      * 需要给 sublcass指定一个构造。
      * 如果父类存在且有构造，就直接使用父类的将构造
      * 否则就使用黙认的构造（这个构造以认为传入
      * 的数参为一个或多个Object，然后依次将Object的属性
      * 拷呗到subclass中来）
      * 
      *
      sb  =  superclass.constructor == oc ? 
          subclass.constructor : 
          function( ){ 
            //for( var i=0; i<arguments.length; i++ ){
              var p = arguments[0];
              //$.extend( this, p );
              for(var pt in p){
                this[pt] = p[pt];
              }
              if( 'init' in this && this['init'] instanceof Function){
                this.init();
              }
            //}
          };
    /*}*/
    sb = sb.constructor !== oc ?
      sb.constructor :
      function(){
        var arg = arguments[0];
        for(var p in arg){
          this[p] = arg[p]
        }
        if( 'init' in this && this['init'] instanceof Function ){
          this.init();
        }
      };
    F.prototype = spp; /* 把父类的prototype传过来 */
    sbp = sb.prototype = new F(); /* sbp -- subclass.prototype 通过new F()形成原型链*/
    sbp.constructor = sb ;/*重置构造引用，防止 instanceof 链接断开*/
    /*if( spp.constructor == oc ){
      spp.constructor = superclass ;
    }*/
    sbp.override = function( o ){
      M.override( sb , o );
    }
    sb.extend = function( o ){
      return M.extend( sb , o );
    } /*扩展子类，为其增加extend方法方便扩展*/
    XY.override(  sb , overrides );
    return sb; 
  };
  
  XY.merge = function( o , p ){
    for(var attr in p ){
      o[ attr ] = p[ attr ];
    }
    return o ;
  } ;

  XY.applyIfNot = function( o , org , keep){
    var Key =" \u2001"
    keep = Key + ( keep || [] ).join( Key ) + Key ;
    for( var p in org ){
      if( !( p in o ) &&  keep.indexOf( Key + p + Key ) <= -1 ){
        o[ p ] = org[p];
      }
    }
  };
}(window));
