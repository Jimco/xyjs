/**
 * 异步操作promise
 * Author: xjiancong@gmail.ocm
 * Date: 2013-09-16
 */
(function(window, XY, undefined){

  XY.Promise = function(){
    this.callbacks = [];
  }

  XY.Promise.prototype = {
    // 添加已完成和已拒绝的回调
    then: function(fn, context){

    },

    // 执行已完成状态
    resolve: function(){

    },

    // 执行已拒绝状态
    reject: function(){

    }
  }


})(window, window.XY || {});