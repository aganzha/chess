import interfaces = module("chess/interfaces")
import utils = module("chess/utils")
declare var $;

export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;
    children:interfaces.Cell[];
    delayedChildren:interfaces.Cell[];
    delayed:bool;
    args=[];
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
	    if(klass==null){
		klass=BaseCell
	    }
	    var clone = new klass(delayedCell.record, this.application)
	    clone.html = delayedCell.html
	    clone.args = delayedCell.args
	    clone.delayedChildren = delayedCell.delayedChildren
	    // ?? may be filler must be before append (and render???)
	    this.append(clone)
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
    updateEl(html:string){
	this.html = html
	$(this.el).html(html)
    }
    beforeResolve(){
    }
    afterResolve(){
    }
    beforeAppend(){
    }
    afterAppend(){
    }

    append(cell:interfaces.Cell){

	this.prepareEl()
	cell.beforeAppend()

	// TODO! а вот у вьюпорта что в childs после того как screen удалили?
	cell.parent = this
	this.children.push(cell)

	var ne = cell.render()
	this.el.appendChild(ne)
	cell.afterAppend()
    }
    appendDelayed(cell:interfaces.Cell){
	this.delayedChildren.push(cell)
    }
    render(){
	// $(this.el).remove()
	// this.el = null
	this.prepareEl()
	return this.el
    }
    destroy(){
	$(this.el).remove()
	this.el = null
	this.children = []
    }
    domFromString(s:string){
	return utils.Utils.DomFromString(s);
    }

    walkDown(collected:BaseCell[],
		      cons?:string, className?:string,id?:string){
	console.log('hehe', this.el)
	for(var i=0,l=this.children.length;i<l;i++){
	    var cell = <BaseCell>this.children[i];
	    var rec = cell.record
	    var pushed = false

	    if(!pushed && cons && rec.cons == cons){
		collected.push(cell)
		pushed=true
	    }
	    if(!pushed && className){
		for(var j=0,m=rec.classes.length;j<m;j++){
		    if(rec.classes[j] == className){
			pushed=true
			collected.push(cell)
			break
		    }
		}
	    }
	    if(!pushed && id && rec.id == id){
		collected.push(cell)
		pushed=true
	    }
	    cell.walkDown(collected, cons, className, id)
	}	
    }
    getPieces(cons?:string, className?:string,id?:string):interfaces.Cell[]{
	// TODO
	// для каждого cell нужно сделать items,keys и values
	// соотв здесь будет проход от скрина вниз!
	var answer = <BaseCell[]>[]
	this.walkDown(answer,cons,className,id)
	return answer
    }        
}

export class BaseScreen extends BaseCell implements interfaces.Screen{
    resolved:bool;
    board:{};
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
    destroy(){
	super.destroy()
	this.resolved=false
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

export class Image extends BaseCell{
    createEl(){
	var answer = <HTMLElement>null
	var img = <HTMLImageElement>document.createElement('img')
	if(this.html.length>0){
	    img.src = this.html
	    answer = img
	}
	else{
	    if(this.args.length>0){
		if(this.args[1] && this.args[2]){
		    var canvas = <HTMLCanvasElement>document.createElement('canvas')
		    canvas.width = this.args[1]
		    canvas.height = this.args[2]
		    $(img).on('load',function(){
			var context = canvas.getContext('2d')
			var getcha = false
			var height = canvas.height,width=canvas.width
			var ratio = img.width/img.height
			var destWidth = canvas.width
			var destHeight = canvas.height

			if(height<img.height && width<img.width){
			    while(!getcha){
				height+=1
				width+=1
				if(true){
				    if(height==img.height ){
					getcha=true
					width=height*ratio
					destWidth = destHeight*ratio
				    }
				    if(width==img.width ){
					getcha=true
					height=width/ratio
					destHeight=destWidth/ratio
				    }
				}
			    }
			    context.drawImage(img,0,0,width,height,0,0,destWidth,destHeight)
			}
			else{
			    context.drawImage(img,0,0,width,height);
			}
		    })
		    img.src = this.args[0]
		    answer = canvas
		}
		else{
		    img.src = this.args[0]
		    answer = img
		}
	    }
	}
	return answer
    }
}



export class Uploader extends BaseCell implements interfaces.Uploader{
    fileName:string;
    fileType:string;
    fileSize:number;
    file:string;
    loadFile(file){
	// var files = e.target.files
	// var file = files[0]
	this.fileName = file.name
	this.fileSize = file.size
	this.fileType = file.type
	var me = this
	var reader = new FileReader();
	reader.onload = function(ev){
	    me.file = ev.target.result
	    me.loadDone()
	}
	reader.readAsDataURL(file);
    }
    // afterResolve(){
    // 	console.log('afterResolve')
    // 	console.log(this, this.parent)
    // }
    afterAppend(){
	// console.log('afterAppend')
	// console.log(this, this.parent, this.parent.parent)
	var me = this
	$(this.getFileInput()).on('change',
				  function(e){
				      e.preventDefault()
				      e.stopPropagation()
				      var files = e.target.files
				      me.loadFile(files[0])
				  })//utils.bind(this.loadFile, this)
	$(this.getDropArea()).on('drop',
				 function(e){
				     alert('1')
				     e.stopPropagation()
				     e.preventDefault()
				     var dt = e.dataTransfer
				     var files = dt.files
				     this.loadFile(files[0])
				 })
    }
    getFileInput(){
	return <HTMLInputElement>this.el
    }
    getDropArea(){
	return this.el
    }
    loadDone(){
    }
}