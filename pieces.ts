import interfaces = module("chess/interfaces")
import utils = module("chess/utils")
declare var $;

export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;
    children:interfaces.Cell[];
    delayedChildren:interfaces.Cell[];
    delayed:bool;
    board:{};
    args=[];
    guid:string;
    constructor(public record:interfaces.CellRecord,
		public application:interfaces.Application){
	this.children = <interfaces.Cell[]>[]
	this.delayedChildren = <interfaces.Cell[]>[]
	this.delayed = false
	this.init()
	this.guid = utils.guid()
    }
    init(){
    }
    log(...args: any[]){
	console.log(arguments)
    }
    forceDelayed(filler:interfaces.DelayedCellFiller, selector?:interfaces.CellSelector){
	// по умолчанию форсится все подряд. За исключением вложенных delayed ячеек 
	// (см каменты в app.ts->resolveCells
	
	if(!selector){	    
	    selector = function(cell:interfaces.Cell){return true}
	}
	for(var i=0,l=this.delayedChildren.length;i<l;i++){
	    var delayedCell = this.delayedChildren[i];	   
	    if(!selector(delayedCell)){
		continue
	    }
	    delayedCell.delayed=false
	    var klass = this.application.getCellClass(delayedCell.record)
	    if(klass==null){
		klass=BaseCell
	    }
	    var clone = new klass(delayedCell.record, this.application)
	    clone.html = delayedCell.html	    
	    clone.args = []
	    for(var j=0;j<delayedCell.args.length;j++){
	    	clone.args.push(delayedCell.args[j])
	    }
	    clone.delayedChildren = delayedCell.delayedChildren
	    this.append(clone)
	    filler(clone)
	    // вот тут важно, что на следующе уровни selector не передается
	    // это позволяет использовать его для отбора ячеек только самого верхнего уровня
	    // т.е. передается уже совсем другой селектор (см камент вначале ф-ии)
	    clone.forceDelayed(filler, function(cell:interfaces.Cell){return !cell.delayed})
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
    afterResolve(){
    }
    afterAppend(){
    }
    afterRender(){
    }
    bubbleDown(callable:(cell:interfaces.Cell)=>any){
	callable(this)
	for(var i=0,l=this.children.length;i<l;i++){
	    this.children[i].bubbleDown(callable)
	}
    }

    append(cell:interfaces.Cell){

	this.prepareEl()
	cell.parent = this
	this.children.push(cell)
	var ne = cell.render()
	this.appendDomMethod(ne)
	cell.afterAppend()
    }

    appendDomMethod(el:HTMLElement){
	this.el.appendChild(el)
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

    searchDown(collected:BaseCell[],
	       cons?:string, className?:string,id?:string,once?:bool){
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
	    if(once && pushed){
	    }
	    else{
		cell.searchDown(collected, cons, className, id, once)
	    }
	}
    }
    query(cons?:string, className?:string,id?:string):interfaces.Cell[]{
	var answer = <BaseCell[]>[]
	this.searchDown(answer,cons,className,id)
	return answer
    }
    find(cons?:string, className?:string,id?:string):interfaces.Cell{
	var answer = <interfaces.Cell>null
	var acc = <BaseCell[]>[]
	this.searchDown(acc,cons,className,id,true)
	if(acc.length>0){
	    answer=acc[0]
	}
	return answer
    }
}

export class BaseScreen extends BaseCell implements interfaces.Screen{
    resolved:bool;
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

export class Image extends BaseCell implements interfaces.Image{

    draw(src:string,error?:bool){
	this.args[0] = src
	if(this.el.tagName.toLowerCase()=='canvas'){
	    var i = document.createElement('img')
	    this.drawImage(<HTMLCanvasElement>this.el, <HTMLImageElement>i, error)
	}
	else{
	    (<HTMLImageElement>this.el).src=src
	}
    }


    fitHeight:number;
    fitWidth:number;   

    drawImage(canvas:HTMLCanvasElement,img:HTMLImageElement, error?:bool){

	canvas.width = this.args[1]
	canvas.height = this.args[2]
	var me = this
	$(img).on('load',function(){

	    var ratio = img.width/img.height

	    if(me.fitWidth){
		canvas.width = me.fitWidth
		canvas.height = me.fitWidth/ratio
	    }

	    if(me.fitHeight){
		canvas.height = me.fitHeight
		canvas.width = me.fitHeight*ratio
	    }


	    var context = canvas.getContext('2d')
	    var getcha = false
	    var height = canvas.height,width=canvas.width

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
	}).on('error',function(e){
	    if(me.args[3] && !error){
		me.draw(me.args[3], true)
	    }
	})
	img.src = this.args[0]
    }
    createEl(){


	var img = <HTMLImageElement>document.createElement('img')
	var answer = <HTMLElement>img
	if(this.html.length>0){
	    img.src = this.html
	}
	else{
	    if(this.args.length>0){
		if(this.args[1] && this.args[2]){
		    var canvas = <HTMLCanvasElement>document.createElement('canvas')
		    if(this.args[0]!=null){
			this.drawImage(canvas,img)
		    }
		    else{
			canvas.width = this.args[1]
			canvas.height = this.args[2]
		    }
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
    afterRender(){
	var me = this
	var stop = function(e:Event){
	    e.stopPropagation()
	    e.preventDefault()
	}
	$(this.getFileInput()).on('change',
				  function(e){
				      stop(e)
				      var files = e.target.files
				      me.loadFile(files[0])
				  })
	$(this.getDropArea()).on('drop',
				 function(e){
				     stop(e)
				     var dt = e.dataTransfer
				     var files = dt.files
				     me.loadFile(files[0])
				 })
	    .on('dragover', stop)
	    .on('dragenter', stop)
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