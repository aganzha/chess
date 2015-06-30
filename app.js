define(["require", "exports", "./transition", "./pieces", "./utils"], function (require, exports, transition, pieces, utils) {
    var ChessApp = (function () {
        function ChessApp(viewport, board, modules, statics) {
            this.viewport = viewport;
            this.board = board;
            this.modules = modules;
            this.statics = statics;
            // а можно еще все экраны прямо здесь делать (спрятанными) о как!
            this.globals = {};
            this.transitQueue = [];
            modules.push(pieces);
            viewport.application = this;
            window['application'] = this;
            this.screens = {};
            // а зачем их сразу все делать а?
            // а в них можно че-нить хранить. в destroy убивавется element
            // и childrens, но инстанс скрина остается!
            for (var recordString in board) {
                var screen = this.instantiate(recordString, pieces.BaseScreen);
                screen.board = board[recordString];
                // ???
                //this.screens[recordString] =screen
                this.screens[screen.record.cons] = screen;
            }
        }
        ChessApp.prototype.getCellClass = function (record) {
            var klass = null;
            for (var i = 0, l = this.modules.length; i < l; i++) {
                if (this.modules[i][record.cons]) {
                    klass = this.modules[i][record.cons];
                    break;
                }
            }
            return klass;
        };
        ChessApp.prototype.instantiate = function (recordString, baseClass) {
            var record = this.getCellRecord(recordString, baseClass);
            var klass = this.getCellClass(record);
            // console.log(recordString, klass, '<<')
            if (klass == null) {
                klass = baseClass;
            }
            return new klass(record, this);
        };
        ChessApp.prototype.resolve = function (selector, is_static) {
            var _this = this;
            if (this.statics && !is_static) {
                this.statics.forEach(function (recordString) {
                    _this.resolve(recordString, true);
                });
            }
            var screen = this.screens[selector];
            if (!screen.resolved) {
                // screen may be allready resolved in case of Union transition or static
                // this.viewport.append(screen)
                this.resolveCells(screen, screen.board, screen, false);
                screen.resolved = true;
                if (is_static) {
                    // staics are not normally appended!
                    screen.beforeAppend();
                    screen.render();
                    $(this.viewport.el).after(screen.el);
                    screen.afterAppend();
                }
                else {
                    this.viewport.append(screen);
                }
                screen.bubbleDown(function (cell) {
                    var base = cell;
                    base._safeAfterRender();
                });
            }
            // install z-index here man!
            this.currentScreen = screen;
        };
        ChessApp.prototype.getScreen = function (scr) {
            return this.screens[scr];
        };
        ChessApp.prototype.proceed = function (screen, transition) {
            this.transit(function (screens) {
                return screens[screen];
            }, function (tr) {
                tr[transition]();
            });
        };
        ChessApp.prototype.transit = function (selector, receiver) {
            this.transitQueue.push({ receiver: receiver, screen: selector(this.screens) });
            this._doTransit();
        };
        ChessApp.prototype._doTransit = function () {
            if (this.transitQueue.length == 0) {
                return;
            }
            if (this.transitLock) {
                return;
            }
            this.transitLock = true;
            var first = this.transitQueue[0];
            this.transitQueue = this.transitQueue.slice(1);
            utils.Utils.destroyFlyWeight(); //???
            var oldScreen = this.currentScreen;
            var newScreen = first.screen;
            if (newScreen == oldScreen) {
                var klass = this.getCellClass(newScreen.record);
                newScreen = new klass(JSON.parse(JSON.stringify(newScreen.record)), this);
                newScreen.args = oldScreen.args.map(function (arg) { return arg; });
                newScreen.board = oldScreen.board;
                this.screens[newScreen.record.cons] = newScreen;
            }
            var receiver = first.receiver;
            var selector = function () { return first.screen; };
            var me = this;
            oldScreen.beforeSelfReplace(newScreen, {
                success: function () {
                    // screen в отличие от Cell не создается каждый раз заново,
                    // поэтому нужно чистить все перед его появлеием.
                    // var base = <pieces.BaseCell>newScreen
                    // base._renderred = false
                    newScreen._renderred = false;
                    me.fire('transitCommenced', newScreen, oldScreen);
                    newScreen.beforeSelfApear(oldScreen, {
                        success: function () {
                            var tr = new transition
                                .Transition(me, newScreen, oldScreen, {
                                success: function () {
                                    oldScreen.afterSelfReplace(newScreen);
                                    me.currentScreen.fillElAttrs();
                                    newScreen.afterSelfApear(oldScreen);
                                    me.fire('transitCompleted', newScreen, oldScreen);
                                    me.transitLock = false;
                                    me._doTransit();
                                },
                                fail: function () {
                                    // rollback current screen?
                                    me.transitLock = false;
                                    me._doTransit();
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
        ChessApp.prototype.resolveCells = function (screen, board, parent, delayed) {
            // parent.beforeResolve()
            var _type = Object.prototype.toString.call(board);
            if (_type == "[object String]") {
                parent.updateEl(board);
                parent.afterResolve();
                return;
            }
            if (_type == "[object Array]") {
                parent.args = board.map(function (arg) { return arg; });
                parent.afterResolve();
                return;
            }
            for (var recordString in board) {
                var cell = this.instantiate(recordString, pieces.BaseCell);
                cell.screen = screen;
                cell.board = board[recordString];
                cell.delayed = this.isCellDelayed(recordString);
                // ячейка может быть с андескором, поэтому она "отложена"
                // но она также может быть отложена и без андескора, т.к.
                // она находитя в отложенном треде (ass:{_bass:{smass:{_kalabass ...
                // все, что ниже ass - отложено. но только ячейки с андескором получают атрибут delayed
                var di = delayed || cell.delayed;
                // append как видно происходит снизу вверх.
                // самые вложенные ячейки апендятся друг в друга и вся эта куча
                // добавляется в дом, только после последнего аппенда (в сам скрин)
                this.resolveCells(screen, board[recordString], cell, di);
                if (di) {
                    parent.appendDelayed(cell);
                }
                else {
                    parent.append(cell);
                }
            }
            parent.afterResolve();
        };
        ChessApp.prototype.checkUnderscore = function (klass) {
            if (klass[0] == '_') {
                klass = klass.substr(1);
            }
            return klass;
        };
        ChessApp.prototype.getCellRecord = function (cellString, baseClass) {
            var klasses = cellString.split('.');
            var cons = klasses[0].split('#')[0];
            cons = this.checkUnderscore(cons);
            var id = '';
            var classes = [];
            if (baseClass == pieces.BaseCell) {
            }
            else if (baseClass == pieces.BaseScreen) {
                classes.push('BaseScreen');
            }
            for (var c = 0, l = klasses.length; c < l; c++) {
                var splitted = klasses[c].split('#');
                var cl = this.checkUnderscore(splitted[0]);
                classes.push(cl);
                if (splitted.length > 0) {
                    id = splitted[1];
                }
            }
            return { cons: cons, classes: classes, id: id };
        };
        ChessApp.prototype.on = function (event, arg) {
            $(this.viewport.el).on(event, arg);
        };
        ChessApp.prototype.off = function (event, arg) {
            if (arg) {
                $(this.viewport.el).off(event, arg);
            }
            else {
                $(this.viewport.el).off(event);
            }
            return this;
        };
        ChessApp.prototype.fire = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            $(this.viewport.el).trigger(event, args);
        };
        return ChessApp;
    })();
    exports.ChessApp = ChessApp;
});
