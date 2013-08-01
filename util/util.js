/**
 * 公共的工具js
 * Author: xiejiancong.com
 * Date: 2012-08-20
 * require:
 *  application.js
 */
(function(window, XY, undefined){

  XY.log = function(content){
    if(typeof console.log === 'function'){
      console.log(arguments);
    }else{
      alert(content);
    }
  };

  XY.log2 = function(what){
    try{
      console.log(what);
    }
    catch(e) {}
    finally {
      return;
    }
  };

  XY.Util = {
    // JSON字符串转换为JSON对象
    encodeJSON:function( o ){
      if ( typeof o === 'string' ){
        return window.JSON ? JSON.parse( o ) : eval( "(" + o + ')' );
      }else{
        return o ;
      } 
    },
    // JSON对象转换为JSON字符串
    decodeJSON: function (json) {
      if (window.JSON && window.JSON.stringify) {
        return JSON.stringify(json);
      }
      var html = [];
      if(typeof json == 'object') {
        if(json instanceof Array){
          var ar = [];
          html.push("[");
          for(var i = 0; i < json.length; i ++) {
            ar.push(this.decodeJSON(json[i]));
          }
          html.push(ar.join());
          html.push("]");
        } else {
          html.push("{");
          var ar = [];
          for(var p in json) {
            ar.push("\"" + p + "\":" + (this.decodeJSON(json[p])));
          }
          html.push(ar.join());
          html.push("}");
        }
        return html.join("");
      } else {
        if(typeof json !== 'number') {
          return "\"" + ( json || "" ) + "\"";
        } else {
          return json;
        }
      }
    },
    // 解析XML 跨浏览器
    parseXML: function(data , xml , tmp) {
      if(window.DOMParser) { // Standard 标准XML解析器
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , "text/xml" );
      }else{ // IE IE的XML解析器
        xml = new ActiveXObject( "Microsoft.XMLDOM" );
        xml.async = "false";
        xml.loadXML( data );
      }
  
      tmp = xml.documentElement;
  
      if(! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror"){
        XY.log("Invalid XML: " + data);
      }
  
      return xml;
    },
    // 判断是否为 NaN
    isNaN : function( o ){
      return o !== o ;
    },
    //字符串替换所有 src 要替换的字符串; oldStr 被替换的字符串;  newStr 替换成的新字符串
    replaceAll: function (src, oldStr, newStr) {
      return src.replace(new RegExp(oldStr,"g"),newStr);   
    },   
    // 特殊字符转义  (&gt; to >)   (&amp; to &) ...
    decodingHtml: function(value){
      return $('<span/>').html(value).text();
    },
    // HTML编码
    encodeHTML: function(text){
      return String(text).replace(/["<>& ]/g, function(all){
        return "&" + {
            '"': 'quot',
            '<': 'lt',
            '>': 'gt',
            '&': 'amp',
            ' ': 'nbsp'
        }[all] + ";";
      });
    },

    // 接受一个十六进制或RGB的CSS颜色值，返回的是一个包含了r、g、b三个颜色值的对象
    parseColor: function(val){
      var r, g, b;
      // 参数为RGB模式时不做进制转换，直接截取字符串即可
      if( /rgb/.test(val) ){
        var arr = val.match( /\d+/g );
        r = parseInt( arr[0] );
        g = parseInt( arr[1] );
        b = parseInt( arr[2] );
      }
      // 参数为十六进制时需要做进制转换
      else if( /#/.test(val) ){
        var len = val.length;
        // 非简写模式 #0066cc
        if( len === 7 ){
          r = parseInt( val.slice(1, 3), 16 );
          g = parseInt( val.slice(3, 5), 16 );
          b = parseInt( val.slice(5), 16 );
        }
        // 简写模式 #06c
        else if( len === 4 ){
          r = parseInt( val.charAt(1) + val.charAt(1), 16 );
          g = parseInt( val.charAt(2) + val.charAt(2), 16 );
          b = parseInt( val.charAt(3) + val.charAt(3), 16 );
        }
      }
      else{
        return val;
      }
        
      return {
        r : r,
        g : g,
        b : b
      }
    },

    randomColor: function(){
      return '#' + Math.floor(Math.random()*16777215).toString(16);
    },

    // 获取元素计算样式 eg: getStyle(elem, 'background-color');
    getStyle: function( elem, p ){
      var rPos = /^(left|right|top|bottom)$/,
        ecma = 'getComputedStyle' in window,
      // 将中划线转换成驼峰式 如：padding-left => paddingLeft
      p = p.replace( /\-(\w)/g, function( $, $1 ){
        return $1.toUpperCase();
      });
      // 对float进行处理   
      p = p === 'float' ? ( ecma ? 'cssFloat' : 'styleFloat' ) : p;
      
      return !!elem.style[p] ? 
        elem.style[p] : 
        ecma ?
        function(){
          var val = getComputedStyle( elem, null )[p];
          // 处理top、right、bottom、left为auto的情况
          if( rPos.test(p) && val === 'auto' ){
            return '0px';
          }
          return val;
        }() :
        function(){
          var val =  elem.currentStyle[p];
          // 获取元素在IE6/7/8中的宽度和高度
          if( (p === "width" || p === "height") && val === 'auto' ){
            var rect =  elem.getBoundingClientRect();       
            return ( p === 'width' ? rect.right - rect.left : rect.bottom - rect.top ) + 'px';
          }
          // 获取元素在IE6/7/8中的透明度
          if( p === 'opacity' ){
            var filter = elem.currentStyle.filter;
            if( /opacity/.test(filter) ){
                val = filter.match( /\d+/ )[0] / 100;
              return (val === 1 || val === 0) ? val.toFixed(0) : val.toFixed(1);
            }
            else if( val === undefined ){
              return '1';
            }
          }
          // 处理top、right、bottom、left为auto的情况
          if( rPos.test(p) && val === 'auto' ){
            return '0px';
          }
          return val;
        }();
    },
    
    // JS Cookie操作（设置，读取，删除）
    setCookie: function(name,value,time){
      var date = new Date();
      date.setTime(date.getTime() + time*24*60*60*1000);
      document.cookie = name + "=" + value + "; expires=" + date.toGMTString()+"; path=/";
    },
    getCookie: function(name) { 
      var search = name + "=";
      if(document.cookie.length > 0){ 
        offset = document.cookie.indexOf(search); 
          if(offset != -1){ 
            offset += search.length; 
            end = document.cookie.indexOf(";",offset); 
            if(end == -1) end = document.cookie.length;
            return document.cookie.substring(offset, end); 
          }else{
            return ""; 
          }
      }else{
        return "";
      }
    },
    // 以下为根据浏览器的不同解决光标停在最后记录上
    focusLastTextArea: function( objContentId ){
      var element = document.getElementById( objContentId );
      if (document.all){
        var range = element.createTextRange();
        range.collapse(false);
        range.select();
      }else {
        element.focus();
        var v = element.value;
        element.value= '';
        element.value= v;
       }
    },
    
    /**
     *  设置textarea位置的光标位置
     *  setSelectionRange是mozilla特有的函数
     *  createTextRange是IE特有的函数
     */
    setTextAreaCursor: function(el,st,end) {
      if(el.createTextRange){             // IE浏览器
        var range=el.createTextRange();
        range.collapse(true);
        range.moveEnd("character",end);
        range.moveStart("character", st);
        range.select();
      }else{
        el.focus();
        el.setSelectionRange(st,end);
      }
    },
    // 获取指定元素坐标
    getElementPos: function (target) {
      var ua = navigator.userAgent.toLowerCase();
      var isOpera = (ua.indexOf('opera') != -1);
      var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof
      var el;
      if (typeof target == "string")
        el = document.getElementById(target);
      else if (typeof target == "object")
        el = target;
      if (!el || el.parentNode == null || el.style.display == 'none') {
          return false;
      }
      var parent = null;
      var pos = [];
      var box;
      if (el.getBoundingClientRect){ // IE
        box = el.getBoundingClientRect();
        var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        return {
          x: box.left + scrollLeft,
          y: box.top + scrollTop
        };
      } else if (document.getBoxObjectFor) {
        box = document.getBoxObjectFor(el);
        var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
        var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
        pos = [box.x - borderLeft, box.y - borderTop];
      } else {// safari & opera    
        pos = [el.offsetLeft, el.offsetTop];
        parent = el.offsetParent;
        if (parent != el) {
          while (parent) {
            pos[0] += parent.offsetLeft;
            pos[1] += parent.offsetTop;
            parent = parent.offsetParent;
          }
        }
        if (ua.indexOf('opera') != -1 || (ua.indexOf('safari') != -1 && el.style.position == 'absolute')) {
          pos[0] -= document.body.offsetLeft;
          pos[1] -= document.body.offsetTop;
        }
      }
      if (el.parentNode) {
        parent = el.parentNode;
      } else {
        parent = null;
      }
      while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors
        pos[0] -= parent.scrollLeft;
        pos[1] -= parent.scrollTop;
        if (parent.parentNode) {
            parent = parent.parentNode;
        } else {
            parent = null;
        }
      }
      return {
        x: pos[0],
        y: pos[1]
      };
    },
    
    loadImgResize: function(obj){
      var image = new Image();
      image.onload = function(){
        if(image.width > image.height){
          obj.height = Math.round(image.height*100/image.width);
          obj.width = 100;
        }
        else {
          obj.width = Math.round(image.width*100/image.height);
          obj.height = 100;
        }
      }
      image.src = obj.src;
    },
    // 数组去重复
    distinctEl: function(obj) {
      var tempArray = [];
      var temp = "";
      var index = 0;
      for(var i = 0; i < obj.length; i++){
        temp = obj[i];
        for(var j = 0; j < tempArray.length; j++){
          if(temp == tempArray[j]){
            temp = "";
            break;
          }
        }
        if(temp == null || temp != ""){
          tempArray[index] = temp;
          index++;
        }
      }
      return tempArray;
    },
    // 对象深度克隆
    clone: function(obj){
      var o;
      if(typeof obj == "object"){
        if(obj === null){
          o = null;
        }else{
          if(obj instanceof Array){
            o = [];
            for(var i = 0, len = obj.length; i<len; i++){
              o.push(arguments.callee( obj[i] ));
            }
          }else{
            o = {};
            for(var j in obj){
              o[j] = arguments.callee(obj[j])
            }
          }
        }
      }else{
        o = obj;
      }
      return o;
    },

    /**
     * 让ie6也支持 min-width、max-width、min-heigh、max-height
     * @param elemid 目标对象id
     */
    ie6maxMinWH: function (elemid) {
      var $ele = $("#"+elemid);
      if ($.isIE6 && $ele.size() > 0 && $ele[0].currentStyle) {
        $ele.width("auto").height("auto");
        //ie6特殊属性 的取值
        var minW = parseInt($ele[0].currentStyle['min-width']);
        var maxW = parseInt($ele[0].currentStyle['max-width']);
        var minH = parseInt($ele[0].currentStyle['minHeight']);
        var maxH = parseInt($ele[0].currentStyle['max-height']);
        if ($ele.width() < minW)
          $ele.width(minW);
        else if ($ele.width() > maxW)
          $ele.width(maxW);

        if ($ele.height() < minH)
          $ele.height(minH);
        else if ($ele.height() > maxH)
          $ele.height(maxH);
      }
    },

    // 函数节流
    throttle: function(opt){
      var timer = null
        , t_start
        , fn = opt.fn
        , context = opt.context
        , delay = opt.delay || 100
        , mustRunDelay = opt.mustRunDelay || 50;

      return function(){
        var args = arguments
          , t_curr = +new Date();
        context = context || this;
        
        clearTimeout(timer);
        if(!t_start){
          t_start = t_curr;
        }
        if(mustRunDelay && t_curr - t_start >= mustRunDelay){
          fn.apply(context, args);
          t_start = t_curr;
        }
        else {
          timer = setTimeout(function(){
            fn.apply(context, args);
          }, delay);
        }
      };
    },

    base64Encode: function(input){
      var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        , output = ''
        , chr1, chr2, chr3, enc1, enc2, enc3, enc4
        , i = 0;

      input = window.utf8Encode(input);

      while (i < input.length){
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) { enc3 = enc4 = 64; }
        else if (isNaN(chr3)) { enc4 = 64; }

        output = output +
        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
      }

      return output;
    },

    base64Decode: function(input){
      var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        , output = ''
        , chr1, chr2, chr3
        , enc1, enc2, enc3, enc4
        , i = 0;
 
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) { output = output + String.fromCharCode(chr2); }
        if (enc4 !== 64) { output = output + String.fromCharCode(chr3); }
      }

      output = XY.Util.utf8Decode(output);

      return output;
    },

    uniqueId: function(length){
      var text = ''
        , length = length || 6
        , possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

      for(var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

  };

  /**
   * 计算中英文总数
   * 
   * 调用方式 
   * XY.stringUtil.getContentLength(str, true); //返回计算短连接之后的中英文总字数 
   */
  XY.stringUtil = {
    byteLength : function(str){
      if (typeof str == "undefined") {
        return 0;
      }
      var a = str.match(/[^\x00-\x80]/g);
      return (str.length + (!a ? 0 : a.length));
    },
    getContentLength : function(content, shortUrl){
      var contentLength = content.length;
      if(contentLength == 0)
        return 0;
        
      if (!shortUrl) { //不计算短链接 
        return Math.ceil($.stringUtil.byteLength(content) / 2);
      }
      
      var urlConstantsLength = 24;
      var urlList = $.getShortURLList(content);
      var uSize = urlList == null ? 0 : urlList.length;
      var allUrllength = 0;
      for(var i = 0; i < uSize; i++){
        var urlItem = urlList[i];
        allUrllength += urlConstantsLength;
        content = content.replace(urlItem, "");
      }
      return Math.ceil((allUrllength + $.stringUtil.byteLength(content)) / 2);
    }
  };

})(window, window.XY || {});

/**
 * String 扩展
 * eg:
 * "  hello world  ".trimChar(); -> "hello world"
 * "aahello worldaa".trimChar('a'); -> "hello world"
 * "$$hello world$$".trimChar('$'); -> "hello world"
 */
if(!String.prototype.trimChar){
  Object.defineProperty(String.prototype, 'trimChar', {
    value: function(c){
      if(!c || c === ' '){ 
        c = '\\s'; 
      }else if(c.match(/[\$\+\(\)\+\.\*\^\?\\]/)){
        c = '\\' + c;
      }

      return this.replace(new RegExp('^' + c + '+|' + c + '+$', 'g'), '');
    },
    enumerable: false
  });
}
