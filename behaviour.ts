import interfaces = module("chess/interfaces")
declare var $;

function makeScrollable(me:interfaces.Scrollable){
    $(me.el).on('scroll',function(some){scroll(me)})
}

function scroll(me:interfaces.Scrollable){
    if(!me.scrollRequired()){
	return
    }
    var first = me.getFirstItemBox()
    var initial = me.getInitialBox()
    var passed = (initial.top - first.top)/first.height
    var limit = passed % me.pageSize
    if(limit>me.scrollAfterNo){
	me.loadNextPage()
    }
}    

