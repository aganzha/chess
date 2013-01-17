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
    fillElAttrs(el:HTMLElement){
        var classes = this.record.classes;
        for(var i=0,l=classes.length;i<l;i++){
            el.className+=" "+classes[i];
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
            this.fillElAttrs(this.el)
        }
    }
    append(view:interfaces.Cell){
        this.prepareEl()
        this.el.appendChild(view.render())
        view.parent = this
    }
    render(){
        this.prepareEl()
        return this.el
    }
    destroy(){
        this.el.parentNode.removeChild(this.el)
    }
    domFromString(s:string){
        return Utils.DomFromString(s);
    }
}


class ViewPort extends BaseCell{
    createEl(){
        return <HTMLElement>document.getElementsByTagName('body')[0]
    }
}



export class App{
    topMost:ViewPort;
    screens:interfaces.ScreenMap;
    constructor(public board:{}, public modules:{}[]){
        // а можно еще все экраны прямо здесь делать (спрятанными) о как!
        window['application'] =this
        this.topMost = new ViewPort({cons:'',id:'',classes:[]});
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
            console.log('cant find class for: '+record.cons)
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
        this.topMost.append(screen)
        this.resolveCells(this.board[cons], screen)
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
