/**
 * xy Ajax模块(依赖 xy_core.js)
 * Author: xjiancong@gmail.com
 */
(function(window, XY){

  function Ajax(options){
    this.options = options;
    this._initialize();
  }

  XY.mix(Ajax, {
    //请求状态
    STATE_INIT: 0,
    STATE_REQUEST: 1,
    STATE_SUCCESS: 2,
    STATE_ERROR: 3,
    STATE_TIMEOUT: 4,
    STATE_CANCEL:5,
    
    // defaultHeaders: 默认 requestHeader 信息
    defaultHeaders: {
      'Content-type': 'application/x-www-form-urlencoded UTF-8', // 最常用配置
      'X-Requested-With': 'XMLHttpRequest'
    },

    EVENTS: ['succeed', 'error', 'cancel', 'timeout', 'complete'],

    // IE 下 XMLHttpRequest 的版本
    XHRVersions: ['Microsoft.XMLHTTP'], // 应对IE6与ES5.0beta的错误，仅用最原始版xmlhttp。['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp.5.0', 'MSXML2.XMLHttp.4.0', 'Msxml2.XMLHTTP', 'MSXML.XMLHttp', 'Microsoft.XMLHTTP'], 
  
    // getXHR(): 得到一个 XMLHttpRequest 对象
    // @returns {XMLHttpRequest} : 返回一个 XMLHttpRequest 对象
    getXHR: function(){
      var version = Ajax.XHRVersions;
      if(window.ActiveXObject){
        while(version.length > 0){
          try{
            return new ActiveXObject(version[0]);
          }
          catch(e){
            version.shift();
          }
        }
      }

      if(window.XMLHttpRequest){
        return new XMLHttpRequest();
      }
      return null;
    },

    request: function(url, data, callback, method){
      if(url.constructor == Object){
        var a = new Ajax(url);
      }
      else{
        if(typeof data === 'function'){
          method = callback;
          callback = data;
          if(url && url.tagName == 'FORM'){
            method = method || url.method;
            data = url;
            url = url.action;
          }
          else{
            data = '';
          }
        }

        a = new Ajax({
          url: url,
          method: method,
          data: data,
          onsucceed: function(){
            callback.call(this, this.requester.responseText);
          }
        })
      }

      a.send();
      return a;
    },

    get: function(url, data, callback){

    },

    post: function(url, data, callback){

    }

  });

  XY.mix(Ajax.prototype, {
    url: '',
    method: 'get',
    async: true,
    user: '',
    pwd: '',
    requestHeader: null,
    data: '',
    useLock: 0,
    timeout: 30000, // 超时时间
    isLocked: 0, 
    state: Ajax.STATE_INIT, // 还未开始请求

    send: function(){

    },

    isSuccess: function(){

    },

    isProcessing: function(){

    },

    get: function(){

    },

    post: function(){

    },

    cancel: function(){

    },

    _initialize: function(){

    },

    _checkTimeout: function(){
      
    }

  });



})(window, window.XY || {}); 
