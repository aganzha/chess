import interfaces = module("chess/interfaces")
import utils = module("chess/utils")
declare var $;

export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;
    children:interfaces.Cell[];
    delayedChildren:interfaces.Cell[];
    delayed:bool;
    constructor(public record:interfaces.CellRecord, 
		public application:interfaces.Application){
	this.children = <interfaces.Cell[]>[]
	this.delayedChildren = <interfaces.Cell[]>[]
	this.delayed = false
    }

    forceDelayed(filler:interfaces.DelayedCellFiller){
	for(var i=0,l=this.delayedChildren.length;i<l;i++){	    
	    var delayedCell = this.delayedChildren[i];

	    var klass = this.application.getCellClass(delayedCell.record)
	    var clone = new klass(delayedCell.record, this.application)
	    clone.delayedChildren = delayedCell.delayedChildren
	    this.append(clone)
	    // ?? may be filler must be before append (and render???)
	    filler(clone)
	    clone.forceDelayed(filler)
	}
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
	this.fillExtraAttrs()
    }
    fillExtraAttrs(){
    }
    tag='div';
    html='';
    createEl():HTMLElement{
	var el = document.createElement(this.tag)
	el.innerHTML = this.html
	return el
    }
    prepareEl(){
	if(!this.el){
	    this.el = this.createEl()
	    this.fillElAttrs()
	}
    }
    beforeRender(){
    }
    afterRender(){
    }
    append(cell:interfaces.Cell){
	if(!this.delayed){
	    // обычный вариант
	    this.prepareEl()	
	    cell.beforeRender()

	    // TODO! а вот у вьюпорта что в childs после того как screen удалили?
	    cell.parent = this
	    this.children.push(cell)
	    
	    var ne = cell.render()
	    this.el.appendChild(ne)
	    cell.afterRender()
	}
	else{
	    // а это delayedCell!
	    this.appendDelayed(cell)
	}

    }
    appendDelayed(cell:interfaces.Cell){
	this.delayedChildren.push(cell)
	cell.delayed = true
    }
    render(){
	$(this.el).remove()
	this.el = null
	this.prepareEl()
	return this.el
    }
    destroy(){
	$(this.el).remove()
	this.children = []
    }
    domFromString(s:string){
	return utils.Utils.DomFromString(s);
    }
}

export class BaseScreen extends BaseCell implements interfaces.Screen{
    beforeSelfReplace(other:interfaces.Screen, callBacks:interfaces.CallBacks){
	callBacks.success()
    }
    beforeSelfApear(other:interfaces.Screen, callBacks:interfaces.CallBacks){
	callBacks.success()
    }
    afterSelfReplace(other:interfaces.Screen){
    }
    afterSelfApear(other:interfaces.Screen){
    }
    replaceBy(other:interfaces.Screen){	
    }
}
export class ViewPort extends BaseCell{
    constructor(el:HTMLElement){
	this.el = el
	super({cons:'',id:'',classes:[]}, null)
    }
    createEl(){
    	return this.el
    }
}