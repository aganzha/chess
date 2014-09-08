import interfaces = module("./interfaces")

declare var $;
//TODO! functions! not class
export class Utils{
    static flyWeightId="_chessFlyWeightId";
    static makeFlyWeight():HTMLElement{
	var di = document.createElement('div')
	di.style['display'] = 'none'
	di.id = this.flyWeightId
	document.getElementsByTagName('body')[0].appendChild(di)
	return di
    }
    static destroyFlyWeight(){
	$('#'+this.flyWeightId).remove()
    }
    static DomFromString(s:string):HTMLElement{
	var flw = document.getElementById(this.flyWeightId);
	if(!flw){
	    this.makeFlyWeight()
	    return this.DomFromString(s)
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

function walkDown(parent:interfaces.Cell, collected:interfaces.Cell[],
		  cons?:string, className?:string,id?:string){
    for(var i=0,l=parent.children.length;i<l;i++){
	var cell = parent.children[i];
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
	walkDown(cell, collected, cons, className, id)
    }	
}



export function bind(func, context) {
    var nativeBind = Function.prototype.bind
     var slice = Array.prototype.slice
    if (func.bind === nativeBind && nativeBind) 
	return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
	return func.apply(context, args.concat(slice.call(arguments)));
    };
};


function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

export function guid() {
    return s4()+s4()
  // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  //        s4() + '-' + s4() + s4() + s4();
}


export var getMinSize = ()=>{
    var minsize = 1000000
    var makeMinSize = (compare)=>{
	if(compare && compare<minsize){
	    minsize = compare;
	}
    }
    makeMinSize(screen.width);
    makeMinSize(screen.height);
    makeMinSize(window.innerWidth);
    makeMinSize(window.innerHeight);
    makeMinSize(window.outerHeight);
    makeMinSize(window.outerWidth);

    return minsize
}


export function getTransformParams(x,y,z){
    return {
	    '-webkit-transform':'translate3d('+x+'px, '+y+'px, '+z+'px)',
	    '-moz-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
	    '-ms-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
	    '-o-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
	    'transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)'
	}
}

export function getTransitionParamsFor(property, delay?:string, fu?:string){
    var tr_function = ' '
    if(delay){
	tr_function+=delay+' '
    }
    else{
	tr_function+='0.25s '
    }
    if(fu){
	 tr_function+=fu
    }
    else{
	 tr_function+='ease-in'
    }
    return {
	'-webkit-transition': property+tr_function,
	'-moz-transition': property+tr_function,
	'-o-transition': property+tr_function,
	'transition': property+tr_function
    }
}

export function removeTransitionParams(){
    return {
	'-webkit-transition': "",
	'-moz-transition': "",
	'-o-transition': "",
	'transition': "" //was null for zepto
    }
}
