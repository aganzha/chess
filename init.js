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
        function BaseCell(classes, id) {
            this.classes = classes;
            this.id = id;
        }
        BaseCell.prototype.fillElAttrs = function (el) {
            for(var i = 0, l = this.classes.length; i < l; i++) {
                el.className += " " + this.classes[i];
            }
            if(this.id) {
                el.id = this.id;
            }
        };
        BaseCell.prototype.createEl = function () {
            var div = document.createElement('div');
            return div;
        };
        BaseCell.prototype.prepareEl = function () {
            if(!this.el) {
                this.el = this.createEl();
                this.fillElAttrs(this.el);
            }
        };
        BaseCell.prototype.append = function (view) {
            this.prepareEl();
            this.el.appendChild(view.render());
            view.parent = this;
        };
        BaseCell.prototype.render = function () {
            this.prepareEl();
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
        ViewPort.prototype.createEl = function () {
            return document.getElementsByTagName('body')[0];
        };
        return ViewPort;
    })(BaseCell);    
    var App = (function () {
        function App(board, pieces) {
            var topMost = new ViewPort([], '');
            this.resolveCells(board, pieces, topMost);
        }
        App.prototype.resolveCells = function (board, pieces, parent) {
            for(var key in board) {
                var klasses = key.split('.');
                var cons = klasses[0].split('#')[0];
                if(!pieces[cons]) {
                    continue;
                }
                var id = '';
                var classes = [];
                for(var c = 0, l = klasses.length; c < l; c++) {
                    var splitted = klasses[c].split('#');
                    classes.push(splitted[0]);
                    if(splitted.length > 0) {
                        id = splitted[1];
                    }
                }
                var cell = new pieces[cons](classes, id);
                parent.append(cell);
                this.resolveCells(board[key], pieces, cell);
            }
        };
        return App;
    })();
    exports.App = App;    
})

