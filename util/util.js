/**
 * 公共的工具js
 * By xiejiancong.com
 * 2012-08-20
 */

(function( XY ){

  XY.Util = {
    //JSON字符串转换为JSON对象
    encodeJSON:function( o ){
      if ( typeof o === 'string' ){
        return window.JSON ? JSON.parse( o ) : eval( "(" + o + ')' );
      }else{
        return o ;
      }
    },
    //JSON对象转换为JSON字符串
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
    //判断是否为 NaN
    isNaN : function( o ){
      return o !== o ;
    },
    //字符串替换所有 src 要替换的字符串; oldStr 被替换的字符串;  newStr 替换成的新字符串
    replaceAll: function (src, oldStr, newStr) {
      return src.replace(new RegExp(oldStr,"g"),newStr);   
    },   
    //特殊字符转义  (&gt; to >)   (&amp; to &) ...
    decodingHtml: function(value){
      return $('<span/>').html(value).text();
    },  
    //JS Cookie操作（设置，读取，删除）
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
    //以下为根据浏览器的不同解决光标停在最后记录上
    focusLastTextArea: function(objContentId){
      var element=document.getElementById(objContentId);
      if (document.all){
            var range= element.createTextRange();
            range.collapse(false);
            range.select();
        }else {
            element.focus();
            var v= element.value;
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
    //获取指定元素坐标
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
      if (el.getBoundingClientRect) //IE
      {
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
      } else // safari & opera    
      {
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
    //数组去重复
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
    }
  };

  /**
   * 计算中英文总数
   * 
   * 调用方式 
   * XY.stringUtil.getContentLength(str, true); //返回计算短连接之后的中英文总字数 
   */
  XY.stringUtil = {
    'byteLength' : function(str){
      if (typeof str == "undefined") {
        return 0;
      }
      var a = str.match(/[^\x00-\x80]/g);
      return (str.length + (!a ? 0 : a.length));
    },
    'getContentLength' : function(content, shortUrl){
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

})(window.XY);
