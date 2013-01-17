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
        function BaseCell(record) {
            this.record = record;
        }
        BaseCell.prototype.fillElAttrs = function (el) {
            var classes = this.record.classes;
            for(var i = 0, l = classes.length; i < l; i++) {
                el.className += " " + classes[i];
            }
            if(this.record.id) {
                el.id = this.record.id;
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
        BaseCell.prototype.destroy = function () {
            this.el.parentNode.removeChild(this.el);
        };
        BaseCell.prototype.domFromString = function (s) {
            return Utils.DomFromString(s);
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
        function App(board, modules) {
            this.board = board;
            this.modules = modules;
            window['application'] = this;
            this.topMost = new ViewPort({
                cons: '',
                id: '',
                classes: []
            });
            this.screens = {
            };
            for(var cons in board) {
                this.screens[cons] = this.instantiate(cons);
            }
        }
        App.prototype.getCellClass = function (record) {
            var klass = null;
            for(var i = 0, l = this.modules.length; i < l; i++) {
                if(this.modules[i][record.cons]) {
                    klass = this.modules[i][record.cons];
                    break;
                }
            }
            if(klass == null) {
                console.log('cant find class for: ' + record.cons);
            }
            return klass;
        };
        App.prototype.instantiate = function (record) {
            var record = this.getCellRecord(record);
            var klass = this.getCellClass(record);
            return new klass(record);
        };
        App.prototype.resolve = function (selector) {
            var screen = selector(this.screens);
            var cons = screen.record.cons;
            this.topMost.append(screen);
            this.resolveCells(this.board[cons], screen);
        };
        App.prototype.resolveCells = function (board, parent) {
            for(var recordString in board) {
                var cell = this.instantiate(recordString);
                parent.append(cell);
                this.resolveCells(board[recordString], cell);
            }
        };
        App.prototype.getCellRecord = function (cellString) {
            var klasses = cellString.split('.');
            var cons = klasses[0].split('#')[0];
            var id = '';
            var classes = [];
            for(var c = 0, l = klasses.length; c < l; c++) {
                var splitted = klasses[c].split('#');
                classes.push(splitted[0]);
                if(splitted.length > 0) {
                    id = splitted[1];
                }
            }
            return {
                cons: cons,
                classes: classes,
                id: id
            };
        };
        return App;
    })();
    exports.App = App;    
})

