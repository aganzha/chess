export interface CallBacks{
    success:Function;
    fail?:Function;
}

export interface CellRecord{
    cons:string;
    classes:string[];
    id:string;
}

export interface DelayedCellFiller{
    (cell:Cell);
}

export interface Cell{
    application:Application;
    parent:Cell;
    children:Cell[];
    delayedChildren:Cell[];
    append(cell:Cell);
    appendDelayed(cell:Cell);
    forceDelayed(filler:DelayedCellFiller);
    delayed:bool;
    el:HTMLElement;
    tag:string;
    html:string;
    fillElAttrs();
    render():HTMLElement;
    destroy();
    record:CellRecord;
    getBox():Box;
    fillExtraAttrs();
    beforeRender();
    afterRender();
    updateEl(html:string);
    afterResolve();
    beforeResolve();    
    args:any[];
}
export interface Box {
    left:number;
    top:number;
    width:number;
    height:number;
}
export interface Screen extends Cell{
    beforeSelfReplace(other:Screen, callBacks:CallBacks);
    beforeSelfApear(other:Screen,callBacks:CallBacks);
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
    viewport:Cell;
    resolve(selector:ScreenSelector);
    transit(selector:ScreenSelector,receiver:(Transition)=>any);
    instantiate(record:string):Cell;
    getCellClass(record:CellRecord);
}

export interface Scrollable extends Cell{
    scrollRequired():bool;
    getInitialBox():Box;
    getFirstItemBox():Box;
    pageSize:number;
    scrollAfterNo:number;
    loadNextPage();
}