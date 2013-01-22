define(["require", "exports", "chess/transition", "chess/pieces", "chess/utils"], function(require, exports, __transition__, __pieces__, __utils__) {
    
    var transition = __transition__;

    var pieces = __pieces__;

    var utils = __utils__;

    var App = (function () {
        function App(board, modules) {
            this.board = board;
            this.modules = modules;
            window['application'] = this;
            this.viewport = new pieces.ViewPort({
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
                return pieces.BaseCell;
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
            utils.Utils.destroyFlyWeight();
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

