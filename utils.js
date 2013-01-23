define(["require", "exports"], function(require, exports) {
    
    var Utils = (function () {
        function Utils() { }
        Utils.flyWeightId = "_chessFlyWeightId";
        Utils.makeFlyWeight = function makeFlyWeight() {
            var di = document.createElement('div');
            di.style['display'] = 'none';
            di.id = Utils.flyWeightId;
            document.getElementsByTagName('body')[0].appendChild(di);
        }
        Utils.destroyFlyWeight = function destroyFlyWeight() {
            $('#' + Utils.flyWeightId).remove();
        }
        Utils.DomFromString = function DomFromString(s) {
            var flw = document.getElementById(Utils.flyWeightId);
            if(!flw) {
                Utils.makeFlyWeight();
                return Utils.DomFromString(s);
            }
            flw.innerHTML = s;
            return flw.children[0];
        }
        Utils.template = function template(templateId, replacements) {
            var txt = document.getElementById(templateId).innerHTML;
            for(var key in replacements) {
                txt = txt.replace(key, replacements[key]);
            }
            return txt;
        }
        Utils.walkDown = function walkDown(parent, collected, cons, className, id) {
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
                this.walkDown(cell, collected, cons, className, id);
            }
        }
        Utils.getPieces = function getPieces(cons, className, id) {
            var answer = [];
            this.walkDown(window['application'].currentScreen, answer, cons, className, id);
            return answer;
        }
        return Utils;
    })();
    exports.Utils = Utils;    
})

