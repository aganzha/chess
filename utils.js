define(["require", "exports"], function(require, exports) {
    
    var Utils = (function () {
        function Utils() { }
        Utils.flyWeightId = "_chessFlyWeightId";
        Utils.makeFlyWeight = function makeFlyWeight() {
            var di = document.createElement('div');
            di.style['display'] = 'none';
            di.id = this.flyWeightId;
            document.getElementsByTagName('body')[0].appendChild(di);
            return di;
        };
        Utils.destroyFlyWeight = function destroyFlyWeight() {
            $('#' + this.flyWeightId).remove();
        };
        Utils.DomFromString = function DomFromString(s) {
            var flw = document.getElementById(this.flyWeightId);
            if(!flw) {
                this.makeFlyWeight();
                return this.DomFromString(s);
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
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    ;
    function guid() {
        return s4() + s4();
    }
    exports.guid = guid;
    exports.getMinSize = function () {
        var minsize = 1000000;
        var makeMinSize = function (compare) {
            if(compare && compare < minsize) {
                minsize = compare;
            }
        };
        makeMinSize(screen.width);
        makeMinSize(screen.height);
        makeMinSize(window.innerWidth);
        makeMinSize(window.innerHeight);
        makeMinSize(window.outerHeight);
        makeMinSize(window.outerWidth);
        return minsize;
    };
})
