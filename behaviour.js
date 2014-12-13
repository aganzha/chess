define(["require", "exports", "./utils"], function(require, exports, __utils__) {
    
    var utils = __utils__;

    var minsize = utils.getMinSize();
    var currentScrollable = null;
    function makeScrollable(me) {
        me.currentPage = 0;
        if(me.unique && currentScrollable) {
            currentScrollable.off('scroll');
        }
        if(minsize < 600) {
            $(document).on('scroll', function (some) {
                scroll(me);
            });
            currentScrollable = $(document);
        } else {
            $(me.el).on('scroll', function (some) {
                scroll(me);
            });
            currentScrollable = $(me.el);
        }
    }
    exports.makeScrollable = makeScrollable;
    function scroll(me) {
        if(!me.scrollRequired()) {
            return;
        }
        var first = me.getFirstItemBox();
        var initial = me.getInitialBox();
        var fromTop = fromTop = initial.top - first.top;
        if(minsize < 600) {
            fromTop = window.pageYOffset;
        }
        var passed = fromTop / first.height;
        var limit = passed % me.pageSize;
        var currentPage = parseInt(passed / me.pageSize + '');
        if(limit > me.scrollAfterNo || ($(window).scrollTop() + $(window).height() == $(document).height())) {
            me.scrollAfterPassed();
            if(currentPage == me.currentPage) {
                me.currentPage += 1;
                me.loadNextPage();
            }
        }
    }
    function makeCleanValuable(me) {
        $(me.getHolder()).on('focus', function () {
            cleanDefaultValue(me);
        });
    }
    exports.makeCleanValuable = makeCleanValuable;
    function cleanDefaultValue(me) {
        if(me.getValue() == me.defaultValue) {
            me.setValue('');
        }
    }
    function makeDraggable(me) {
        $(me.el).on('mousedown', function (e) {
            beginDrag(e, me);
        });
    }
    exports.makeDraggable = makeDraggable;
    function removeDraggable(me) {
        $(me.el).off('mousedown');
    }
    exports.removeDraggable = removeDraggable;
    function stopPropagation(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function beginDrag(e, me) {
        if(!me.onStartDrag(e.target)) {
            return;
        }
        stopPropagation(e);
        var el = $(me.el);
        var x = parseInt(el.css('left')) - e.x;
        if(!x) {
            x = el[0].offsetLeft - e.x;
        }
        var y = parseInt(el.css('top')) - e.y;
        if(!y) {
            y = el[0].offsetTop - e.y;
        }
        if(!me.dX) {
            me.dX = 0;
        }
        if(!me.dY) {
            me.dY = 0;
        }
        var body = $('body');
        body.on('mousemove', function (e) {
            drag(e, me);
        });
        body.on('mouseup', function (e) {
            drop(e, me);
        });
        me.dX += x;
        me.dY += y;
        var box = me.confirmDrag({
            left: e.x + me.dX,
            top: e.y + me.dY,
            width: null,
            height: null
        });
        el.css({
            position: 'absolute',
            'z-index': '999',
            cursor: 'move',
            left: box.left + 'px',
            top: box.top + 'px'
        });
    }
    function drag(e, me) {
        stopPropagation(e);
        var box = me.confirmDrag({
            left: e.x + me.dX,
            top: e.y + me.dY,
            width: null,
            height: null
        });
        $(me.el).css({
            left: box.left + 'px',
            top: box.top + 'px'
        });
        me.onDrag(box);
    }
    function drop(e, me) {
        stopPropagation(e);
        var body = $('body');
        body.off('mousemove');
        body.off('mouseup');
        $(me.el).css({
            'z-index': 9,
            cursor: 'inherit'
        });
        me.onDrop({
            left: e.x + me.dX,
            top: e.y + me.dY,
            width: null,
            height: null
        });
    }
})
