/**
 * 异步操作promise
 */
(function(window, XY, undefined){

  function Promise(){
    var me = this;

    this.pending = [];

    this.resolve = function(result){
      me.complete('resolve', result);
    }

    this.reject = function(result){
      me.complete('reject', result);
    }
  }

  Promise.prototype = {
    then: function(success, failure){
      this.pending.push({ resolve: success, reject: failure });
      return this;
    },

    complete: function(state, result){
      // while(this.pending[0]){
      //   this.pending.shift()[state](result);
      // }
      var me = this
        , t;

      while( t = me.pending.shift() ){
        if(typeof t === 'number'){
          setTimeout(function(){
            var prms = new Promise(me.thens);
            prms[state](result);
          }, t);
        }
        else{
          t[state](result);
        }
      }
    },

    delay: function(timeout){
      this.pending.push(+timeout);
      return this;
    }
  }

  XY.Promise = Promise;

})(window, window.XY || {});