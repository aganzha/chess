import interfaces = module("chess/interfaces")
declare var $;

export function makeScrollable(me:interfaces.Scrollable){
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
    //console.log(limit,passed,me.scrollAfterNo, first, firstItem)
    if(limit>me.scrollAfterNo){
	me.loadNextPage()
    }
}    


export function makeCleanValuable(me:interfaces.Valuable){
    $(me.getHolder()).on('focus',function(){cleanDefaultValue(me)})
}

function cleanDefaultValue(me:interfaces.Valuable){
    if(me.getValue()==me.defaultValue){
	me.setValue('')
    }
}