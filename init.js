var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
define(["require", "exports", "chess/interfaces"], function(require, exports, __interfaces__) {
    var interfaces = __interfaces__;

    var Utils = (function () {
        function Utils() { }
        Utils.flyWeightId = "_chessFlyWeightId";
        Utils.makeFlyWeight = function makeFlyWeight() {
            var di = document.createElement('div');
            di.style['display'] = 'none';
            di.id = Utils.flyWeightId;
            document.getElementsByTagName('body')[0].appendChild(di);
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
        return Utils;
    })();
    exports.Utils = Utils;    
    var BaseCell = (function () {
        function BaseCell() { }
        BaseCell.prototype.makeClassName = function () {
            var funcNameRegex = /function (.{1,})\(/;
            var func = (this).constructor.toString();
            var results = (funcNameRegex).exec(func);
            return (results && results.length > 1) ? results[1] : "";
        };
        BaseCell.prototype.fillElAttrs = function (el) {
            el.className = this.makeClassName();
            if(this.classes) {
                for(var i = 0, l = this.classes.length; i < l; i++) {
                    el.className += " " + this.classes[i];
                }
            }
        };
        BaseCell.prototype.makeEl = function () {
            var div = document.createElement('div');
            this.fillElAttrs(div);
            return div;
        };
        BaseCell.prototype.append = function (view) {
            if(!this.el) {
                this.el = this.makeEl();
            }
            this.el.appendChild(view.render());
            view.parent = this;
        };
        BaseCell.prototype.render = function () {
            if(!this.el) {
                this.el = this.makeEl();
            }
            return this.el;
        };
        return BaseCell;
    })();
    exports.BaseCell = BaseCell;    
    var ViewPort = (function (_super) {
        __extends(ViewPort, _super);
        function ViewPort() {
            _super.apply(this, arguments);

        }
        ViewPort.prototype.makeEl = function () {
            return document.getElementsByTagName('body')[0];
        };
        return ViewPort;
    })(BaseCell);    
    var App = (function () {
        function App(board, pieces) {
            var topMost = new ViewPort();
            this.resolveCells(board, pieces, topMost);
        }
        App.prototype.resolveCells = function (board, pieces, parent) {
            for(var key in board) {
                var className = key.split('-')[0];
                if(!pieces[className]) {
                    console.log('no such class in pieces: ' + className);
                    continue;
                }
                var cell = new pieces[className]();
                parent.append(cell);
                this.resolveCells(board[key], pieces, cell);
                break;
            }
        };
        return App;
    })();
    exports.App = App;    
})

