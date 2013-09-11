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
      success: function(e){ }
    };

  var xyAjax = {
      createXHR: function(){
        if('ActiveXObject' in window){
          if('XMLHttpRequest' in window) return XMLHttpRequest();
          
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
