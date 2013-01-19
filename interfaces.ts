export interface CellRecord{
    cons:string;
    classes:string[];
    id:string;
}
export interface Cell{
    parent:Cell;
    append(cell:Cell);
    el:HTMLElement;
    render():HTMLElement;
    destroy();
    record:CellRecord;
    getBox():Box;
}
export interface Box {
    left:number;
    top:number;
    width:number;
    height:number;
}
export interface Screen extends Cell{
    beforeSelfReplace(other:Screen);
    beforeSelfApear(other:Screen);
    afterSelfReplace(other:Screen);
    afterSelfApear(other:Screen);
    getBox():Box;
    replaceBy(other:Screen);
}
export interface ScreenMap{
    name:string;
    screen:Screen;
}
export interface ScreenSelector{
    (screens:ScreenMap):Screen;
}
export interface Transition{
    redraw();
    pop();
    fade();
    cover(widthOrHeight:string,
	  leftOrTop:string,
	  sign:(n:number)=>number);
    reveal(widthOrHeight:string,
	   leftOrTop:string,
	   sign:(n:number)=>number);
    slideLeft();
    slideRight();
    slideUp();
    slideDown();
}

export interface Application{
    resolve(selector:ScreenSelector);
    transit(selector:ScreenSelector):Transition;
}