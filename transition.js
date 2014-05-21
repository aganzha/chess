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
                        me.releasePosition(me.coming);
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
            var params = me.joinParams(me.getTransformParams(0, 0, 0), me.getTransitionParamsFor('opacity'));
            var zero = {
                'opacity': '0.0'
            };
            $(me.going.el).css(params).css(zero);
            setTimeout(function () {
                $(me.going.el).hide();
                $(me.coming.el).css({
                    display: 'block',
                    opacity: '1.0'
                });
                setTimeout(function () {
                    me.cleanUpTransform(function () {
                    });
                }, 1000);
            }, 300);
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
                    me.releasePosition(me.coming);
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
        Transition.prototype.getTransitionParamsFor = function (property) {
            return {
                '-webkit-transition': property + ' 0.3s ease-in',
                '-moz-transition': property + ' 0.3s ease-in',
                '-o-transition': property + ' 0.3s ease-in',
                'transition': property + ' 0.3s ease-in'
            };
        };
        Transition.prototype.joinParams = function (p1, p2) {
            var res = {
            };
            for(var k in p1) {
                res[k] = p1[k];
            }
            for(var k in p2) {
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
            $(me.coming.parent.el).css('width', itemBox.width * 3 + 'px');
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                float: 'left'
            });
            $(me.going.el).css({
                width: itemBox.width + 'px',
                float: 'left'
            });
            var trParams = me.joinParams(me.getTransformParams(0 - itemBox.width, 0, 0), me.getTransitionParamsFor('-webkit-transform'));
            $(me.going.parent.el).css(trParams);
            me.cleanUpTransform(function () {
            });
        };
        Transition.prototype.slideRight = function () {
            var me = this;
            var itemBox = me.fixPosition(me.going);
            var trParams = me.joinParams(me.getTransformParams(0 - itemBox.width, 0, 0), {
                width: itemBox.width * 3 + 'px'
            });
            $(me.going.parent.el).css(trParams);
            $(me.going.el).css({
                width: itemBox.width + 'px',
                float: 'left'
            });
            me.renderNewScreen();
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                float: 'left'
            });
            $(me.going.el).before($(me.coming.el));
            setTimeout(function () {
                $(me.going.parent.el).css(me.getTransitionParamsFor('-webkit-transform'));
                trParams = me.getTransformParams(0, 0, 0);
                $(me.going.parent.el).css(trParams);
                me.cleanUpTransform(function () {
                });
            }, 100);
        };
        Transition.prototype.cleanUpTransform = function (hook) {
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
                hook();
                me.success();
            }, 500);
        };
        Transition.prototype.slideUp = function () {
            var me = this;
            var itemBox = me.fixPosition(me.going);
            me.renderNewScreen();
            $(me.coming.parent.el).css('min-height', itemBox.height * 2 + 'px');
            var trParams = me.joinParams(me.getTransformParams(0, 0 - itemBox.height, 0), me.getTransitionParamsFor('-webkit-transform'));
            $(me.going.parent.el).css(trParams);
            me.cleanUpTransform(function () {
            });
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
                $(me.going.parent.el).css(me.getTransitionParamsFor('-webkit-transform'));
                var trParams = me.getTransformParams(0, 0, 0);
                $(me.going.parent.el).css(trParams);
                me.cleanUpTransform(function () {
                });
            }, 0);
        };
        Transition.prototype.fixBackground = function (cell, css) {
            var background = $(cell.el).css('background-color') || $(cell.el).css('background-image');
            if(!background || background == 'rgba(0, 0, 0, 0)') {
                css['background-color'] = 'white';
            }
        };
        Transition.prototype.fixPosition = function (cell) {
            var minheight = 2400;
            var minwidth = 2400;
            var tag = cell.parent.el.tagName.toLowerCase();
            if(tag == 'body') {
                if(window.innerWidth < minwidth) {
                    minwidth = window.innerWidth;
                }
                if(window.outerWidth < minwidth) {
                    minwidth = window.outerWidth;
                }
                if(window.innerWidth < minheight) {
                    minwidth = window.innerWidth;
                }
                if(window.outerHeight < minheight) {
                    minheight = window.outerHeight;
                }
            } else {
                bx = cell.parent.getBox();
                minheight = bx.height;
                minwidth = bx.width;
            }
            $(cell.el).css({
                width: minwidth,
                'min-width': minwidth,
                'max-width': minwidth,
                height: minheight,
                'min-height': minheight,
                'max-height': minheight,
                overflow: 'hidden'
            });
            var bx = cell.getBox();
            return bx;
        };
        Transition.prototype.releasePosition = function (cell) {
            $(cell.el).css({
                'width': '',
                'min-width': '',
                'max-width': '',
                'height': '',
                'min-height': '',
                'max-height': '',
                overflow: ''
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
