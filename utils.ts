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
    static getPieces(className:string):interfaces.Cell{
	// TODO
	// для каждого cell нужно сделать items,keys и values
	// соотв здесь будет проход от скрина вниз!
	var answer = <interfaces.Cell>null
	return answer;
    }
}

