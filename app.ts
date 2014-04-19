import interfaces = module("./interfaces")
import transition = module("./transition")
import pieces = module("./pieces")
import utils = module("./utils")

declare var $;



export class ChessApp{
    screens:interfaces.ScreenMap;
    currentScreen:interfaces.Screen;
    globals:{};
    constructor(public viewport:pieces.ViewPort, public board:{},
		public modules:{}[]){
	// а можно еще все экраны прямо здесь делать (спрятанными) о как!
	this.globals = {}
	this.transitQueue = []
	modules.push(pieces)
	viewport.application = this
	window['application'] =this
	this.screens = <interfaces.ScreenMap>{}
	// а зачем их сразу все делать а?
	// а в них можно че-нить хранить. в destroy убивавется element
	// и childrens, но инстанс скрина остается!
	for(var recordString in board){
	    var screen = this.instantiate(recordString, pieces.BaseScreen)
	    screen.board = board[recordString]
	    this.screens[recordString] =screen
	    // this.screens[screen.record.cons] =screen
	}
    }
    getCellClass(record:interfaces.CellRecord){
	var klass = null
	for(var i=0,l=this.modules.length;i<l;i++){
	    if(this.modules[i][record.cons]){
		klass = this.modules[i][record.cons]
		break
	    }
	}
	return klass
    }
    instantiate(recordString:string, baseClass:any){
	var record = this.getCellRecord(recordString)
	var klass = this.getCellClass(record)
	if(klass==null){
	    klass=baseClass
	}
	return new klass(record, this)
    }
    resolve(selector:interfaces.ScreenSelector){
	var screen = selector(this.screens)
	if(!screen.resolved){
	    // screen may be allready resolved in case of Union transition
	    this.viewport.append(screen)
	    this.resolveCells(screen.board, screen, false)
	    screen.resolved=true;
	    screen.bubbleDown(function(cell){
		var base = <pieces.BaseCell>cell
		base._safeAfterRender()
	    });
	}
	// install z-index here man!
	this.currentScreen =screen
	//console.log(this.currentScreen)
    }
    transitQueue:any[];
    transitLock:bool;
    transit(selector:interfaces.ScreenSelector, receiver:(Transition)=>any){
	this.transitQueue.push({receiver:receiver, screen:selector(this.screens)})
	this._doTransit()
    }
    _doTransit(){
	if(this.transitQueue.length==0){
	    return
	}
	if(this.transitLock){
	    return
	}
	this.transitLock = true
	var first = this.transitQueue[0]
	this.transitQueue = this.transitQueue.slice(1)
	utils.Utils.destroyFlyWeight()//???
	var oldScreen = this.currentScreen
	var newScreen = first.screen
	var receiver = first.receiver
	var selector = ()=>{return first.screen}
	var me = this
	oldScreen.beforeSelfReplace(newScreen, {
	    success:function(){
		// screen в отличие от Cell не создается каждый раз заново,
		// поэтому нужно чистить все перед его появлеием.
		// var base = <pieces.BaseCell>newScreen
		// base._renderred = false
		newScreen._renderred = false
		newScreen.beforeSelfApear(oldScreen,{
		    success:function(){
			var tr = new transition
			    .Transition(me,selector,
					{
					    success:function(){
						oldScreen.afterSelfReplace(newScreen)
						// setTimeout(()=>{
						//     console.log('aaaaaaaaaaaaa',me.currentScreen)
						// }, 500)
						me.currentScreen.fillElAttrs()
						newScreen.afterSelfApear(oldScreen)
						me.transitLock = false
						me._doTransit()
					    },
					    fail:function(){
						// rollback current screen?
						me.transitLock = false
						me._doTransit()
					    }
					})
			receiver(tr)
		    },
		    fail:function(){
		    }
		})
	    },
	    fail:function(){
	    }
	})
    }
    isCellDelayed(recordString:string):bool{
	return recordString[0] == '_'
    }
    resolveCells(board:{}, parent:interfaces.Cell, delayed:bool){
	// parent.beforeResolve()
	var _type= Object.prototype.toString.call( board)
	if( _type == "[object String]"){
	    parent.updateEl(<string>board)
	    parent.afterResolve()
	    return
	}
	if(_type == "[object Array]"){
	    parent.args = <any>board
	    return
	}
	for(var recordString in board){
	    var cell = this.instantiate(recordString, pieces.BaseCell)
	    cell.board = board[recordString]
	    cell.delayed = this.isCellDelayed(recordString)
	    // ячейка может быть с андескором, поэтому она "отложена"
	    // но она также может быть отложена и без андескора, т.к.
	    // она находитя в отложенном треде (ass:{_bass:{smass:{_kalabass ...
	    // все, что ниже ass - отложено. но только ячейки с андескором получают атрибут delayed
	    var di = delayed || cell.delayed
	    this.resolveCells(board[recordString], cell, di)
	    if(di){
		parent.appendDelayed(cell)
	    }
	    else{
		parent.append(cell)
	    }
	}
	parent.afterResolve()
    }
    checkUnderscore(klass:string){
	if(klass[0]=='_'){
	    klass = klass.substr(1)
	}
	return klass
    }
    getCellRecord(cellString:string):interfaces.CellRecord{
	var klasses = cellString.split('.')
	var cons = klasses[0].split('#')[0]
	cons = this.checkUnderscore(cons)
	var id='';
	var classes=  [];
	for(var c=0,l=klasses.length;c<l;c++){
	    var splitted = klasses[c].split('#')
	    var cl = this.checkUnderscore(splitted[0])
	    classes.push(cl)
	    if(splitted.length>0){
		id=splitted[1]
	    }
	}
	return {cons:cons,classes:classes,id:id}
    }
    on(event:string, arg:Function){
	$(this.viewport.el).on(event,arg)
    }
    off(event:string,arg?:Function){
	if(arg){
	    $(this.viewport.el).off(event,arg)
	}
	else{
	    $(this.viewport.el).off(event)
	}
    }
    fire(event:string, ...args: any[]){
	$(this.viewport.el).trigger(event,args)
    }
}
