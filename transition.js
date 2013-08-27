define(["require", "exports"], function(require, exports) {
    

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
            if (leftOrTop == 'left') {
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
                var elCss = {};
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
            if (leftOrTop == 'left') {
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

        Transition.prototype.getTransformParams = function (x, y, z) {
            return {
                '-webkit-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-moz-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-ms-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                '-o-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)',
                'transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)'
            };
        };
        Transition.prototype.getTransitionParams = function () {
            return {
                '-webkit-transition': '-webkit-transform 0.3s ease-in',
                '-moz-transition': '-webkit-transform 0.3s ease-in',
                '-o-transition': '-webkit-transform 0.3s ease-in',
                'transition': '-webkit-transform 0.3s ease-in'
            };
        };
        Transition.prototype.joinParams = function (p1, p2) {
            var res = {};
            for (var k in p1) {
                res[k] = p1[k];
            }
            for (var k in p2) {
                res[k] = p2[k];
            }
            return res;
        };
        Transition.prototype.removeTransformParams = function () {
            return {
                '-webkit-transform': "",
                '-moz-transform': "",
                '-ms-transform': "",
                '-o-transform': "",
                'transform': ""
            };
        };
        Transition.prototype.removeTransitionParams = function () {
            return {
                '-webkit-transition': "",
                '-moz-transition': "",
                '-o-transition': "",
                'transition': ""
            };
        };

        Transition.prototype.removeIphoneFlash = function (el) {
            $(el).css({
                '-webkit-transition': '0ms cubic-bezier(0.1, 0.57, 0.1, 1)',
                'transition': '0ms cubic-bezier(0.1, 0.57, 0.1, 1)',
                '-webkit-transform': 'translate(0px, 0px) translateZ(0px)'
            });
        };
        Transition.prototype.slideLeft = function () {
            var me = this;
            me.renderNewScreen();

            var itemBox = me.fixPosition(me.going);
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
            var trParams = me.joinParams(me.getTransformParams(0 - itemBox.width, 0, 0), me.getTransitionParams());
            $(me.going.parent.el).css(trParams);
            me.cleanUpTransform();
        };
        Transition.prototype.slideRight = function () {
            var me = this;

            var itemBox = me.fixPosition(me.going);
            var trParams = me.joinParams(me.getTransformParams(0 - itemBox.width, 0, 0), {
                width: itemBox.width * 2
            });

            $(me.going.parent.el).css(trParams);
            $(me.going.el).css({
                width: itemBox.width,
                height: itemBox.height,
                float: 'right'
            });

            me.renderNewScreen();
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                height: itemBox.height + 'px',
                float: 'left'
            });
            $(me.going.el).before($(me.coming.el));

            setTimeout(function () {
                $(me.going.parent.el).css(me.getTransitionParams());
                trParams = me.joinParams(me.getTransformParams(0, 0, 0), {
                    width: itemBox.width * 2
                });
                $(me.going.parent.el).css(trParams);
                me.cleanUpTransform();
            }, 100);
        };
        Transition.prototype.cleanUpTransform = function () {
            var me = this;
            setTimeout(function () {
                var bx = me.coming.getBox();
                var trParams = me.joinParams(me.joinParams(me.removeTransitionParams(), me.removeTransformParams()), {
                    width: null,
                    height: null
                });
                $(me.coming.parent.el).css(trParams);
                $(me.coming.parent.el).css({
                    'width': "",
                    'height': "",
                    'min-height': "",
                    'min-width': ""
                });

                console.log('da!', me.coming.parent.el, trParams);
                me.success();
            }, 500);
        };

        Transition.prototype.slideUp = function () {
            var me = this;
            me.renderNewScreen();
            var itemBox = me.fixPosition(me.going);

            $(me.coming.parent.el).css('min-height', itemBox.height * 2 + 'px');
            var trParams = me.joinParams(me.getTransformParams(0, 0 - itemBox.height, 0), me.getTransitionParams());
            $(me.going.parent.el).css(trParams);
            me.cleanUpTransform();
        };

        Transition.prototype.slideDown = function () {
            var me = this;

            var itemBox = this.fixPosition(me.going);
            me.renderNewScreen();
            this.fixPosition(me.coming);
            var trParams = me.joinParams(me.getTransformParams(0, 0 - itemBox.height, 0), {
                'min-height': itemBox.height * 2
            });
            $(me.going.el).before($(me.coming.el));
            $(me.going.parent.el).css(trParams);
            var me = this;
            setTimeout(function () {
                $(me.going.parent.el).css(me.getTransitionParams());
                var trParams = me.getTransformParams(0, 0, 0);
                $(me.going.parent.el).css(trParams);
                me.cleanUpTransform();
            }, 100);
        };

        Transition.prototype.fixBackground = function (cell, css) {
            var background = $(cell.el).css('background-color') || $(cell.el).css('background-image');
            if (!background || background == 'rgba(0, 0, 0, 0)') {
                css['background-color'] = 'white';
            }
        };

        Transition.prototype.fixPosition = function (cell) {
            var box = cell.parent.getBox();
            $(cell.el).css({
                width: box.width,
                height: box.height,
                overflow: 'hidden'
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
            $(this.coming.parent.el).css({ width: null, height: null });
        };
        return Transition;
    })();
    exports.Transition = Transition;
});
