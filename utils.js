define(["require", "exports"], function(require, exports) {
    
    var Utils = (function () {
        function Utils() { }
        Utils.flyWeightId = "_chessFlyWeightId";
        Utils.makeFlyWeight = function makeFlyWeight() {
            var di = document.createElement('div');
            di.style['display'] = 'none';
            di.id = Utils.flyWeightId;
            document.getElementsByTagName('body')[0].appendChild(di);
            return di;
        };
        Utils.destroyFlyWeight = function destroyFlyWeight() {
            $('#' + Utils.flyWeightId).remove();
        };
        Utils.DomFromString = function DomFromString(s) {
            var flw = document.getElementById(Utils.flyWeightId);
            if(!flw) {
                Utils.makeFlyWeight();
                return Utils.DomFromString(s);
            }
            flw.innerHTML = s;
            return flw.children[0];
        };
        Utils.template = function template(templateId, replacements) {
            var txt = document.getElementById(templateId).innerHTML;
            for(var key in replacements) {
                txt = txt.replace(key, replacements[key]);
            }
            return txt;
        };
        return Utils;
    })();
    exports.Utils = Utils;    
    function walkDown(parent, collected, cons, className, id) {
        for(var i = 0, l = parent.children.length; i < l; i++) {
            var cell = parent.children[i];
            var rec = cell.record;
            var pushed = false;
            if(!pushed && cons && rec.cons == cons) {
                collected.push(cell);
                pushed = true;
            }
            if(!pushed && className) {
                for(var j = 0, m = rec.classes.length; j < m; j++) {
                    if(rec.classes[j] == className) {
                        pushed = true;
                        collected.push(cell);
                        break;
                    }
                }
            }
            if(!pushed && id && rec.id == id) {
                collected.push(cell);
                pushed = true;
            }
            walkDown(cell, collected, cons, className, id);
        }
    }
    function getPieces(cons, className, id) {
        var answer = [];
        walkDown(window['application'].currentScreen, answer, cons, className, id);
        return answer;
    }
    exports.getPieces = getPieces;
    function bind(func, context) {
        var nativeBind = Function.prototype.bind;
        var slice = Array.prototype.slice;
        if(func.bind === nativeBind && nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    }
    exports.bind = bind;
    ;
})
