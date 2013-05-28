/**
 * xyEvent
 * Author: xiejiancong.com
 * Date: 2013-05-28
 */
(function(window, undefined){

  XY = window.XY || {};

  XY.Event = {
    addEvent: function(el, type, fn, capture){
      var _eventCompat = function(event) {
        var type = event.type;
        if (type == 'DOMMouseScroll' || type == 'mousewheel') {
          event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
        }
        if (event.srcElement && !event.target) {
          event.target = event.srcElement;  
        }
        if (!event.preventDefault && event.returnValue !== undefined) {
          event.preventDefault = function() {
            event.returnValue = false;
          };
        }
        return event;
      };

      if(window.addEventListener){
        if(type === "mousewheel" && document.mozHidden !== undefined){
          type = "DOMMouseScroll";
        }
        el.addEventListener(type, function(event) {
          fn.call(this, _eventCompat(event));
        }, capture || false);

      }else if(window.attachEvent){
        el.attachEvent("on" + type, function(event){
          event = event || window.event;
          fn.call(el, _eventCompat(event)); 
        });
      }
      return function(){};
    }
  }

})(window);