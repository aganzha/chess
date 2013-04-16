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
	    // а вот зачем я снимал этот атрибут интересно? нипянятна...
	    // delayedCell.delayed=false
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
	    // внизу дом уже срендерен предыдущем выражением, так что можно вызывать
	    clone.afterRender()
	}
	var newDelayedCells = []
	for(var i=0,l=this.delayedChildren.length;i<l;i++){
	    if(this.delayedChildren[i].delayed){
		newDelayedCells.push(delayedCell)
	    }
	}
	this.delayedChildren = newDelayedCells
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
	var newParentsChildren = []
	for(var i=0;i<this.parent.children.length;i++){
	    var cel = this.parent.children[i]
	    if(cel!==this){
		newParentsChildren.push(cel)
	    }
	}
	this.parent.children = newParentsChildren
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
	    this.drawImageInCanvas(<HTMLCanvasElement>this.el, <HTMLImageElement>i, error)
	}
	else{
	    (<HTMLImageElement>this.el).src=src
	}
    }

    getSourceBoxForCompleteCanvas(imgWidth, imgHeight, canvasWidth, canvasHeight):interfaces.Box{
	// https://developer.mozilla.org/en-US/docs/HTML/Canvas/Tutorial/Using_images?redirectlocale=en-US&redirectslug=Canvas_tutorial%2FUsing_images
	var ratio = imgWidth/imgHeight
	var sX=0,sY=0
	var sWidth = imgWidth,sHeight = imgHeight
	var wrat = imgWidth/canvasWidth
	var hrat = imgHeight/canvasHeight
	var cropHeight = function(){
	    var resultWidth = canvasWidth
	    var resultHeight = canvasWidth/ratio
	    var croppedFromHeight = (resultHeight-canvasHeight)
	    sY = croppedFromHeight/2*wrat
	    sHeight = sHeight-(2*sY)
	}
	var cropWidth = function(){
	    var resultHeight = canvasHeight
	    var resultWidth = canvasHeight*ratio
	    var croppedFromWidth = (resultWidth-canvasWidth)
	    sX = (croppedFromWidth/2)*hrat
	    sWidth = sWidth-(2*sX)
	}
	if(wrat<1 && hrat<1){
	    if(wrat<=hrat){
		//tez(1,5,10,10)
		// нужно подтягивать ширину картинки к ширине канваса
		cropHeight()
	    }
	    else{
		////tez(1,5,10,10)
		// нужно подтягивать высоту картинки к высоте канваса
		cropWidth()
	    }
	}
	else if(wrat<1 && hrat >=1){
	    // нужно подтягивать ширину картинки к ширине канваса
	    //tez(5,20,10,10)
	    cropHeight()
	}
	else if(hrat<1 && wrat >=1){
	    ////tez(20,5,10,10)
	    // нужно подтягивать высоту картинки к высоте канваса
	    cropWidth()
	}
	else{//wrat>=1 && hrat>=1
	    if(wrat>hrat){
		//tez(100,50,10,10) нужно жать высоту картинки до высоты
		// канваса
		cropWidth()
	    }
	    else{
		// tez(50,100,10,10)
		// нужно жать ширину картинки до ширины канваса
		cropHeight()
	    }
	}
	//return {left:sX, top:sY, width:canvasWidth, height:canvasHeight}
	return {left:sX, top:sY, width:sWidth, height:sHeight}
    }

    getDestBoxForCompleteImage(imgWidth, imgHeight, canvasWidth, canvasHeight):interfaces.Box{
	var ratio = imgWidth/imgHeight
	var dX=0,dY=0
	var dWidth = imgWidth,dHeight = imgHeight
	var dWidth = canvasWidth,dHeight=canvasHeight
	var wrat = imgWidth/canvasWidth
	var hrat = imgHeight/canvasHeight

	var scaleWidth = function(){
	    var resultWidth = canvasWidth
	    var resultHeight = canvasWidth/ratio
	    var restInHeight = (canvasHeight-resultHeight)
	    dY = restInHeight/2*hrat
	    dHeight = resultHeight//dHeight-(2*dY)
	}
	var scaleHeight = function(){
	    // this case not tested yet
	    var resultHeight = canvasHeight
	    var resultWidth = canvasHeight*ratio
	    var restInWidth = (canvasWidth-resultWidth)
	    dX = (restInWidth/2)*hrat
	    dWidth = resultWidth
	}
	if(wrat<1 && hrat<1){
	    if(wrat<=hrat){
		//tez(1,5,10,10)
		// нужно подтягивать высоту картинки к высоте канваса
		scaleHeight()
	    }
	    else{
		////tez(5,1,10,10)
		// нужно подтягивать ширину картинки к ширине канваса
		scaleWidth()
	    }
	}
	else if(wrat<1 && hrat >=1){
	    // нужно подтягивать ширину картинки к ширине канваса
	    //tez(5,20,10,10)
	    scaleWidth()
	}
	else if(hrat<1 && wrat >=1){
	    ////tez(20,5,10,10)
	    // нужно подтягивать высоту картинки к высоте канваса
	    scaleHeight()
	}
	else{//wrat>=1 && hrat>=1
	    if(wrat>hrat){
		//tez(100,50,10,10)
		// нужно жать ширину картинки до ширины канваса
		scaleWidth()
	    }
	    else{
		// tez(50,100,10,10)
		// нужно жать высоту картинки до высоты канваса
		scaleHeight()
	    }
	}
	//return {left:sX, top:sY, width:canvasWidth, height:canvasHeight}
	return {left:dX, top:dY, width:dWidth, height:dHeight}
    }

    drawImageInCanvas(canvas:HTMLCanvasElement,img:HTMLImageElement, error?:bool){
	canvas.width = this.args[1]
	canvas.height = this.args[2]
	var me = this
	$(img).on('load',function(){
	    var ratio = img.width/img.height

	    var context = canvas.getContext('2d')

	    var sourceBox = {top:0,left:0,width:img.width,height:img.height}
	    var destBox = {top:0,left:0,width:canvas.width,height:canvas.height}

	    if(me.args[4]){
	    	if(me.args[4]=='completeImage'){
	    	    destBox = me.getDestBoxForCompleteImage(img.width, img.height,
	    							 canvas.width, canvas.height)
	    	}
	    	else if(me.args[4]=='completeCanvas'){
	    	    sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height,
	    							     canvas.width, canvas.height)
	    	}
	    }
	    else{
		// complete canvas by default
	    	sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height,
	    							 canvas.width, canvas.height)
	    }
	    context.drawImage(img,sourceBox.left,sourceBox.top,sourceBox.width,sourceBox.height,
	     		      destBox.left,destBox.top,destBox.width,destBox.height)
	}).on('error',function(e){
	    if(me.args[3] && !error){
		me.draw(me.args[3], true)
	    }
	})
	img.src = this.args[0]
    }
    clear(){
	if(this.el.tagName.toLowerCase()=='canvas'){
	    var canvas = <HTMLCanvasElement>this.el
	    canvas.width = canvas.width
	}
	else{
	    $(this.el).attr('scr','')
	}
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
			this.drawImageInCanvas(canvas,img)
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
    // initialSourceBox:interfaces.Box;
    scale(factor:number){
	this.clear()
    	var img = <HTMLImageElement>document.createElement('img')
    	var canvas = <HTMLCanvasElement>this.el
	var context = canvas.getContext('2d')
	var me = this
    	img.onload = function(){
	    var destBox = {top:0,left:0,width:canvas.width,height:canvas.height}	    
	    var sourceBox= me.getSourceBoxForCompleteCanvas(img.width, img.height,
	    						    canvas.width, canvas.height)
	    // sourceBox уже соответствует размеру canvas
	    // его просто нужно умножить на factor
	    // зумаут мы не можем делать. мы и так показали картинку полностью. делать
	    // ее меньше канваса нет смысла. т.е. фактор будет точно больше 1
	    // скажем если фактор = 2, то исходную ширину(и высоту тоже) нужно РАЗДЕЛИТЬ на 2
	    // т.е. в том же канвасе показать исходник меньшего размера. соотв он растянется тогда!
	    sourceBox.left = sourceBox.left+(sourceBox.width-sourceBox.width/factor)/2
	    sourceBox.top = sourceBox.top+(sourceBox.height-sourceBox.height/factor)/2
	    sourceBox.width = sourceBox.width/factor
	    sourceBox.height = sourceBox.height/factor
	    context.drawImage(img,sourceBox.left,sourceBox.top,sourceBox.width,sourceBox.height,
			      destBox.left,destBox.top,destBox.width,destBox.height)
    	}
    	img.src = this.args[0]
    }
}



export class Uploader extends BaseCell implements interfaces.Uploader{
    fileName:string;
    fileType:string;
    fileSize:number;
    file:string;
    rawFile:any;
    needLoad(fname:string){
	return true
    }
    fileChoosen(){
    }
    loadFile(file){
	// var files = e.target.files
	// var file = files[0]
	this.fileName = file.name
	this.fileSize = file.size
	this.fileType = file.type
	this.rawFile = file
	this.fileChoosen()
	if(!this.needLoad(this.fileName)){
	    return
	}
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