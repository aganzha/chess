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
    init();
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
    // этот метод вызывается, когда cell добавлен в parent.
    // у него еще нет children. у него есть el(элемент) но онг еще не добавлен в DOM
    afterAppend();
    
    updateEl(html:string);
    // этот метод вызывается, когда cell добавлен в parent.
    // у него уже есть children. у него есть el(элемент) но он еще не добавлен в DOM
    afterResolve();
    args:any[];
    searchPieces(cons?:string, className?:string,id?:string):Cell[];
    bubbleDown(callable:(cell:Cell)=>any);
    afterRender();
    // этот метод вызывается, когда cell добавлен в parent.
    // у него уже есть children. у него есть el(элемент) и он добавлен в DOM
    appendDomMethod(el:HTMLElement);
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
    replaceBy(other:Screen);
    board:{};    
    resolved:bool;
}
export interface ScreenMap{
    name:string;
    screen:Screen;
}
export interface ScreenSelector{
    (screens:ScreenMap):Screen;
}
export interface Transition{
    union();
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
    // instantiate(record:string):Cell;
    getCellClass(record:CellRecord);
    globals:{};
}

export interface Scrollable extends Cell{
    scrollRequired():bool;
    getInitialBox():Box;
    getFirstItemBox():Box;
    pageSize:number;
    scrollAfterNo:number;
    loadNextPage();
}

export interface Valuable{
    getHolder():HTMLElement;
    getValue():string;
    setValue(s:string);
    defaultValue:string;
}

export interface Uploader{
    getFileInput():HTMLInputElement;
    getDropArea():HTMLElement;
    loadDone();
    file:string;
    fileName:string;
}

export interface Image{
    draw(imgSrc:string);
}