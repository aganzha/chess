import interfaces = module("chess/interfaces")
import transition = module("chess/transition")
import pieces = module("chess/pieces")
import utils = module("chess/utils")

declare var $;



export class ChessApp{
    screens:interfaces.ScreenMap;
    currentScreen:interfaces.Screen;
    constructor(public viewport:pieces.ViewPort, public board:{}, public modules:{}[]){
	// а можно еще все экраны прямо здесь делать (спрятанными) о как!
	viewport.application = this
	window['application'] =this
	// this.viewport = new pieces.ViewPort({cons:'',id:'',classes:[]}, this);
	this.screens = <interfaces.ScreenMap>{}
	// а зачем их сразу все делать а?
	// а в них можно че-нить хранить. в destroy убивавется element
	// и childrens, но инстанс скрина остается!
	for(var cons in board){
	    this.screens[cons] = this.instantiate(cons)
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
	if(klass == null){
	    //throw '<Chess> cant find class for: '+record.cons
	    return pieces.BaseCell
	}
	return klass
    }
    instantiate(record:string){
	var record = this.getCellRecord(record)
	var klass = this.getCellClass(record)
	return new klass(record, this)
    }
    resolve(selector:interfaces.ScreenSelector){
	var screen = selector(this.screens)
	var cons = screen.record.cons
	this.viewport.append(screen)
	this.resolveCells(this.board[cons], screen)
	this.currentScreen =screen
    }
    transit(selector:interfaces.ScreenSelector, receiver:(Transition)=>any){
	utils.Utils.destroyFlyWeight()
	var oldScreen = this.currentScreen
	var newScreen = selector(this.screens)
	var me = this
	oldScreen.beforeSelfReplace(newScreen, {
	    success:function(){
		newScreen.beforeSelfApear(oldScreen,{
		    success:function(){
			var tr = new transition
			    .Transition(me,selector,
					{
					    success:function(){
						oldScreen.afterSelfReplace(newScreen)
						newScreen.afterSelfApear(oldScreen)
						oldScreen.destroy()
						me.currentScreen.fillElAttrs()
						// viewport were changed during transition
						// (width and height)
						//me.viewport.fillElAttrs()
					    },
					    fail:function(){
						// rollback current screen?
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
    resolveCells(board:{}, parent:interfaces.Cell){
	parent.beforeResolve()
	if(typeof board == 'string'){
	    parent.updateEl(<string>board)
	    parent.afterResolve()
	    return
	}
	for(var recordString in board){
	    var cell = this.instantiate(recordString)
	    if(this.isCellDelayed(recordString)){
		parent.appendDelayed(cell)
	    }
	    else{
		parent.append(cell)
	    }
	    this.resolveCells(board[recordString], cell)
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
}
