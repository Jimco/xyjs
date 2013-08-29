/**
 * xy Ajax模块(依赖 xy_core.js)
 * Author: xjiancong@gmail.com
 */
(function(window, XY){

  function xyAjax(url, callbackFn){

    this.bindFn = function(caller, object){
      return function(){
        return caller.apply(object, [object])
      }
    }

    this.stateChange = function(object){
      if(this.request.readyState == 4){
        this.callbackFn(this.request.responseText);
      }
    }

    this.getRequest = function(){
      if (window.ActiveXObject){
        return new ActiveXObject('Microsoft.XMLHTTP');
      }else if(window.XMLHttpRequest){
        return new XMLHttpRequest();
      }
      return false;
    }

    this.postBody = (arguments[2] || '');

    this.callbackFn = callbackFn;
    this.url = url;
    this.request = this.getRequest();
    
    if(this.request) {
      var req = this.request;
      req.onreadystatechange = this.bindFn(this.stateChange, this);

      if (this.postBody !== '') {
        req.open('POST', url, true);
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.setRequestHeader('Connection', 'close');
      } else {
        req.open("GET", url, true);
      }

      req.send(this.postBody);
    }
  }

  XY.mix(XY, {
    ajax: xyAjax
  });

})(window, window.XY || {}); 
