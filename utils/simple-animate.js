/**
 * 简单动画效果封装
 * Author: xiejiancong.com
 * Date: 2012-10-05
 */
(function(W, undefined){
  W.animate = function(ele, sty, time){
    for(i in sty){
      (function(i){
        //先获取元素实际属性值
        if(ele.style[i] && ele.style[i] != 'auto'){
          ele.style[i] = ele.style[i] ;
        }else if (ele.currentStyle){
          ele.style[i] = ele.currentStyle[i];
        }else if(window.getComputedStyle){
          ele.style[i] = window.getComputedStyle(ele,null).getPropertyValue(i);
        }else{
          ele.style[i] = '0';
        }
        //每100毫秒变化的透明度  or 每移动1px需要的毫秒数
        var speed; 
        if(i == 'opacity'){
          speed = (parseFloat(sty[i]) - parseFloat(ele.style[i]))/time*10;
        }else{
          speed = time/(parseFloat(sty[i]) - parseFloat(ele.style[i]));
        }
        //改变属性，并通过setTimeout递归执行
        (function(){
          if(i == 'opacity'){
            if(parseFloat(sty[i]).toFixed(2)!=parseFloat(ele.style[i]).toFixed(2)){
              ele.style[i] =parseFloat(ele.style[i]) + speed;
            }else{
              return;
            }
            setTimeout(arguments.callee,10);
          }else{
            var a = speed>=0?1:-1;
            if(parseInt(sty[i])!=parseInt(ele.style[i])){
              ele.style[i] =parseInt(ele.style[i]) + a + 'px';
            }else{
              return;
            }
            setTimeout(arguments.callee,Math.abs(speed));
          }
        })();
      })(i)
    }
  }
})(window, undefined)
