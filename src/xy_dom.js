/**
 * xy DOM模块
 * Author: xjiancong@gmail.com
 * Date: 2013-08-06
 */
XY.install('DOM', function(XY){
  var me = this
    , doc = document
    , EMPTY = ''
    , trim = XY.trim
    , isArray = XY.isArray
    , isString = XY.isString
    , isNodelist = XY.isNodelist
    , DOM = {
        /**
         * query 获取DOM元素
         */
        query: function(selector){
          var self = this
            , __doc = arguments[1] ? arguments[1] : doc
            , __selector = isString(selector) ? selector : selector.toString();

          __selector = trim(selector);

          if(XY.indexOf('#', __selector)){

            return self.getById(__selector) || null;

          }else if(XY.indexOf('.', __selector)){

            return self.getByClass(__selector) || null;

          }else{
            return __doc.getElementsByTagName(__selector) || null;
          }
        },
        /**
         * 通过id获取节点元素
         * @param  {String} id 
         * @return {Object} 节点元素 
         */ 
        getById: function(id){
          if(!!id && typeof id === 'string'){
            return document.getElementById(id);
          }
        },

        /**
         * 通过节点属性attribute获取节点元素集合
         * @param  {String} attr      属性名
         * @param  {String} value     属性值
         * @param  {Object} nodeRefer 上下文
         * @return {Object}           节点元素集合
         */
        getByAttr: function(attr, value, nodeRefer){
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
        },

        /**
         * 通过class获取节点元素集合
         * @param  {String} className 
         * @param  {String} nodeRefer 上下文
         * @return {Array}            节点数组
         */
        getByClass: function(className, nodeRefer){
          var self = this;
          if(typeof document.getElementsByClassName === 'function'){
            nodeRefer = nodeRefer ? nodeRefer : document;
            return Array.prototype.slice.call(nodeRefer.getElementsByClassName(className));
          }else{
            return self.getByAttr('className', className, nodeRefer);
          }
        },

        /**
         * 创建标签
         * @param  {String} tagName 标签名
         * @param  {Object} attrs   属性对象集合
         * @return {[type]}         返回创建的元素对象
         */
        createEl: function(tagName, attrs){
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
        },

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

      }

  return DOM;
});

