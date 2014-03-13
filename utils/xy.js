/**
 * XY 基础库
 * Version: 0.0.1
 * Date: 2013-06-27
 */
(function(window, XY, undefined){

  window.console || (console = { log: function(){}, dir: function(){}, error: function(){} });

  /**
   * 通过id获取节点元素
   * @param  {String} id 
   * @return {Object} 节点元素 
   */
  XY.getById = function(id){
    if(!!id && typeof id === 'string'){
      return document.getElementById(id);
    }
  }

  /**
   * 通过节点属性attribute获取节点元素集合
   * @param  {String} attr      属性名
   * @param  {String} value     属性值
   * @param  {Object} nodeRefer 上下文
   * @return {Object}           节点元素集合
   */
  XY.getByAttr = function(attr, value, nodeRefer){
    var nodeResult = []
      , nodeRefer = nodeRefer ? nodeRefer : document
      , nodesCollection = nodeRefer.getElementsByTagName('*');

    for(var i = nodesCollection.length - 1; i >= 0; i--){
      var node = nodesCollection[i];
      if(attr === 'className' || attr === 'class'){
        if(node.className === value) nodeResult.push(node);
      }else{
        if(node.getAttribute(attr) === value) nodeResult.push(node);
      }
    }
  }

  /**
   * 通过class获取节点元素集合
   * @param  {String} className 
   * @param  {String} nodeRefer 上下文
   * @return {Array}            节点数组
   */
  XY.getByClass = function(className, nodeRefer){
    if(typeof document.getElementsByClassName === 'function'){
      nodeRefer = nodeRefer ? nodeRefer : document;
      return Array.prototype.slice.call(nodeRefer.getElementsByClassName(className));
    }else{
      return XY.getByAttr('className', className, nodeRefer);
    }
  }

  /**
   * 创建标签
   * @param  {String} tagName 标签名
   * @param  {Object} attrs   属性对象集合
   * @return {[type]}         返回创建的元素对象
   */
  XY.createEl = function(tagName, attrs){
    var el = document.createElement(tagName);

    if(attrs){
      for(var name in attrs){
        if(attrs.hasOwnProperty(name)){
          if(name === 'class' || name === 'className'){
            el.className = attrs[name];
          }else if(name === 'style'){
            el.style.cssText = attrs[name];
          }else{
            el.setAttribute(name, attrs[name]);
          }
        }
      }
    }

    return el;
  }

  /**
   * 事件绑定
   * @param  {String} el       元素对象
   * @param  {String} type     事件类型
   * @param  {Function} handle 事件处理函数
   */
  XY.addEvent = function(el, type, handle){
    if(el.addEventListener){
      el.addEventListener(type, handle, false);
    }else if(el.attachEvent){
      el.attachEvent('on' + type, function(){
        handle.call(el);
      });
    }else{
      el['on' + type] = handle;
    }
  }

  /**
   * 移除事件绑定
   * @param  {String} el       元素对象
   * @param  {String} type     事件类型
   * @param  {Function} handle 事件处理函数
   */
  XY.removeEvent = function(el, type, handle){
    if(el.removeEventListener){
      el.removeEventListener(type, handle, false);
    }else if(el.detachEvent){
      el.detachEvent('on' + type, function(){
        handle.call(el);
      });
    }else{
      el['on' + type] = handle;
    }
  }

  /**
   * 获取event对象
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  XY.getEvent = function(e){
    return e || event;
  }

  /**
   * 获取target对象(须先获取event对象)
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  XY.getEventTarget = function(e){
    return e.target || e.srcElement;
  }

  /**
   * 获取相关元素,在mouseover,mouseout时使用(须先获取event对象)
   * @param  {[type]} e [description]
   */
  XY.getRelatedTarget = function(e){
    if(e.relatedTarget){
      return e.relatedTarget;
    }else if(e.toElement){
      return e.toElement;
    }else if(e.fromElement){
      return e.fromElement;
    }else{
      return null;
    }
  }

  /**
   * 阻止冒泡(须先获取event对象)
   * @param  {[type]} e [description]
   */
  XY.stopPropagation = function(e){
    if(e.stopPropagation){
      e.stopPropagation();
    }else{
      e.calcelBubble = true;
    }
  }

  /**
   * 阻止默认行为(须先获取event对象)
   * @param  {[type]} e [description]
   */
  XY.preventDefault = function(e){
    if(e.preventDefault){
      e.preventDefault();
    }else{
      e.returnValue = false;
    }
  }

  /**
   * window 加载完毕
   * @param  {Function} handle 事件处理函数
   */
  XY.winLoad = function(handle){
    var win = window;
    XY.addEvent(win, 'load', function(){
      XY.removeEvent(win, 'load', arguments.callee);
      handle();
    });
  }

  /**
   * DOM文档树加载完毕
   * @param  {Function} handle 事件处理函数
   */
  XY.DOMReady = function(handle){
    var doc = document;
    if(doc.addEventListener){
      doc.addEventListener('DOMContentLoaded', function(){
        doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
        handle();
      }, false);
    }
    else if(doc.attachEvent){
      doc.attachEvent('onreadystatechange', function(){
        if(doc.readyState === 'interactive' || doc.readyState === 'complete'){
          doc.detachEvent('onreadystatechange', arguments.callee);
          handle();
        }
      })
    }
  }

  /**
   * 设置cookie
   * @param  {String} name  cookie名
   * @param  {String} value cookie值
   * @param  {String} time  cookie失效时间
   */
  XY.setCookie = function(name, value, time){
    var date = new Date();
    date.setTime(date.getTime() + time*24*60*60*1000);
    document.cookie = name + "=" + value + "; expires=" + date.toGMTString()+"; path=/";
  }

  /**
   * 获取cookie
   * @param  {String} name cookie名
   * @return {String}      cookie值
   */
  XY.getCookie = function(name){
    var search = name + '=';
    if(document.cookie.length > 0){ 
      offset = document.cookie.indexOf(search); 
        if(offset != -1){ 
          offset += search.length; 
          end = document.cookie.indexOf(';',offset); 
          if(end == -1) end = document.cookie.length;
          return document.cookie.substring(offset, end); 
        }else{
          return ''; 
        }
    }else{
      return '';
    }
  }

  /**
   * 删除cookie
   * @param  {String} name cookie名
   */
  XY.delCookie = function(name){
    var date = new Date();   
    date.setTime(date.getTime() - 10000);   
    document.cookie = name + "=a;expires=" + date.toGMTString();
  }

  /**
   * ajax 异步请求
   * @param  {Object} settings 配置参数
   */
  XY.ajax = function(settings){
    settings = XY.extend({
      url: '',
      type: 'get',
      data: '',
      isJson: false
    }, settings);

    var url = XY.trim(settings.url)
      , type = settings.type.toLowerCase()
      , data = settings.data
      , isJson = settings.isJson
      , success = settings.success
      , response;

    if(typeof url !== 'string' || url === '') return;

    function createXHR(){
      if(typeof XMLHttpRequest === 'function'){
        return new XMLHttpRequest();
      }else if(typeof ActiveXObject === 'function'){
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }

    var xhr = createXHR();
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if((xhr.status >= 200 && xhr.status < 300) ||
          xhr.status === 304 ||
          xhr.status ===1223){
          var response = decodeURIComponent(xhr.responseText);
          if(isJson){
            response = eval('(' + response + ')')
          }
          if(success) success(response);
        }
      }
    }

    xhr.open(type, url, true);
    if(type === 'get'){
      xhr.send(null);
    }else if(type === 'post'){
      xhr.send(data);
    }
  }

  /**
   * jsonp 跨域
   * options:
   * {
   *   url: '',               // 请求的 url
   *   data: {},              // 相关参数
   *   callback: 'callback',  // 回调函数名 (可选)
   *   time: 10000,           // 超时时间 (可选)
   *   charset: 'UTF-8',      // 编码 (可选)
   *   success: func,         // 请求成功执行的回调函数
   *   fail: func             // 请求超时执行的回调函数
   * }
   */
  XY.loadJsonp = (function(){
    var seq = new Date * 1;
    return function(options){
      var funcName = 'XYJsonp' + seq++
        , head = document.getElementsByTagName('head')[0]
        , script = document.createElement('script')
        , url = options.url;

      options.callback ? (options.data[options.callback] = funcName) : (options.data.callback = funcName);

      for(var key in options.data){
        url += (/\?/.test( url ) ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]);
      }

      window[funName] = function(data){
        window[funName] = undefined;
        try{
          delete window[funName];
        }catch(e){}

        head.removeChild(script);
        clearTimeout(script.timer);
        options.success && options.success(data);
      };

      if(options.time){
        script.timer = setTimeout(function(){
          window[funcName] = undefined;
          try{
            delete window[funName];
          }catch(e){}

          head.removeChild(script);
          options.fail && options.fail({ msg: '请求超时'});

        }, options.time)
      }

      script.charset = "UTF-8";
      script.src = url;
      head.appendChild(script);
    }
  }());

  /**
   * 动态加载外部js文件
   * @param  {String}   url      加载的js文件路径
   * @param  {Function} callback 加载完毕的回调函数（可选）
   */
  XY.loadScript = function(url, callback){
    setTimeout(function(){ // setTimeout将加载js彻底移出文档加载流，实现异步，不阻塞页面其他内容

      var script = XY.createEl('script', {
        'src': url,
        'type': 'text/javascript'
      });

      if(script.readyState){ // ie不支持DOM标签的onload事件,支持readystatechange事件
        XY.addEvent(script, 'readystatechange', function(){
          if(script.readyState === 'loaded' || script === 'complete'){
            if(callback) callback();
            XY.removeEvent(script, 'readystatechange', arguments.callee);
          }
        });
      }else{
        XY.addEvent(script, 'load', function(){
          if(callback) callback();
          XY.removeEvent(script, 'load', arguments.callee);
        })
      }

      document.getElementsByTagName('head')[0].appendChild(script);
    }, 0);
  }

  /**
   * 动态加载外部css文件
   * @param  {string} url 加载的css文件路径
   */
  XY.loadCss = function(url){
    var css = XY.createEl('link', {
      'href': url,
      'rel': 'stylesheet',
      'type': 'text/css'
    });

    document.getElementsByTagName('head')[0].appendChild(css);
  }


  /**
   * 扩展对象
   * @param  {object} target 默认值对象
   * @param  {object} obj    待扩展对象
   * @return {object}        扩展后的新对象
   */
  XY.extend = function(target, obj){
    if(obj){
      for(var i in target){
        if(typeof obj[i] === 'undefined') obj[i] = target[i];
      }
      return obj;
    }else{
      return target;
    }
  }

  window.XY = XY;

})(window, window.XY || {});
