define(["require", "exports", "./interfaces"], function(require, exports, __interfaces__) {
    var interfaces = __interfaces__;

    var Transition = (function () {
        function Transition(app, selector, callbacks) {
            this.app = app;
            this.selector = selector;
            this.classDelay = 200;
            this.cssDelay = 600;
            this.going = app.currentScreen;
            this.coming = selector(app.screens);
            this.success = callbacks.success;
            this.fail = callbacks.fail;
            this.parentBox = this.going.parent.getBox();
        }
        Transition.prototype.pausecomp = function (millis) {
            var date = new Date();
            var curDate = null;
            do {
                curDate = new Date();
            }while(curDate - date < millis);
        };
        Transition.prototype.renderNewScreen = function () {
            this.app.resolve(this.selector);
        };
        Transition.prototype.union = function () {
            this.renderNewScreen();
            this.success();
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
            }, this.classDelay / 2);
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
                        me.releasePosition();
                        me.success();
                    }, 250);
                }, 250);
            }, this.classDelay);
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
            }).hide();
            $(me.coming.el).addClass('fade');
            $(me.going.el).addClass('fade');
            setTimeout(function () {
                $(me.going.el).css({
                    opacity: '0.0'
                });
            }, this.classDelay);
            setTimeout(function () {
                $(me.coming.el).css({
                    opacity: '1.0',
                    display: 'block'
                });
                setTimeout(function () {
                    me.releasePosition();
                    me.success();
                }, me.cssDelay);
            }, me.cssDelay);
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
                    me.releasePosition();
                    me.success();
                }, 400);
            }, this.classDelay);
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
                    me.releasePosition();
                    me.resetParent();
                    me.success();
                }, 400);
            }, this.classDelay);
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
        Transition.prototype.setTranslate = function (el, x, y, z) {
            $(el).css({
                '-webkit-transition': '-webkit-transform 0.3s ease-in',
                '-moz-transition': '-webkit-transform 0.3s ease-in',
                '-o-transition': '-webkit-transform 0.3s ease-in',
                'transition': '-webkit-transform 0.3s ease-in',
                '-webkit-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-moz-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-ms-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-o-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                'transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)'
            });
        };
        Transition.prototype.removeTranslate = function (el) {
            $(el).css({
                '-webkit-transition': null,
                '-moz-transition': null,
                '-o-transition': null,
                'transition': null,
                '-webkit-transform': null,
                '-moz-transform': null,
                '-ms-transform': null,
                '-o-transform': null,
                'transform': null,
                'width': null,
                'height': null
            });
        };
        Transition.prototype.slideLeft = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.going.getBox();
            $(me.coming.parent.el).css('width', itemBox.width * 2 + 'px');
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'right'
            });
            $(me.going.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            me.setTranslate(me.going.parent.el, 0 - itemBox.width, 0, 0);
            setTimeout(function () {
                var bx = me.coming.getBox();
                $(me.going.el).css({
                    'width': '0px'
                });
                me.removeTranslate(me.coming.parent.el);
                $(me.coming.parent.el).css({
                    'width': null,
                    'height': null
                });
                me.success();
            }, 1000);
        };
        Transition.prototype.slideRight = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.going.getBox();
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
            }, this.classDelay);
            setTimeout(function () {
                me.resetParent();
                me.success();
            }, this.cssDelay);
        };
        Transition.prototype.slideUp = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = me.fixPosition(me.going);
            $(me.coming.parent.el).css('height', itemBox.height * 2 + 'px');
            $(me.going.el).addClass('slideUp');
            setTimeout(function () {
                $(me.going.el).css({
                    'margin-top': 0 - itemBox.height + 'px'
                });
            }, this.classDelay);
            setTimeout(function () {
                me.resetParent();
                me.success();
            }, this.cssDelay);
        };
        Transition.prototype.slideDown = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = this.fixPosition(this.going);
            this.fixPosition(this.coming);
            $(me.coming.parent.el).css('height', itemBox.height * 2 + 'px');
            $(me.going.el).before($(me.coming.el));
            $(me.coming.el).css({
                'margin-top': '-' + me.parentBox.height + 'px'
            });
            setTimeout(function () {
                $(me.coming.el).addClass('slideDown');
            }, this.classDelay / 2);
            setTimeout(function () {
                $(me.coming.el).css({
                    'margin-top': 0
                });
            }, this.classDelay);
            setTimeout(function () {
                me.resetParent();
                me.success();
            }, this.cssDelay);
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
        Transition.prototype.releasePosition = function () {
            $(this.coming.el).css({
                width: '',
                height: ''
            });
        };
        Transition.prototype.resetParent = function () {
            $(this.coming.parent.el).css({
                width: null,
                height: null
            });
        };
        return Transition;
    })();
    exports.Transition = Transition;    
})
