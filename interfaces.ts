/*
  Lifecicle of cells and pieces:
  1. Screen
  First screen is resolved. 
  This means it is created outside of the dom.
  beforeSelfApear is not called on it. It is responsibilities of the 
  client who is calling resolve (particular cases are: in user code just after creating app when he call resolve, 
  by transition which call resolve). Static screens are renderred only once.
  2. Cells
  During screen resolving, board are walked down to the deepes cells. Cells are created outside of the dom and 
  appended to the higher level cells (which are not yet in DOM).
  Finnally top level cells are appended to the screen element. And sceen element is appended to the viewport on
  the very last step.
  3. Delayed cells
  are forced the same way as screens are rsolved. Recursivelly walking down to the deepest cells (or to the next delayed
  cell, then created outside of the DOM and appended to their parents (which are not yet in the DOM of cause)
  Final step - appending the topmost cell (delayed cell itself) to its parent.
  
  !!! So, general idea is to move all code to the afterAppend method of regular cells. Because manipulations with their HTML elements are cheap because of they are not a part of the DOM.
  !!! It i not true for Screens, because Screen afterAppend is called when all structure is in DOM.
  please call beforeAppend on screen. it will have all elements as chuildrens but will not have self.el at the moment of beforeAppend
  
*/
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
    guid:string;
    application:Application;
    screen:Screen;
    init();
    parent:Cell;
    children:Cell[];
    delayedChildren:Cell[];
    append(cell:Cell);
    appendDelayed(cell:Cell);
    forceDelayed(filler:DelayedCellFiller,selector?:CellSelector);
    delayed:boolean;
    el:HTMLElement;
    tag:string;
    html:string;
    fillElAttrs();
    render():HTMLElement;
    destroy();
    record:CellRecord;
    getBox():Box;
    fillExtraAttrs(el:HTMLElement);
    // этот метод вызывается, когда cell НЕ добавлен в parent.
    // у него есть el(элемент) и children но он еще не добавлен в DOM
    beforeAppend();
    // этот метод вызывается, когда cell добавлен в parent.
    // у него уже есть children и у него есть parent!. 
    // у него есть el(элемент) но он еще не добавлен в DOM
    afterAppend();
    _renderred:boolean;
    createEl():HTMLElement;
    updateEl(html:string):Cell;
    // этот метод вызывается, когда cell добавлен в parent. 
    // Т.е. для child вызывается afterAppend, а для parent - afterResolve
    // соотв все children на месте. а вот parent еще нет!
    afterResolve();
    args:any[];
    board:{};
    query(cons?:string, className?:string,id?:string):Cell[];
    find(cons?:string, className?:string,id?:string):Cell;
    bubbleDown(callable:(cell:Cell)=>any);
    // Элемент добавлен в DOM
    afterRender();
    appendDomMethod(el:HTMLElement);
    log(...args: any[]);
    map(callable:(cell:Cell,i?:number)=>any);
    on(event:string, hook:(Event)=>any);
    trigger(event:string,params?:any);
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
    forceRender();
    resolved:boolean;
}
export interface ScreenMap{
    name:string;
    screen:Screen;
}
export interface ScreenSelector{
    (screens:ScreenMap):Screen;
}
export interface CellSelector{
    (cell:Cell):boolean;
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
    resolve(selector:ScreenSelector, is_static?:boolean);
    transit(selector:ScreenSelector,receiver:(Transition)=>any);
    proceed(screen:string,transition:string);
    // instantiate(record:string):Cell;
    getCellClass(record:CellRecord);
    globals:{};
    on(event:string,callback:Function);
    off(event:string,callback?:Function);
    fire(event:string, ...args: any[]);
    getScreen(scr:string):Screen;
}

export interface Scrollable extends Cell{
    scrollRequired():boolean;
    getInitialBox():Box;
    getFirstItemBox():Box;
    pageSize:number;
    scrollAfterNo:number;
    loadNextPage();
    unique?:boolean;
    currentPage?:number;
    scrollAfterPassed();
}

export interface Valuable{
    getHolder():HTMLElement;
    getValue():string;
    setValue(s:string);
    defaultValue:string;
}


export interface Draggable extends Cell{
    dX:number;//do not touch this numbers. just declare.
    dY:number;
    onStartDrag:(el:HTMLElement)=>boolean;//if want drag to begin -> return true!!!
    onDrag:(box:Box)=>any;
    onDrop:(box:Box)=>any;
    confirmDrag(b:Box):Box;
}


export interface Uploader{
    binary:boolean;
    getFileInput():HTMLInputElement;
    getDropArea():HTMLElement;
    loadDone();
    fileChoosen();
    file:string;
    fileName:string;
    fileType:string;
    rawFile:any;
    needLoad(fname:string):boolean;
}

export interface Image{
    // args:  [image_source:string, width:number, height:number, 
    //           fallback_image_source:string, strategy:string]
    // strategies: 'completeCanvas' (default) 'completeImage'
    draw(imgSrc:string);
    clear();
    scale(factor:number);
    onload();
    imageBox:Box;
}
