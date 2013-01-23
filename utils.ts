import interfaces = module("chess/interfaces")

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

    static walkDown(parent:interfaces.Cell, collected:interfaces.Cell[],
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
	    this.walkDown(cell, collected, cons, className, id)
	}	
    }
    static getPieces(cons?:string, className?:string,id?:string):interfaces.Cell[]{
	// TODO
	// для каждого cell нужно сделать items,keys и values
	// соотв здесь будет проход от скрина вниз!
	var answer = <interfaces.Cell[]>[]
	this.walkDown(<interfaces.Application>window['application'].currentScreen, answer,
		     cons,className,id)	
	return answer
    }
}
