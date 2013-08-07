/**
 * xy DOM模块(依赖 xy_core.js)
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
    , isUndefined = XY.isUndefined
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

        get: function(selector){
          var self = this
            , __selector = self.query(selector);

          if(__selector){
            if(isArray(__selector) || isNodelist(__selector)){
              return self.query(selector)[0];
            }else{
              return self.query(selector);
            }
          }else{
            return null;
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

        css: function(elem, style, value){
          
        },

        toggle: function(selector){

        },

        hasClass: function(elem, className){
          if(!isUndefined(elem)){
            var  elemClassName = (isString(elem) ? this.get(elem) : elem).className
              , reg = new RegExp('(\\s|^)' + className + '(\\s|$)');

            return reg.test(elemClassName);
          }
        },

        addClass: function(elem, className){
          var self = this
            , elem = isString(elem) ? self.query(elem) : elem;

          if(isArray(elem)){

            XY.each(elem, function(i){
              if(!self.hasClass(i, className)){
                i.className += ' ' + className;
              }
            });

          }else{

            if(!isUndefined(elem) && !self.hasClass(elem, className)){
              elem.className += ' ' + className;
            }

          }
        },

        removeClass: function(elem, className){
          var self = this
            , elem = isString(elem) ? self.query(elem) : elem;

          if(isArray(elem)){

            XY.each(elem, function(i){
              if(self.hasClass(i, className)){
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                i.className = i.className.replace(reg,'');
              }
            });

          }else{

            if(!isUndefined(elem) && self.hasClass(i, className)){
             var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
             elem.className = elem.className.replace(reg, '');
            }

          }

        },

        toggleClass: function(elem, className){
          var self = this
            , elem = isString(elem) ? self.query(elem) : elem;

          if(isArray(elem)){

            XY.each(elem, function(i){
              if(self.hasClass(i, className)){
                self.removeClass(i, className);
              }else{
                self.addClass(i, className);
              }
            });

          }else{

            if(self.hasClass(elem, className)){
              self.removeClass(elem, className);
            }else{
              self.addClass(elem, className);
            }

          }
        },

        setClass: function(elem, className){
          var self = this
            , elem = isString(elem) ? self.query(elem) : elem;

          if(isArray(elem)){

            XY.each(elem, function(i){
              i.className = className;
            });

          }else{

            elem.className = className;

          }

        },

        append: function(){},

        prepend: function(){}

      }

  return DOM;
});
