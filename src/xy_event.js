/**
 * xy Event模块(依赖 xy_core.js xy_dom.js)
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
XY.install('Event', function(XY){

  var me = this
    , D = XY.DOM
    , W = window
    , isString = XY.isString
    , isNodelist = XY.isNodelist
    , __add = function(elem, type, handle){
        if(elem.addEventListener){
          elem.addEventListener(type, handle, false);
        }else if(elem.attachEvent){
          elem.attachEvent('on'+type, handle);
        }else{
          elem['on'+type] = handle;
        }
      }
    , Event = {
        /**
         * 事件绑定
         * @param  {String} el       元素对象
         * @param  {String} type     事件类型
         * @param  {Function} handle 事件处理函数
         */
        addEvent: function(el, type, handle){
          if(el.addEventListener){
            el.addEventListener(type, handle, false);
          }else if(el.attachEvent){
            el.attachEvent('on' + type, function(){
              handle.call(el);
            });
          }else{
            el['on' + type] = handle;
          }
        },

        /**
         * 移除事件绑定
         * @param  {String} el       元素对象
         * @param  {String} type     事件类型
         * @param  {Function} handle 事件处理函数
         */
        removeEvent: function(el, type, handle){
          if(el.removeEventListener){
            el.removeEventListener(type, handle, false);
          }else if(el.detachEvent){
            el.detachEvent('on' + type, function(){
              handle.call(el);
            });
          }else{
            el['on' + type] = handle;
          }
        },

        /**
         * 获取event对象
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        getEvent: function(e){
          return e || event;
        },


        /**
         * 获取target对象(须先获取event对象)
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        getEventTarget: function(e){
          e = e || W.event;
          return e.target || e.srcElement;
        },

        /**
         * 获取相关元素,在mouseover,mouseout时使用(须先获取event对象)
         * @param  {[type]} e [description]
         */
        getRelatedTarget: function(e){
          if(e.relatedTarget){
            return e.relatedTarget;
          }else if(e.toElement){
            return e.toElement;
          }else if(e.fromElement){
            return e.fromElement;
          }else{
            return null;
          }
        },

        /**
         * 阻止冒泡(须先获取event对象)
         * @param  {[type]} e [description]
         */
        stopPropagation: function(e){
          if(e.stopPropagation){
            e.stopPropagation();
          }else{
            e.calcelBubble = true;
          }
        },

        /**
         * 阻止默认行为(须先获取event对象)
         * @param  {[type]} e [description]
         */
        preventDefault: function(e){
          if(e.preventDefault){
            e.preventDefault();
          }else{
            e.returnValue = false;
          }
        },

        add: function(elem, type, handle){
          var elem = isString(elem) ? D.query(elem) : elem;

          if(isNodelist(elem)){

            XY.each(elem, function(i){
              this.addEvent(i, type, handle);
            });

          }else{
            this.addEvent(elem, type, handle);
          }

          return elem;
        },

        on: function(elem, type, handle){
          this.add.apply(me, arguments);
          return elem;
        },

        off: function(){
          
        },

        /**
         * 事件代理绑定
         */
        delegate: function(container, selector, type, handle){
          var container = isString(container) ? D.query(container) : container
            , __handle = function(e){
                if(this.getEventTarget(e).tagName.toLowerCase() === selector){
                  handle.call(me, e);
                }
              };

          if(isNodelist(container)){

            XY.each(container, function(i){
              this.addEvent(i, type, __handle);
            });

          }else{

            this.addEvent(container, type, __handle);

          }
          return container;
        },

        /**
         * window 加载完毕
         * @param  {Function} handle 事件处理函数
         */
        winLoad: function(handle){
          var self = this
            , win = window;
          self.addEvent(win, 'load', function(){
            self.removeEvent(win, 'load', arguments.callee);
            handle();
          });
        },

        /**
         * DOM文档树加载完毕
         * @param  {Function} handle 事件处理函数
         */
        DOMReady: function(handle){
          var doc = document;
          if(doc.addEventListener){
            doc.addEventListener('DOMContentLoaded', function(){
              doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
              handle();
            }, false);
          }else if(doc.attachEvent){
            doc.attachEvent('onreadystatechange', function(){
              if(doc.readyState === 'interactive' || doc.readyState === 'complete'){
                doc.detachEvent('onreadystatechange', arguments.callee);
                handle();
              }
            })
          }
        }


      };

  return Event;

});
