var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
define(["require", "exports", "chess/interfaces", "chess/transition"], function(require, exports, __interfaces__, __transition__) {
    var interfaces = __interfaces__;

    var transition = __transition__;

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
        return Utils;
    })();
    exports.Utils = Utils;    
    var BaseCell = (function () {
        function BaseCell(record) {
            this.record = record;
        }
        BaseCell.prototype.getBox = function () {
            return $(this.el).offset();
        };
        BaseCell.prototype.fillElAttrs = function () {
            var el = this.el;
            $(el).removeAttr('class');
            $(el).removeAttr('style');
            var classes = this.record.classes;
            for(var i = 0, l = classes.length; i < l; i++) {
                if(i != 0) {
                    el.className += " ";
                }
                el.className += classes[i];
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
                this.fillElAttrs();
            }
        };
        BaseCell.prototype.append = function (view) {
            this.prepareEl();
            var ne = view.render();
            this.el.appendChild(ne);
            view.parent = this;
        };
        BaseCell.prototype.render = function () {
            $(this.el).remove();
            this.el = null;
            this.prepareEl();
            return this.el;
        };
        BaseCell.prototype.destroy = function () {
            $(this.el).remove();
        };
        BaseCell.prototype.domFromString = function (s) {
            return Utils.DomFromString(s);
        };
        return BaseCell;
    })();
    exports.BaseCell = BaseCell;    
    var BaseScreen = (function (_super) {
        __extends(BaseScreen, _super);
        function BaseScreen() {
            _super.apply(this, arguments);

        }
        BaseScreen.prototype.beforeSelfReplace = function (other) {
        };
        BaseScreen.prototype.beforeSelfApear = function (other) {
        };
        BaseScreen.prototype.afterSelfReplace = function (other) {
        };
        BaseScreen.prototype.afterSelfApear = function (other) {
        };
        BaseScreen.prototype.replaceBy = function (other) {
            console.log('eplace');
        };
        return BaseScreen;
    })(BaseCell);
    exports.BaseScreen = BaseScreen;    
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
            this.viewport = new ViewPort({
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
                return BaseCell;
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
            this.viewport.append(screen);
            this.resolveCells(this.board[cons], screen);
            this.currentScreen = screen;
        };
        App.prototype.transit = function (selector) {
            Utils.destroyFlyWeight();
            var oldScreen = this.currentScreen;
            var me = this;
            var tr = new transition.Transition(me, selector, function () {
                oldScreen.destroy();
                me.currentScreen.fillElAttrs();
                me.viewport.fillElAttrs();
            }, function () {
            });
            return tr;
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

