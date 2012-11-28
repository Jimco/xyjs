/**
 * xyQuery
 * Author: xiejiancong.com
 * Date: 2012-11-28
 */
!function(window, document, undefined) {
    var location = window.location,
    Slice = [].slice,
    RegTrim = /(?:^\s+|\s+$)/,
    RegBlank = /\s+/,
    RegOperate = /\s*(?:\s|>|\+|~(?!\=))\s*/i,
    RegElement = /^([\w\-]+|\*)?(?:\#([\w\-]+))?(?:\.([\w\-]+))?(?:\[([\w-]+)(?:([~|\^|\$|\*|\|]?=)['"]?([\w-]+)['"]?)?\])?(?:\:([\w-]+(?:\([\w-]+\))?))?$/i;
    function XYQuery(Selector, Content){
      Selector = Selector.replace(RegTrim, '');
      Content = Content || document;
      if(Content.querySelectorAll){
        return Slice.call(Content.querySelectorAll(Selector));
      }else{
        return querySelectorAll(Selector, Content)
      }
    }
    function querySelectorAll(Selector, Content){
      var Groups = Selector.split(/\s*\,\s*/img),
      Results = [];
      for(var i = 0, len = Groups.length; i < len; i++){
        Results = Results.concat(Find(Groups[i], Content))
      }
      return Results
    }
    function Find(Selector, Content){
      var Results = [],
      atoms = Selector.split(RegOperate),
      operates = Selector.match(RegOperate);
      operates = operates || [];
      for (var i = 0, len = operates.length; i < len; i++){
        operates[i] = /^\s+$/.test(operates[i]) ? ' ': operates[i].replace(RegTrim, '')
      };
      var Results = EachTo(' ', atoms.shift(), operates, atoms, Content);
      return Results
    }
    function EachTo(op, at, operates, atoms, Content){
      var Results = [],
          Median = [],
          operate,
          atom;
      if(Content.constructor === Array || 'length' in Content){
        for (var i = 0, len = Content.length; i < len; i++){
          Results = Results.concat(EachTo(op, at, operates.slice(0), atoms.slice(0), Content[i]))
        }
      }else if(Content.constructor === String){
        Content = Find(Content, document);
        Results.concat(EachTo(op, at, operates.slice(0), atoms.slice(0), Content[i]))
      }else{
        Median = GetElementByAny(op, at, Content);
        if(Median){
          if(operates && operates.length && atoms && atoms.length){
            Results = EachTo(operates.shift(), atoms.shift(), operates, atoms, Median)
          }else{
            Results = Median
          }
        }
      }
      return Results
    }
    function GetElementByAny(op, at, Content) {
      if(typeof OperateFunction[op] !== 'undefined'){
        return OperateFunction[op](at, Content)
      }
    }
    var OperateFunction = {
        ' ': function(at, Content) {
            var einfo = buildElementInfo(at),
            preNodes = [];
            if (!einfo) return [];
            if (einfo.Id) {
                preNodes = document.getElementById(einfo.Id);
                preNodes = preNodes ? [preNodes] : []
            } else if (einfo.ClassName && Content.getElementsByClassName) {
                preNodes = Content.getElementsByClassName(einfo.ClassName);
                preNodes = preNodes || []
            } else if (einfo.TagName && Content.getElementsByTagName) {
                preNodes = Content.getElementsByTagName(einfo.TagName);
                preNodes = preNodes || []
            } else {
                preNodes = Content.getElementsByTagName('*');
                preNodes = preNodes || []
            };
            return filterNode(einfo, preNodes)
        },
        '>': function(at, Content) {
            var einfo = buildElementInfo(at);
            preNodes = Content.childNodes || [];
            if (!einfo) return [];
            return filterNode(einfo, preNodes)
        },
        '+': function(at, Content) {
            if (Content === document) return [];
            var einfo = buildElementInfo(at);
            if (!einfo) return [];
            var results = [],
            preNodes = (function() {
                var nextNode = Content.nextSibling;
                while (nextNode && nextNode.nodeType != 1) {
                    nextNode = nextNode.nextSibling
                }
                return nextNode
            })();
            preNodes = preNodes ? [preNodes] : [];
            if (preNodes.length) {
                results = filterNode(einfo, preNodes)
            } else {
                results = []
            }
            return results
        },
        '~': function(at, Content) {
            if (Content === document) return [];
            var einfo = buildElementInfo(at),
            preNodes = [];
            if (!einfo) return [];
            var sibling = Content.parentNode ? Content.parentNode.childNodes: null;
            if (sibling) {
                for (var i = 0,
                len = sibling.length; i < len; i++) if (Content !== sibling[i]) preNodes.push(sibling[i])
            }
            return filterNode(einfo, preNodes)
        }
    };
    function buildElementInfo(at) {
      var Einfo = RegElement.exec(at);
      if (!Einfo) return;
      return {
          TagName: Einfo[1] || undefined,
          Id: Einfo[2] || undefined,
          ClassName: Einfo[3] || undefined,
          AttrName: Einfo[4] || undefined,
          AttrOper: Einfo[5] || undefined,
          AttrVal: Einfo[6] || undefined,
          FakeClass: Einfo[7] || undefined
      }
    }
    function filterNode(Einfo, Nodes) {
      var results = [],
          RegClassName,
          isMatch;
      if (Einfo.ClassName) RegClassName = new RegExp('\\b' + Einfo.ClassName + '\\b', 'i');
      for (var i = 0,
      len = Nodes.length; i < len; i++) {
          isMatch = true;
          if (Einfo.TagName !== undefined && Einfo.TagName.toUpperCase() !== Nodes[i].nodeName) isMatch = false;
          if (Einfo.Id !== undefined && Einfo.Id !== Nodes[i].id) isMatch = false;
          if (Einfo.ClassName !== undefined && !Nodes[i].className.match(RegClassName)) isMatch = false;
          isMatch = isMatchAttribute(Einfo, Nodes[i], isMatch);
          isMatch = isMatchFakeClass(Einfo, Nodes[i], isMatch);
          if (isMatch) results.push(Nodes[i])
      }
      return results
    }
    function isMatchAttribute(Einfo, node, isMatch) {
      if (Einfo.AttrName === undefined && Einfo.AttrOper === undefined && Einfo.AttrVal === undefined) {} else if (Einfo.AttrName !== undefined && Einfo.AttrOper === undefined && Einfo.AttrVal === undefined && node.getAttribute && node.getAttribute(Einfo.AttrName) !== null) {
          isMatch = true
      } else if (Einfo.AttrName !== undefined && Einfo.AttrOper !== undefined && Einfo.AttrVal !== undefined && node.getAttribute) {
          switch (Einfo.AttrOper) {
          case '=':
              isMatch = node.getAttribute(Einfo.AttrName) === Einfo.AttrVal;
              break;
          case '~=':
              isMatch = !!(node.getAttribute(Einfo.AttrName) && node.getAttribute(Einfo.AttrName).match(new RegExp('(?:^|\\s+)' + Einfo.AttrVal + '(?:$|\\s+)', 'i')));
              break;
          case '^=':
              isMatch = !!(node.getAttribute(Einfo.AttrName) && node.getAttribute(Einfo.AttrName).match(new RegExp('^' + Einfo.AttrVal, 'i')));
              break;
          case '$=':
              isMatch = !!(node.getAttribute(Einfo.AttrName) && node.getAttribute(Einfo.AttrName).match(new RegExp(Einfo.AttrVal + '$', 'i')));
              break;
          case '*=':
              isMatch = !!(node.getAttribute(Einfo.AttrName) && node.getAttribute(Einfo.AttrName).match(new RegExp(Einfo.AttrVal, 'i')));
              break;
          case '|=':
              isMatch = !!(node.getAttribute(Einfo.AttrName) && node.getAttribute(Einfo.AttrName).match(new RegExp('(?:^|\\-)' + Einfo.AttrVal + '(?:$|\\-)', 'i')));
              break
          }
      }
      return isMatch
    }
    function isMatchFakeClass(Einfo, node, isMatch) {
      if (Einfo.FakeClass === undefined) {} else {
          switch (Einfo.FakeClass) {
          case 'empty':
              isMatch = node.innerHTML.replace(RegTrim, '').length == 0;
              break;
          case 'checked':
              if (node.nodeName.match(/(?:INPUT|TEXTAREA|BUTTON|SELECT|OPTION)/i)) isMatch = !!node.checked;
              break;
          case 'enabled':
              if (node.nodeName.match(/(?:INPUT|TEXTAREA|BUTTON|SELECT|OPTION)/i)) isMatch = !!node.disabled;
              break;
          case 'disabled':
              if (node.nodeName.match(/(?:INPUT|TEXTAREA|BUTTON|SELECT|OPTION)/i)) isMatch = !!node.disabled;
              break;
          case 'target':
              var hash = location.hash.replace('#', '');
              isMatch = hash === node.id || (node.name && hash === node.name);
              break
          }
      }
      return isMatch
    }
    window['XYQuery'] = XYQuery;
}(window, document);
