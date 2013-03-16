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



export function makeDraggable(me:interfaces.Draggable){
    $(me.el).on('mousedown', function(e:MouseEvent){beginDrag(e, me)});
}
export function removeDraggable(me:interfaces.Draggable){
    $(me.el).off('mousedown');
}

function stopPropagation(e:Event){
    e.stopPropagation()
    e.preventDefault()
}
function beginDrag(e:MouseEvent, me:interfaces.Draggable){
    if (!me.onStartDrag(<HTMLElement>e.target))
	return;
    stopPropagation(e);

    var el = $(me.el)

    var x = parseInt(el.css('left'))-e.x
    if(!x){
	x = el[0].offsetLeft-e.x;
    }
    var y = parseInt(el.css('top'))-e.y
    if(!y){
	y = el[0].offsetTop-e.y;
    }
    if(!me.dX){
	me.dX = 0
    }
    if(!me.dY){
	me.dY = 0
    }
        
    var body = $('body')
    body.on('mousemove', function(e:MouseEvent){drag(e,me)});
    body.on('mouseup', function(e:MouseEvent){drop(e,me)});
    
    me.dX += x;
    me.dY += y;    

    el.css({
	position:'absolute',
	'z-index':'999',
	cursor:'move'
    })
}

function drag(e:MouseEvent, me:interfaces.Draggable){
    stopPropagation(e)
    var box = me.confirmDrag({left:e.x+me.dX,top:e.y+me.dY,width:null,height:null})
    $(me.el).css({left:box.left+'px',top:box.top+'px'})
    //$(me.el).css({left:e.x+me.dX+'px',top:e.y+me.dY+'px'})
    me.onDrag(box)
}
// TODO! move z-index to application level. make z-index manager
function drop(e:MouseEvent, me:interfaces.Draggable){
    stopPropagation(e)
    var body = $('body')
    body.off('mousemove')
    body.off('mouseup')
    // TODO! replace 9 and 999 in z-index by attributes in dragable!
    $(me.el).css({'z-index':9,cursor:'inherit'});
    me.onDrop();
}
