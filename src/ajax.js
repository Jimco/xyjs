/**
 * xy Ajax模块(依赖 xy_core.js)
 * Author: xjiancong@gmail.com
 */
(function(window, XY){

  function encodeURIForm(){}

  function encodeURIJson(){}

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
      var args = [].slice.call(arguments, 0);
      args.push('get');
      return Ajax.request.apply(null, args);
    },

    post: function(url, data, callback){
      var args = [].slice.call(arguments, 0);
      args.push('post');
      return Ajax.request.apply(null, args);
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
    /*
     * 是否给请求加锁，如果加锁则必须在之前的请求完成后才能进行下一次请求。
     * 默认不加锁。
     */
    useLock: 0,
    timeout: 30000, // 超时时间
    isLocked: 0, //处于锁定状态
    state: Ajax.STATE_INIT, // 还未开始请求

    send: function(url, method, data){
      var me = this;
      if(me.isLocked){
        throw new Error('Locked');
      }
      else if(me.isProcessing){
        me.cancel();
      }

      var requester = me.requester;
      if(!requester){
        requester = me.requester = Ajax.getXHR();
        if(!requester){
          throw new Error('Fail to get HTTPRequester.');
        }
      }

      url = url || me.url;
      url = url.split('#')[0];
      method = (method || me.method || '').toLowerCase();
      if(method != 'post') method = 'get';
      data = data || me.data;

      if(typeof data == 'object'){
        if(data.tagName == 'FORM') data = encodeURIForm(data); // data 是 Form HTMLElement
        else data = encodeURIJson(data); // data 是 json 数据
      }

      if(data && method != 'post') url += (url.indexOf('?') != -1 ? '&' : '?') + data;
      if(me.user) requester.open(method, url, me.async, me.user, me.pwd);
      else requester.open(method, url, me.async);

      // 设置请求头
      if(var i in me.requestHeader){
        requester.setRequestHeader(i, me.requestHeader[i]);
      }

      me.isLocked = 0;
      me.state = Ajax.STATE_INIT;

      if(me.async){
        me._sendTime = new Date();
        if(me.useLock) me.isLocked = 1;
        this.requester.onreadystatechange = function(){
          var state = me.requester.readyState;
          if(state === 4){
            me._execComplete();
          }
        };

        me._checkTimeout();
      }

      if(method == 'post'){
        if(!data) data = ' ';
        requester.send(data);
      }
      else{
        requester.send(null);
      }

      if(!me.async){
        me._execComplete();
        return me.requester.responseText;
      }

    },

    /** 
     * isSuccess(): 判断现在的状态是否是“已请求成功”
     * @returns {boolean} : 返回XMLHttpRequest是否成功请求。
     */
    isSuccess: function(){
      var status = this.requester.status;
      return !status || (status >= 200 && status < 300) || status == 304;
    },

    /** 
     * isProcessing(): 判断现在的状态是否是“正在请求中”
     * @returns {boolean} : 返回XMLHttpRequest是否正在请求。
     */
    isProcessing: function(){
      var state = this.requester ? this.requester.readyState : 0;
      return state > 0 && state < 4;
    },

    /** 
     * get(url,data): 用get方式发送请求
     * @param {string} url: 请求的url
     * @param {string|jason|FormElement} data: 可以是字符串，也可以是Json对象，也可以是FormElement
     * @returns {void} : 。
     * @see : send 。
     */
    get: function(url, data){
      this.send(url, 'get', data);
    },

    /** 
     * get(url,data): 用post方式发送请求
     * @param {string} url: 请求的url
     * @param {string|jason|FormElement} data: 可以是字符串，也可以是Json对象，也可以是FormElement
     * @returns {void} : 。
     * @see : send 。
     */
    post: function(url, data){
      this.send(url, 'post', data);
    },

    /** 
     * cancel(): 取消请求
     * @returns {boolean}: 是否有取消动作发生（因为有时请求已经发出，或请求已经成功）
     */
    cancel: function(){
      var me = this;
      if(me.requester && me.isProcessing()){
        me.state = Ajax.STATE_CANCEL;
        me.requester.abort();
        me._execComplete();
        me.fire('cancel');
        return true;
      }

      return false;
    },

    _initialize: function(){

    },

    _checkTimeout: function(){
      
    },

    _execComplete: function(){}

  });



})(window, window.XY || {}); 
