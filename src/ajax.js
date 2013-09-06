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
      success: function(e){
        console.log(e);
      }
    };

  var xyAjax = {
      
    }

  XY.mix(XY, {
    ajax: xyAjax
  });

})(window, window.XY || {}); 
