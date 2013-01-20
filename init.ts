import interfaces = module("chess/interfaces")
import transition = module("chess/transition")
declare var $;


export class Utils{
    static flyWeightId="_chessFlyWeightId";
    static makeFlyWeight(){
	var di = document.createElement('div')
	di.style['display'] = 'none'
	di.id = flyWeightId
	document.getElementsByTagName('body')[0].appendChild(di)
    }
    static destroyFlyWeight(){
	$('#'+flyWeightId).remove()
    }
    static DomFromString(s:string):HTMLElement{
	var flw = document.getElementById(flyWeightId);
	if(!flw){
	    makeFlyWeight()
	    return DomFromString(s)
	}
	flw.innerHTML = s
	return <HTMLElement>flw.children[0];
    }
    static template(templateId:string, replacements:{}){
	var txt = document.getElementById(templateId).innerHTML;
	for(var key in replacements){
	    txt = txt.replace(key, replacements[key])
	}
	return txt
    }
}

// createEl():HTMLElement{
//   can use templates
// var txt = chess.Utils.template('main',{})
// return chess.Utils.DomFromString(txt)

//   or string directly
// return chess.Utils.DomFromString('<div><div id="logo"></div><div>')

// var di = super.createEl();
// di.innerHTML = '<div id="logo"></div>';
// return di;
// }


export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;

    constructor(public record:interfaces.CellRecord){
    }
    getBox(){
	return <interfaces.Box>$(this.el).offset()
    }
    fillElAttrs(){
	var el = this.el
	// hack used to reseting element to its original
	$(el).removeAttr('class')
	$(el).removeAttr('style')

	var classes = this.record.classes;
	for(var i=0,l=classes.length;i<l;i++){
	    if(i!=0)
		el.className+=" "
	    el.className+=classes[i];
	}
	if(this.record.id){
	    el.id=this.record.id;
	}
    }
    createEl():HTMLElement{
	var div = document.createElement('div')
	return div
    }
    prepareEl(){
	if(!this.el){
	    this.el = this.createEl()
	    this.fillElAttrs()
	}
    }
    append(view:interfaces.Cell){
	this.prepareEl()
	var ne = view.render()
	this.el.appendChild(ne)
	view.parent = this
    }
    render(){
	$(this.el).remove()
	this.el = null
	this.prepareEl()
	return this.el
    }
    destroy(){
	$(this.el).remove()
    }
    domFromString(s:string){
	return Utils.DomFromString(s);
    }
}

export class BaseScreen extends BaseCell implements interfaces.Screen{
    beforeSelfReplace(other:interfaces.Screen){
    }
    beforeSelfApear(other:interfaces.Screen){
    }
    afterSelfReplace(other:interfaces.Screen){
    }
    afterSelfApear(other:interfaces.Screen){
    }
    replaceBy(other:interfaces.Screen){
	console.log('eplace')
    }
}


class ViewPort extends BaseCell{
    createEl(){
	return <HTMLElement>document.getElementsByTagName('body')[0]
    }
}



export class App{
    viewport:ViewPort;
    screens:interfaces.ScreenMap;
    currentScreen:interfaces.Screen;
    constructor(public board:{}, public modules:{}[]){
	// а можно еще все экраны прямо здесь делать (спрятанными) о как!
	window['application'] =this
	this.viewport = new ViewPort({cons:'',id:'',classes:[]});
	this.screens = <interfaces.ScreenMap>{}
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
	    return BaseCell
	}
	return klass
    }
    instantiate(record:string){
	var record = this.getCellRecord(record)
	var klass = this.getCellClass(record)
	return new klass(record)
    }
    resolve(selector:interfaces.ScreenSelector){
	var screen = selector(this.screens)
	var cons = screen.record.cons
	this.viewport.append(screen)
	this.resolveCells(this.board[cons], screen)
	this.currentScreen =screen
    }
    // сейчас непосредственно перед транзитом происходит резолв
    // т.е. добавление (append) скрина в body
    // а возиожно транзишн сам должен решать когда ему
    // добавлять новый элемент!
    transit(selector:interfaces.ScreenSelector){
	Utils.destroyFlyWeight()
	var oldScreen = this.currentScreen	
	var me = this;	
	var tr = new transition.Transition(me,selector,
					   function(){
					       oldScreen.destroy()
					       me.currentScreen.fillElAttrs()
					       me.viewport.fillElAttrs()
					   },
					   function(){
					       // rollback current screen?
					   })
	return tr;
    }
    resolveCells(board:{}, parent:interfaces.Cell){
	for(var recordString in board){
	    var cell = this.instantiate(recordString)
	    parent.append(cell)
	    this.resolveCells(board[recordString], cell)
	}
    }
    getCellRecord(cellString:string):interfaces.CellRecord{
	var klasses = cellString.split('.')
	var cons = klasses[0].split('#')[0]
	var id='';
	var classes=  [];
	for(var c=0,l=klasses.length;c<l;c++){
	    var splitted = klasses[c].split('#')
	    classes.push(splitted[0])
	    if(splitted.length>0){
		id=splitted[1]
	    }
	}
	return {cons:cons,classes:classes,id:id}
    }
}
