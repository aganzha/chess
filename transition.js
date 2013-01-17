define(["require", "exports"], function(require, exports) {
    
    var Transition = (function () {
        function Transition(going, coming, success, error) {
            this.going = going;
            this.coming = coming;
            this.success = success;
            this.error = error;
        }
        Transition.prototype.redraw = function () {
            try  {
                this.going.destroy();
                this.coming.render();
                this.success();
            } catch (x) {
                this.error();
            }
        };
        Transition.prototype.pop = function () {
            me.coming.render();
            var itemBox = this.going.getBox();
            $(me.coming.el).css({
                width: '0px',
                height: '0px',
                'margin-top': itemBox.height / 2 + 'px',
                'margin-left': itemBox.width / 2 + 'px',
                position: 'absolute'
            });
            var me = this;
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
                        'margin-top': '0px',
                        'margin-left': '0px'
                    });
                    me.success();
                }, 200);
            }, 100);
        };
        Transition.prototype.fade = function () {
            var me = this;
            me.coming.render();
            $(me.going.el).css({
                position: 'absolute',
                opacity: '1.0'
            });
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
                me.success();
            }, 100);
        };
        Transition.prototype.cover = function (widthOrHeight, leftOrTop, sign) {
            var me = this;
            var itemBox = this.going.getBox();
            var containerCss = {
            };
            containerCss[widthOrHeight] = itemBox[widthOrHeight] * 2 + 'px';
            $(this.going).el.css(containerCss);
            me.coming.render();
            $(me.going.el).css({
                position: 'absolute',
                'z-index': 9
            });
            var targetCss = {
                position: 'absolute',
                'z-index': 999
            };
            targetCss[leftOrTop] = sign(itemBox[widthOrHeight]) + 'px';
            $(me.coming.el).css(targetCss);
            var me = this;
            setTimeout(function () {
                $(me.coming.el).addClass('cover');
                setTimeout(function () {
                    var elCss = {
                    };
                    elCss[leftOrTop] = '0px';
                    $(me.coming.el).css(elCss);
                    me.success();
                }, 50);
            }, 50);
        };
        Transition.prototype.reveal = function (widthOrHeight, leftOrTop, sign) {
            var me = this;
            var itemBox = this.going.getBox();
            var containerCss = {
            };
            containerCss[widthOrHeight] = itemBox[widthOrHeight] * 2 + 'px';
            $(this.coming.el).css(containerCss);
            me.coming.render();
            $(me.going.el).css({
                position: 'absolute',
                'z-index': 999
            });
            $(me.coming.el).css({
                position: 'absolute',
                'z-index': 9
            });
            var me = this;
            setTimeout(function () {
                me.coming.el.className += ' reveal';
                setTimeout(function () {
                    var elCss = {
                    };
                    elCss[leftOrTop] = sign(itemBox[widthOrHeight]) + 'px';
                    $(me.going.el).css(elCss);
                    me.success();
                }, 50);
            }, 50);
        };
        Transition.prototype.slideLeft = function () {
            var me = this;
            me.coming.render();
            var itemBox = this.going.getBox();
            $(this.going.el).css({
                'width': itemBox.width * 2 + 'px'
            });
            $(me.going.el).css({
                'margin-left': 0 - itemBox.width + 'px'
            });
            $(me.going.el).addClass('slideLeft');
            me.success();
        };
        Transition.prototype.slideRight = function () {
            var me = this;
            var itemBox = this.going.getBox();
            $(me.going.el).css({
                'width': itemBox.width * 2 + 'px'
            });
            me.coming.render();
            $(me.coming.el).css({
                'margin-left': 0 - itemBox.width + 'px'
            });
            $(me.going.el).before($(me.coming.el));
            $(me.coming.el).addClass('slideRight');
            setTimeout(function () {
                $(me.coming.el).css({
                    'margin-left': '0px'
                });
                me.success();
            }, 100);
        };
        Transition.prototype.slideUp = function () {
            var me = this;
            me.coming.render();
            var itemBox = this.going.getBox();
            $(me.going.el).css({
                'height': itemBox.height * 2 + 'px'
            });
            $(me.going.el).css({
                'margin-top': 0 - itemBox.height + 'px'
            });
            $(me.going.el).addClass('slideUp');
            me.success();
        };
        Transition.prototype.slideDown = function () {
            var me = this;
            var itemBox = this.going.getBox();
            $(me.going.el).css({
                'height': itemBox.height * 2 + 'px'
            });
            me.coming.render();
            $(me.coming.el).css({
                'margin-top': 0 - itemBox.height + 'px'
            });
            $(me.going.el).before($(me.coming.el));
            $(me.coming.el).addClass('slideDown');
            setTimeout(function () {
                $(me.coming.el).css({
                    'margin-top': '0px'
                });
                me.success();
            }, 100);
        };
        return Transition;
    })();    
})

