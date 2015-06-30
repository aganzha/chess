define(["require", "exports", "./utils"], function (require, exports, utils) {
    var Transition = (function () {
        function Transition(app, coming, going, callbacks) {
            this.app = app;
            this.coming = coming;
            this.going = going;
            this.classDelay = 200;
            this.cssDelay = 600;
            this.success = callbacks.success;
            this.fail = callbacks.fail;
            this.parentBox = this.going.parent.getBox();
        }
        Transition.prototype.renderNewScreen = function () {
            this.app.resolve(this.coming.record.cons);
        };
        Transition.prototype.union = function () {
            this.renderNewScreen();
            this.success();
        };
        Transition.prototype.redraw = function () {
            //this.fixPosition(this.going)
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
            // $(me.coming.el).addClass('fade');
            // $(me.going.el).addClass('fade');
            var params = me.joinParams(me.getTransformParams(0, 0, 0), me.getTransitionParamsFor('opacity'));
            var zero = { 'opacity': '0.0' };
            $(me.going.el).css(params).css(zero);
            setTimeout(function () {
                $(me.going.el).hide();
                $(me.coming.el).css({ display: 'block', opacity: '1.0' });
                setTimeout(function () {
                    me.cleanUpTransform(function () { });
                }, 1000);
            }, 300);
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
                    me.releasePosition(me.coming);
                    me.success();
                }, 400);
            }, this.classDelay);
        };
        Transition.prototype.coverLeft = function () {
            this.cover('left', true);
        };
        Transition.prototype.coverRight = function () {
            var me = this;
            var itemBox = me.fixPosition(me.going);
            $(me.going.parent.el).css({
                width: itemBox.width * 3 + 'px'
            });
            // $(me.going.el).css({
            //     width:itemBox.width+'px',
            // });
            me.renderNewScreen();
            $(me.coming.el).css({
                width: itemBox.width + 'px',
                position: 'absolute',
                'z-index': 99
            });
            $(me.going.el).before(me.coming.el);
            $(me.coming.el).css(me.getTransformParams(0 - itemBox.width, 0, 0));
            $(me.coming.el).css(me.getTransitionParamsFor('-webkit-transform'));
            setTimeout(function () {
                var trParams = me.getTransformParams(0, 0, 0);
                $(me.coming.el).css(trParams);
                me.cleanUpTransform(function () {
                    $(me.coming.el).css({ 'position': '', 'z-index': '' });
                    me.releasePosition(me.going);
                });
            }, 50);
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
            var me = this;
            $(me.going.el).css({
                'position': 'absolute',
                'z-index': 99
            });
            me.renderNewScreen();
            $(me.coming.el).css({
                'position': 'absolute',
                'z-index': 0
            });
            $(me.going.el).css(me.getTransformParams(0, 0, 0));
            $(me.going.el).css(me.getTransitionParamsFor('-webkit-transform'));
            var bx = me.going.getBox();
            setTimeout(function () {
                var trParams = me.getTransformParams(0 - bx.width, 0, 0);
                $(me.going.el).css(trParams);
                me.cleanUpTransform(function () {
                    $(me.coming.el).css({
                        'position': 'inherit',
                        'z-index': 'inherit'
                    });
                    $(me.going.el).css({
                        'position': 'inherit',
                        'z-index': 'inherit'
                    });
                });
            }, 50);
        };
        Transition.prototype.revealUp = function () {
            this.reveal('top', false);
        };
        Transition.prototype.revealDown = function () {
            this.reveal('top', true);
        };
        Transition.prototype.getTransformParams = function (x, y, z) {
            return utils.getTransformParams(x, y, z);
        };
        Transition.prototype.getTransitionParamsFor = function (property) {
            return utils.getTransitionParamsFor(property);
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
                'transition': "" //was null for zepto
            };
        };
        // this is a hack. somehow it worked, but it is not required now
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
            me.cleanUpTransform(function () { });
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
                me.cleanUpTransform(function () { });
            }, 100);
        };
        Transition.prototype.cleanUpTransform = function (hook) {
            var me = this;
            setTimeout(function () {
                var bx = me.coming.getBox();
                var trParams = me.joinParams(me.removeTransitionParams(), me.removeTransformParams());
                var clParams = {
                    'width': "",
                    'height': "",
                    'min-height': "",
                    'min-width': ""
                };
                $(me.coming.parent.el).css(me.joinParams(trParams, clParams));
                hook();
                me.success();
            }, 500);
        };
        Transition.prototype.slideUp = function () {
            var me = this;
            var itemBox = me.fixPosition(me.going);
            me.renderNewScreen();
            // me.fixPosition(me.coming)
            $(me.coming.parent.el).css('min-height', itemBox.height * 2 + 'px');
            var trParams = me.joinParams(me.getTransformParams(0, 0 - itemBox.height, 0), me.getTransitionParamsFor('-webkit-transform'));
            $(me.going.parent.el).css(trParams);
            // me.releasePosition(me.coming)
            me.cleanUpTransform(function () { });
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
                me.cleanUpTransform(function () { });
            }, 0);
        };
        Transition.prototype.fixBackground = function (cell, css) {
            var background = $(cell.el).css('background-color') ||
                $(cell.el).css('background-image');
            if (!background || background == 'rgba(0, 0, 0, 0)') {
                css['background-color'] = 'white';
            }
        };
        Transition.prototype.fixPosition = function (cell) {
            var bx = cell.parent.getBox();
            var minheight = bx.height;
            var minwidth = bx.width;
            $(cell.el).css({
                'width': minwidth,
                // 'min-width':minwidth,
                'max-width': minwidth,
                'height': minheight,
                // 'min-height':minheight,
                'max-height': minheight,
                'overflow': 'hidden'
            });
            var bx = cell.getBox();
            return bx;
        };
        Transition.prototype.releasePosition = function (cell) {
            $(cell.el).css({
                'width': '',
                // 'min-width':'',
                'max-width': '',
                'height': '',
                // 'min-height':'',
                'max-height': '',
                overflow: ''
            });
        };
        Transition.prototype.resetParent = function () {
            // $(this.coming.parent.el)
            //     .css({width:this.parentBox.width+'px',height:this.parentBox.height+'px'})
            $(this.coming.parent.el)
                .css({ width: null, height: null });
        };
        return Transition;
    })();
    exports.Transition = Transition;
});
