define(["require", "exports"], function(require, exports) {
    
    function makeScrollable(me) {
        $(me.el).on('scroll', function (some) {
            scroll(me);
        });
    }
    function scroll(me) {
        if(!me.scrollRequired()) {
            return;
        }
        var first = me.getFirstItemBox();
        var initial = me.getInitialBox();
        var passed = (initial.top - first.top) / first.height;
        var limit = passed % me.pageSize;
        if(limit > me.scrollAfterNo) {
            me.loadNextPage();
        }
    }
})
