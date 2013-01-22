export interface CellRecord{
    cons:string;
    classes:string[];
    id:string;
}
export interface Cell{
    parent:Cell;
    append(cell:Cell);
    el:HTMLElement;
    fillElAttrs();
    render():HTMLElement;
    destroy();
    record:CellRecord;
    getBox():Box;
    fillExtraAttrs();
    beforeRender();
    afterRender();
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
    slideLeft();
    slideRight();
    slideUp();
    slideDown();
    coverLeft();
    coverRight();
    coverUp();
    coverDown();
    revealLeft();
    revealRight();
    revealUp();
    revealDown();
}



export interface Application{
    currentScreen:Screen;
    screens:ScreenMap;
    resolve(selector:ScreenSelector);
    transit(selector:ScreenSelector):Transition;
}
