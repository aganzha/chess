import interfaces = module("chess/interfaces")

export class Utils{
    static flyWeightId="_chessFlyWeightId";
    static makeFlyWeight(){
    	var di = document.createElement('div')
    	di.style['display'] = 'none'
	di.id = flyWeightId
    	document.getElementsByTagName('body')[0].appendChild(di)
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

export class BaseCell implements interfaces.Cell{
    el:HTMLElement;
    parent:interfaces.Cell;
    classes:string[];
    id:string;

    makeClassName():string{
	var funcNameRegex = /function (.{1,})\(/;
	var func = (<any>this).constructor.toString();
	var results = (funcNameRegex).exec(func);
	return (results && results.length > 1) ? results[1] : "";
    }
    fillElAttrs(el:HTMLElement){
	el.className = this.makeClassName()
	if(this.classes){
	    for(var i=0,l=this.classes.length;i<l;i++){
		el.className+=" "+this.classes[i];
	    }
	}
    }
    makeEl():HTMLElement{
	var div = document.createElement('div')
	this.fillElAttrs(div)
	return div
    }
    append(view:interfaces.Cell){
	if(!this.el){
	    this.el = this.makeEl()
	}
	this.el.appendChild(view.render())
	view.parent = this
    }
    render(){
	if(!this.el){
	    this.el = this.makeEl()
	}
	return this.el
    }
}

class ViewPort extends BaseCell{
    makeEl(){
	return <HTMLElement>document.getElementsByTagName('body')[0]
    }
}



export class App{
    constructor(board:{}, pieces:{}){
	var topMost = new ViewPort();
	this.resolveCells(board, pieces, topMost)
    }
    resolveCells(board:{}, pieces:{}, parent:interfaces.Cell){
	for(var key in board){
	    var className = key.split('-')[0];
	    if(!pieces[className]){
		console.log('no such class in pieces: '+className);
		continue;
	    }
	    var cell = <interfaces.Cell>new pieces[className];
	    parent.append(cell);
	    this.resolveCells(board[key], pieces, cell);
	    break
	}
    }
}
