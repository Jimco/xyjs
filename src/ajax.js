/**
 * xy Ajax模块(依赖 xy_core.js)
 * Author: xjiancong@gmail.com
 */
(function(window, XY){

  var defaultConfig = {
      method: 'POST',
      url: '/',
      async: false,
      data: null,
      success: function(e){},
      failure: function(e){}
    }
    , defaultHeaders = {
      contentType: 'application/x-www-form-urlencoded',
      requestedWith: 'XMLHttpRequest',
      accept: {
        '*': 'text/javascript, text/html, application/xml, text/xml, */*',
        xml: 'application/xml, text/xml',
        html: 'text/html',
        json: 'application/json, text/javascript',
        js: 'application/javascript, text/javascript'
      }
    };

  var xyAjax = {
      createXHR: function(o){
        if(o.crossOrigin === true){
          var xhr = 'XMLHttpRequest' in window ? new XMLHttpRequest() : null;
          if(xhr && 'withCredentials' in xhr){
            return xhr;
          }
          else if('XDomainRequest' in window){
            return new XDomainRequest();
          }
          else{
            throw new Error('Browser does not support cross-origin requests');
          }
        }
        else if('ActiveXObject' in window){
          try{
            return new ActiveXObject( 'Microsoft.XMLHTTP' );
          }
          catch(_){}
        }
        else{
          return new XMLHttpRequest();
        }
      }


    }

  XY.mix(XY, {
    ajax: function(options){
      if(!options.url) return;


    }

    
  });

})(window, window.XY || {}); 
