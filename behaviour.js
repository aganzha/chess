define(["require", "exports"], function(require, exports) {
    
    function makeScrollable(me) {
        $(me.el).on('scroll', function (some) {
            scroll(me);
        });
    }
    exports.makeScrollable = makeScrollable;
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
    function makeCleanValuable(me) {
        console.log(me.getHolder());
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
})
