define(["require", "exports", "./transition", "./pieces", "./utils"], function(require, exports, __transition__, __pieces__, __utils__) {
    
    var transition = __transition__;

    var pieces = __pieces__;

    var utils = __utils__;

    var ChessApp = (function () {
        function ChessApp(viewport, board, modules) {
            this.viewport = viewport;
            this.board = board;
            this.modules = modules;
            this.globals = {
            };
            modules.push(pieces);
            viewport.application = this;
            window['application'] = this;
            this.screens = {
            };
            for(var recordString in board) {
                var screen = this.instantiate(recordString, pieces.BaseScreen);
                screen.board = board[recordString];
                this.screens[recordString] = screen;
            }
        }
        ChessApp.prototype.getCellClass = function (record) {
            var klass = null;
            for(var i = 0, l = this.modules.length; i < l; i++) {
                if(this.modules[i][record.cons]) {
                    klass = this.modules[i][record.cons];
                    break;
                }
            }
            return klass;
        };
        ChessApp.prototype.instantiate = function (recordString, baseClass) {
            var record = this.getCellRecord(recordString);
            var klass = this.getCellClass(record);
            if(klass == null) {
                klass = baseClass;
            }
            return new klass(record, this);
        };
        ChessApp.prototype.resolve = function (selector) {
            var screen = selector(this.screens);
            if(!screen.resolved) {
                this.viewport.append(screen);
                this.resolveCells(screen.board, screen, false);
                screen.resolved = true;
                screen.bubbleDown(function (cell) {
                    cell.afterRender();
                });
            }
            this.currentScreen = screen;
        };
        ChessApp.prototype.transit = function (selector, receiver) {
            utils.Utils.destroyFlyWeight();
            var oldScreen = this.currentScreen;
            var newScreen = selector(this.screens);
            var me = this;
            oldScreen.beforeSelfReplace(newScreen, {
                success: function () {
                    newScreen.beforeSelfApear(oldScreen, {
                        success: function () {
                            var tr = new transition.Transition(me, selector, {
                                success: function () {
                                    oldScreen.afterSelfReplace(newScreen);
                                    me.currentScreen.fillElAttrs();
                                    newScreen.afterSelfApear(oldScreen);
                                },
                                fail: function () {
                                }
                            });
                            receiver(tr);
                        },
                        fail: function () {
                        }
                    });
                },
                fail: function () {
                }
            });
        };
        ChessApp.prototype.isCellDelayed = function (recordString) {
            return recordString[0] == '_';
        };
        ChessApp.prototype.resolveCells = function (board, parent, delayed) {
            var _type = Object.prototype.toString.call(board);
            if(_type == "[object String]") {
                parent.updateEl(board);
                parent.afterResolve();
                return;
            }
            if(_type == "[object Array]") {
                parent.args = board;
                return;
            }
            for(var recordString in board) {
                var cell = this.instantiate(recordString, pieces.BaseCell);
                cell.board = board[recordString];
                cell.delayed = this.isCellDelayed(recordString);
                var di = delayed || cell.delayed;
                this.resolveCells(board[recordString], cell, di);
                if(di) {
                    parent.appendDelayed(cell);
                } else {
                    parent.append(cell);
                }
            }
            parent.afterResolve();
        };
        ChessApp.prototype.checkUnderscore = function (klass) {
            if(klass[0] == '_') {
                klass = klass.substr(1);
            }
            return klass;
        };
        ChessApp.prototype.getCellRecord = function (cellString) {
            var klasses = cellString.split('.');
            var cons = klasses[0].split('#')[0];
            cons = this.checkUnderscore(cons);
            var id = '';
            var classes = [];
            for(var c = 0, l = klasses.length; c < l; c++) {
                var splitted = klasses[c].split('#');
                var cl = this.checkUnderscore(splitted[0]);
                classes.push(cl);
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
        ChessApp.prototype.on = function (event, arg) {
            $(this.viewport.el).on(event, arg);
        };
        ChessApp.prototype.off = function (event, arg) {
            if(arg) {
                $(this.viewport.el).off(event, arg);
            } else {
                $(this.viewport.el).off(event);
            }
        };
        ChessApp.prototype.fire = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            $(this.viewport.el).trigger(event, args);
        };
        return ChessApp;
    })();
    exports.ChessApp = ChessApp;    
})
