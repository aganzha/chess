define(["require", "exports", "chess/interfaces"], function(require, exports, __interfaces__) {
    var interfaces = __interfaces__;

    var Transition = (function () {
        function Transition(app, selector, success, error) {
            this.app = app;
            this.selector = selector;
            this.success = success;
            this.error = error;
            this.slideDelay = 400;
            this.going = app.currentScreen;
            this.coming = selector(app.screens);
        }
        Transition.prototype.renderNewScreen = function () {
            this.app.resolve(this.selector);
        };
        Transition.prototype.redraw = function () {
            $(this.going.el).hide();
            this.renderNewScreen();
            this.success();
        };
        Transition.prototype.pop = function () {
            var me = this;
            this.fixPosition(this.going);
            this.renderNewScreen();
            var itemBox = this.fixPosition(me.coming);
            $(me.coming.el).css({
                position: 'absolute',
                opacity: '0',
                width: '0px',
                height: '0px',
                'margin-top': itemBox.height / 2 + 'px',
                'margin-left': itemBox.width / 2 + 'px'
            });
            $(this.going.el).css('position', 'absolute');
            setTimeout(function () {
                me.going.el.className += ' pop';
                me.coming.el.className += ' pop';
            }, 50);
            setTimeout(function () {
                $(me.going.el).css({
                    width: '0px',
                    height: '0px',
                    'margin-top': itemBox.height / 2 + 'px',
                    'margin-left': itemBox.width / 2 + 'px'
                });
                setTimeout(function () {
                    $(me.coming.el).css({
                        width: itemBox.width + 'px',
                        height: itemBox.height + 'px',
                        opacity: '1.0',
                        'margin-top': '0px',
                        'margin-left': '0px'
                    });
                    setTimeout(function () {
                        me.releasePosition(me.coming);
                        me.success();
                    }, 250);
                }, 250);
            }, 100);
        };
        Transition.prototype.fade = function () {
            var me = this;
            me.fixPosition(me.going);
            $(me.going.el).css({
                position: 'absolute',
                opacity: '1.0'
            });
            me.renderNewScreen();
            me.fixPosition(me.coming);
            $(me.coming.el).css({
                position: 'absolute',
                opacity: '0.0'
            });
            $(me.going.el).addClass('fade');
            $(me.coming.el).addClass('fade');
            var me = this;
            setTimeout(function () {
                $(me.going.el).css({
                    opacity: '0.0'
                });
                $(me.coming.el).css({
                    opacity: '1.0'
                });
                setTimeout(function () {
                    me.releasePosition(me.coming);
                    me.success();
                }, 300);
            }, 100);
        };
        Transition.prototype.cover = function (leftOrTop, positive) {
            var widthOrHeight = 'height';
            if(leftOrTop == 'left') {
                widthOrHeight = 'width';
            }
            var me = this;
            var itemBox = this.fixPosition(this.going);
            $(me.going.el).css({
                position: 'absolute',
                'z-index': 9
            });
            me.renderNewScreen();
            var targetCss = {
                position: 'absolute',
                'z-index': 999
            };
            this.fixBackground(this.coming, targetCss);
            this.fixPosition(me.coming);
            targetCss[leftOrTop] = positive ? itemBox[widthOrHeight] : 0 - itemBox[widthOrHeight] + 'px';
            $(me.coming.el).css(targetCss);
            var me = this;
            setTimeout(function () {
                $(me.coming.el).addClass('cover');
            }, 50);
            setTimeout(function () {
                var elCss = {
                };
                elCss[leftOrTop] = '0px';
                $(me.coming.el).css(elCss);
                setTimeout(function () {
                    me.releasePosition(me.coming);
                    me.success();
                }, 400);
            }, 100);
        };
        Transition.prototype.coverLeft = function () {
            this.cover('left', true);
        };
        Transition.prototype.coverRight = function () {
            this.cover('left', false);
        };
        Transition.prototype.coverUp = function () {
            this.cover('top', true);
        };
        Transition.prototype.coverDown = function () {
            this.cover('top', false);
        };
        Transition.prototype.reveal = function (leftOrTop, positive) {
            var me = this;
            var widthOrHeight = 'height';
            if(leftOrTop == 'left') {
                widthOrHeight = 'width';
            }
            var itemBox = this.fixPosition(this.going);
            $(me.going.el).css({
                position: 'absolute',
                'z-index': 999
            });
            me.renderNewScreen();
            var targetCss = {
                position: 'absolute',
                'z-index': 999
            };
            this.fixBackground(this.going, targetCss);
            $(this.going.el).css(targetCss);
            $(me.coming.el).css({
                position: 'absolute',
                'z-index': 9
            });
            this.fixPosition(me.coming);
            setTimeout(function () {
                me.going.el.className += ' reveal';
            }, 50);
            setTimeout(function () {
                targetCss[leftOrTop] = positive ? itemBox[widthOrHeight] + 'px' : 0 - itemBox[widthOrHeight] + 'px';
                $(me.going.el).css(targetCss);
                setTimeout(function () {
                    me.releasePosition(me.coming);
                    me.success();
                }, 400);
            }, 100);
        };
        Transition.prototype.revealLeft = function () {
            this.reveal('left', true);
        };
        Transition.prototype.revealRight = function () {
            this.reveal('left', false);
        };
        Transition.prototype.revealUp = function () {
            this.reveal('top', false);
        };
        Transition.prototype.revealDown = function () {
            this.reveal('top', true);
        };
        Transition.prototype.slideLeft = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.going.getBox();
            var old = me.coming.parent.getBox().width;
            if(old && !(old + '').match('px')) {
                old += 'px';
            }
            $(me.coming.parent.el).css('width', itemBox.width * 2 + 'px');
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            $(me.going.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            $(me.going.el).addClass('slideLeft');
            setTimeout(function () {
                $(me.going.el).css({
                    'margin-left': 0 - itemBox.width + 'px'
                });
            }, 100);
            setTimeout(function () {
                $(me.coming.parent.el).css('width', old);
                me.success();
            }, this.slideDelay);
        };
        Transition.prototype.slideRight = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.going.getBox();
            var old = me.coming.parent.getBox().width;
            if(old && !(old + '').match('px')) {
                old += 'px';
            }
            $(me.coming.parent.el).css('width', itemBox.width * 2 + 'px');
            $(me.coming.el).css({
                'margin-left': 0 - itemBox.width + 'px',
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            $(me.going.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            $(me.going.el).before($(me.coming.el));
            $(me.coming.el).addClass('slideRight');
            setTimeout(function () {
                $(me.coming.el).css({
                    'margin-left': '0px'
                });
            }, 100);
            setTimeout(function () {
                $(me.coming.parent.el).css('width', old);
                me.success();
            }, this.slideDelay);
        };
        Transition.prototype.slideUp = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = me.fixPosition(me.going);
            var old = $(me.going.parent.el).css('height');
            if(old && !(old + '').match('px')) {
                old += 'px';
            }
            $(me.going.el).addClass('slideUp');
            setTimeout(function () {
                $(me.going.el).css({
                    'margin-top': 0 - itemBox.height + 'px'
                });
            }, 100);
            setTimeout(function () {
                $(me.coming.parent.el).css('height', old);
                me.success();
            }, this.slideDelay);
        };
        Transition.prototype.slideDown = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.fixPosition(this.going);
            var old = $(me.going.parent.el).css('height');
            if(old && !(old + '').match('px')) {
                old += 'px';
            }
            var oldMargin = $(me.coming.el).css('margin-top');
            $(me.coming.el).css({
                'margin-top': 0 - itemBox.height + 'px'
            });
            $(me.going.el).before($(me.coming.el));
            $(me.coming.el).addClass('slideDown');
            setTimeout(function () {
                $(me.coming.el).css({
                    'margin-top': oldMargin
                });
            }, 100);
            setTimeout(function () {
                $(me.coming.parent.el).css('height', old);
                me.success();
            }, this.slideDelay);
        };
        Transition.prototype.fixBackground = function (cell, css) {
            var background = $(cell.el).css('background-color') || $(cell.el).css('background-image');
            if(!background || background == 'rgba(0, 0, 0, 0)') {
                css['background-color'] = 'white';
            }
        };
        Transition.prototype.fixPosition = function (cell) {
            var box = cell.parent.getBox();
            $(cell.el).css({
                width: box.width,
                height: box.height
            });
            return box;
        };
        Transition.prototype.releasePosition = function (cell) {
            var box = cell.getBox();
            $(cell.el).css({
                width: '',
                height: ''
            });
            return box;
        };
        return Transition;
    })();
    exports.Transition = Transition;    
})

