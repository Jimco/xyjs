/**
 * 异步操作promise - 当耐特
 */
(function(window, XY, undefined){

  var Promise = function(thens){
    this.thens = thens || [];
  }

  Promise.prototype = {

    // 触发done
    resolve: function(){
      if(this.promiseArr){
        for(var i = 0, len = this.promiseArr.length; i < len; i++){
          this.promiseArr[i].resolveCount++;
        }

        if(this.promiseArr[0].action === 'any'){
          if(this.resolveCount !== this.promiseArr.length) return;
        }
        else{
          if(this.resolveCount > 1) return;
        }
      }

      var t, n;

      while( t = this.thens.shift() ){
        if(typeof t === 'number'){
          var me = this;
          setTimeout(function(){
            var prms = new Promise(me.thens);
            prms.resolve();
          }, t);
          break;
        }

        var doneFn = t.done
          , action = t.action;

        if(t.alwaysCB && !doneFn){
          n = t.alwaysCB.apply(null, arguments);
          if(n instanceof Promise){
            n.thens = this.thens;
            break;
          }
          continue;
        }

        if(!doneFn) continue;
        if(doneFn instanceof Array){
          var arr = [];
          for(var i = 0, len = doneFn.length; i < len; i++){
            var m = doneFn[i].apply(null, arguments);
            if(m instanceof Promise){
              m.thens = this.thens;
              arr.push(m);
            }
          }

          var len = arr.length;
          if(l === 0){
            continue;
          }else{
            for(var i = 0; i < len; i++){
              arr[i].promiseArr = arr;
              arr[i].action = 'action';
              arr[i].resolveCount = 0;
            }
            break;
          }
        }
        else{
          n = doneFn.apply(null, arguments);
          if(n instanceof Promise){
            n.thens = this.thens;
            break;
          }
          continue;
        }
      }
    },

    // 触发fail
    reject: function(){
      if(this.promiseArr && this.promiseArr[0].action === 'any'){
        if(this.promiseArr[this.promiseArr.length -1] !== this) return;
      }

      var n, t;
      while(t = this.thens.shift()){
        if(typeof t === 'number'){
          var me = this;
          setTimeout(function(){
            var prms = new Promise(me.thens);
            prms.resolve();
          }, t);
          break;
        }

        if(t.fail){
          n = t.fail.apply(null, arguments);
          if(n instanceof Promise){
            n.thens = this.thens;
            break;
          }
          continue;
        }
        else{
          if(t.alwaysCB){
            n = t.alwaysCB.apply(null, arguments);
            if(n instanceof Promise){
              n.thens = this.thens;
              break;
            }
            continue;
          }
        }
        break;
      }

    },

    // 触发progress
    notify: function () {
      var t = this.thens[0];
      t.progress.apply(null, arguments);
    },

    // 添加已完成和已拒绝的回调
    then: function(done, fail, progress){
      this.thens.push({done: done, fail: fail, progress: progress});
      return this;
    },

    any: function(done, fail, progress){
      this.thens.push({ done: done, fail: fail, progress: progress, action: "any" });
      return this;
    },

    // 注册成功回调函数
    done: function(done){
      if(this.thens.length === 0 || this.thens[this.thens.length - 1].done || this.thens[this.thens.length - 1].alwaysCB){
          this.thens.push({ done: done });
      } 
      else{
        this.thens[this.thens.length - 1].done = done;
      }
      return this;
    },

    // 注册失败回调函数
    fail: function(fail){
      if(this.thens.length === 0 || this.thens[this.thens.length - 1].fail || this.thens[this.thens.length - 1].alwaysCB){
        this.thens.push({ fail: fail });
      } 
      else{
         this.thens[this.thens.length - 1].fail = fail;
      }
      return this;
    },


    // 注册处理中进度的回调函数
    progress: function (progress) {
      if(this.thens.length === 0 || this.thens[this.thens.length - 1].progress){
        this.thens.push({ progress: progress });
      } 
      else{
        this.thens[this.thens.length - 1].progress = progress;
      }
      return this;
    },

    always: function (alwaysCB) {
      if(this.thens.length === 0 || this.thens[this.thens.length - 1].alwaysCB || this.thens[this.thens.length - 1].done || this.thens[this.thens.length - 1].fail){
          this.thens.push({ alwaysCB: alwaysCB });
      }
      else{
        this.thens[this.thens.length - 1].alwaysCB = alwaysCB;
      }
      return this;
    },

    wait: function(timeout){
      this.thens.push(+timeout);
      return this;
    }
  };

  XY.mix(XY, {
    Promise: function(param){
      if(param){
        if(param === true){
          var prms = new Promise();
          setTimeout(function(){
            prms.resolve();
          }, 1);
          return prms;
        }
        else{
          var prms = param();
          if(prms instanceof Promise) return prms;
        }
      }
      return new Promise();
    }
  });

})(window, window.XY || {});