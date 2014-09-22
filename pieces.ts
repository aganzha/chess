import interfaces = module("./interfaces")
import utils = module("./utils")
declare var $;

export class TestEl {
    className:string;
    childNodes:any[];
    constructor(){
	this.className = 'testElClass'
	this.childNodes = []
    }
    appendChild(el:TestEl){
    }
    createDocumentFragment(){
	return new TestEl()
    }
}
var registered_elements = []

export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;
    children:interfaces.Cell[];
    delayedChildren:interfaces.Cell[];
    delayed:bool;
    board:{};
    args:any[];
    guid:string;
    screen:interfaces.Screen;
    constructor(public record:interfaces.CellRecord,
		public application:interfaces.Application){
	this.children = <interfaces.Cell[]>[]
	this.delayedChildren = <interfaces.Cell[]>[]
	this.delayed = false
	this.args = []
	this.guid = utils.guid()
	this._handlers = []
	this.init()
    }
    map(callable:(cell:interfaces.Cell,i?:number)=>any){
	for(var i=0;i<this.children.length;i++){
	    callable(this.children[i],i)
	}
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
	    var klass = this.application.getCellClass(delayedCell.record)
	    if(klass==null){
		klass=BaseCell
	    }
	    var clone = new klass(JSON.parse(JSON.stringify(delayedCell.record)), this.application)
	    clone.html = delayedCell.html
	    clone.args = []
	    for(var j=0;j<delayedCell.args.length;j++){
	    	clone.args.push(delayedCell.args[j])
	    }
	    clone.delayedChildren = delayedCell.delayedChildren


	    // вот тут важно, что на следующе уровни selector не передается
	    // это позволяет использовать его для отбора ячеек только самого верхнего уровня
	    // т.е. передается уже совсем другой селектор (см камент вначале ф-ии)
	    
	    clone.forceDelayed(filler, function(cell:interfaces.Cell){return !cell.delayed})
	    filler(clone)
	    this.append(clone)
	}
	var newDelayedCells = []
	for(var i=0,l=this.delayedChildren.length;i<l;i++){
	    var dc = this.delayedChildren[i]
	    if(dc.delayed){
		newDelayedCells.push(dc)
	    }
	}
	this.delayedChildren = newDelayedCells
    }
    _handlers:{event:string;hook:(Event)=>any;}[];
    on(event:string, hook:(Event)=>any){
	if(this.el){
	    $(this.el).on(event, (e)=>{
		hook(e)
	    })
	}
	else{
	    this._handlers.push({event:event,hook:hook})
	}
    }
    trigger(event:string, params?:any){
	$(this.el).trigger(event, params)
    }
    getBox(){
	var answer = <interfaces.Box>$(this.el).offset()
	if(!answer.width || !answer.height){
	    var obj = this.el.getBoundingClientRect()
       	    answer['width']= Math.round(obj.width)
       	    answer['height']= Math.round(obj.height)
       	}
	return answer
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
	this.fillExtraAttrs(el)
    }
    fillExtraAttrs(el){
    }
    tag='div';
    html='';
    exceptTags = ['input'];
    createEl():HTMLElement{
	if(this.tag.match('-') && registered_elements.indexOf(this.tag)<0){
	    var d = <any>document
	    if(d['registerElement']){
		d.registerElement(this.tag)
	    }
	    registered_elements.push(this.tag)
	}
	var el = document.createElement(this.tag)
	if(this.exceptTags.indexOf(this.tag)<0){
	    el.innerHTML = this.html
	}

	// Оппа! на третьем айфоне упало!
	// try{
	//     // этот try для node, в котором гоняются тесты
	//     var el = document.createElement(this.tag)
	//     el.innerHTML = this.html
	// }
	// catch(x){
	//     var tl = <any>new TestEl()
	//     el = <HTMLElement> tl
	// }
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
	return this
    }
    _renderred:bool;
    _safeAfterRender(){
	if(this._renderred){
	    return
	}
	this._renderred = true
	this.afterRender()
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

    append(cell:BaseCell){
	this.prepareEl()
	cell.parent = this
	this.children.push(cell)
	var ne = cell.render()
	this.appendDomMethod(ne)
	cell._handlers.forEach((eh)=>{
	    cell.on(eh.event, eh.hook)
	})
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
	this.delayedChildren = []
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

	var classMatch = (rec)=>{
	    if(className){
		return rec.classes.indexOf(className)>=0
	    }
	    return true
	}
	var idMatch = (rec)=>{
	    if(id){
		return rec.id==id
	    }
	    return true
	}
	var consMatch = (rec)=>{
	    if(cons){
		return rec.cons==cons
	    }
	    return true
	}
	for(var i=0,l=this.children.length;i<l;i++){
	    var cell = <BaseCell>this.children[i];
	    if(consMatch(cell.record) && classMatch(cell.record) && idMatch(cell.record)){
		collected.push(cell)
		if(once){
		    break
		}
	    }
	    cell.searchDown(collected, cons, className, id, once)
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
    forceRender(){
	$(this.el).children().first().before('<div>Force render!</div>')
	setTimeout(()=>{
	    $(this.el).children().first().remove()
	},80)
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
    onload(){
    }
    draw(src:string, effect?:string){
	this.args[0] = src
	if(this.el.tagName.toLowerCase()=='canvas'){
	    var i = document.createElement('img')
	    this.drawImageInCanvas(<HTMLCanvasElement>this.el, <HTMLImageElement>i, effect)
	}
	else{
	    var me = this
	    var img = <HTMLImageElement>this.el
	    img.onload = function(){me.onload()}
	    img.src=src
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
    imageBox:interfaces.Box;
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
	    dY = restInHeight/2
	    dHeight = resultHeight
	}
	var scaleHeight = function(){
	    // this case not tested yet
	    var resultHeight = canvasHeight
	    var resultWidth = canvasHeight*ratio
	    var restInWidth = (canvasWidth-resultWidth)
	    dX = restInWidth/2
	    dWidth = resultWidth
	}
	if(wrat<1 && hrat<1){
	    //console.log(1)
	    if(wrat<=hrat){
		//console.log(111)
		//tez(1,5,10,10)
		// нужно подтягивать высоту картинки к высоте канваса
		scaleHeight()
	    }
	    else{
		// console.log(112)
		////tez(5,1,10,10)
		// нужно подтягивать ширину картинки к ширине канваса
		scaleWidth()
	    }
	}
	else if(wrat<1 && hrat >=1){
	    // console.log(12)//PASSED
	    // нужно подтягивать ширину картинки к ширине канваса
	    //tez(5,20,10,10)
	    scaleHeight()
	}
	else if(hrat<1 && wrat >=1){
	    // console.log(13)
	    ////tez(20,5,10,10)
	    // нужно подтягивать высоту картинки к высоте канваса
	    scaleWidth()
	}
	else{//wrat>=1 && hrat>=1
	    //console.log(14)//PASSED
	    if(wrat>hrat){
		//console.log(141)//PASSED
		//tez(100,50,10,10)
		// нужно жать ширину картинки до ширины канваса
		scaleWidth()
	    }
	    else{
		//console.log(142)//PASSED
		// tez(50,100,10,10)
		// нужно жать высоту картинки до высоты канваса
		scaleHeight()
	    }
	}
	//return {left:sX, top:sY, width:canvasWidth, height:canvasHeight}
	return {left:dX, top:dY, width:dWidth, height:dHeight}
    }
    // requestAnimFrame(){
    // 	var me = this
    // 	var w = <any>window
    // 	return w.requestAnimationFrame   ||
    // 	    w.webkitRequestAnimationFrame ||
    // 	    w.mozRequestAnimationFrame    ||
    // 	    w.oRequestAnimationFrame      ||
    // 	    w.msRequestAnimationFrame     ||
    // 	    function(/* function */ callback, /* DOMElement */ element){
    // 		w.setTimeout(callback, 1000/60);
    // 	    };

    // }
    // alpha=0;
    // fadeLoop(canvas,src,_draw){

    // 	this.alpha +=2
    // 	canvas.width = canvas.width
    // 	var ne = this.alpha*this.alpha/100
    // 	if(ne>100){
    // 	    ne = 100
    // 	}
    // 	canvas.getContext('2d').globalAlpha = ne
    // 	_draw()
    // 	if(src != this.args[0]){
    // 	    return
    // 	}
    // 	var me = this
    // 	var raf = this.requestAnimFrame()
    // 	if(ne<100){
    // 	    raf(()=>{
    // 		this.fadeLoop(canvas,src, _draw)
    // 	    })
    // 	}
    // 	else{
    // 	    this.onload()
    // 	}
    // }
    drawed:string;
    drawImageInCanvas(canvas:HTMLCanvasElement,img:HTMLImageElement, effect?:string){

	var me = this
	var errBack = ()=>{
	    if(me.args[3]){
		me.draw(me.args[3])
	    }
	}
	if(!this.args[0]){
	    errBack()
	}
	if(!this.drawed){
	    canvas.width = this.args[1]
	    canvas.height = this.args[2]
	}
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
	    var _draw = ()=>{
		context.drawImage(img,sourceBox.left,sourceBox.top,sourceBox.width,
				  sourceBox.height,
	     			  destBox.left,destBox.top,destBox.width,destBox.height)
		me.imageBox = destBox
	    }

	    switch(effect){
	    case 'fade':
		$(canvas).css(utils.getTransitionParamsFor('opacity'))
		setTimeout(()=>{
		    $(canvas).css('opacity', '0.2')
		    setTimeout(()=>{
			_draw()
			$(canvas).css('opacity', '1.0')
		    }, 300)
		}, 50)
		// me.alpha  =0
		// me.fadeLoop(canvas,me.args[0],_draw)
		break
	    default:
		_draw()
		me.onload()
		break
	    }
	    me.drawed = me.args[0]
	}).on('error',function(e){
	    if(img.src != me.args[3]){
		errBack()
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
    binary:bool;
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
	if(this.binary){
	    reader.readAsArrayBuffer(file)
	}
	else{
	    reader.readAsDataURL(file)
	}
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