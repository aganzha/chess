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
    init();
    parent:Cell;
    children:Cell[];
    delayedChildren:Cell[];
    append(cell:Cell);
    appendDelayed(cell:Cell);
    forceDelayed(filler:DelayedCellFiller,selector?:CellSelector);
    delayed:bool;
    el:HTMLElement;
    tag:string;
    html:string;
    fillElAttrs();
    render():HTMLElement;
    destroy();
    record:CellRecord;
    getBox():Box;
    fillExtraAttrs(el:HTMLElement);
    // этот метод вызывается, когда cell добавлен в parent.
    // у него уже есть children и у него есть parent!. 
    // у него есть el(элемент) но он еще не добавлен в DOM
    // этот метод НЕ НУЖНО использовать для delayed элементов
    afterAppend();
    _renderred:bool;
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
    resolved:bool;
}
export interface ScreenMap{
    name:string;
    screen:Screen;
}
export interface ScreenSelector{
    (screens:ScreenMap):Screen;
}
export interface CellSelector{
    (cell:Cell):bool;
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
    resolve(selector:ScreenSelector, is_static?:bool);
    transit(selector:ScreenSelector,receiver:(Transition)=>any);
    proceed(screen:string,transition:string);
    // instantiate(record:string):Cell;
    getCellClass(record:CellRecord);
    globals:{};
    on(event:string,callback:Function);
    off(event:string,callback?:Function);
    fire(event:string, ...args: any[]);
    
}

export interface Scrollable extends Cell{
    scrollRequired():bool;
    getInitialBox():Box;
    getFirstItemBox():Box;
    pageSize:number;
    scrollAfterNo:number;
    loadNextPage();
    unique?:bool;
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
    onStartDrag:(el:HTMLElement)=>bool;//if want drag to begin -> return true!!!
    onDrag:(box:Box)=>any;
    onDrop:(box:Box)=>any;
    confirmDrag(b:Box):Box;
}


export interface Uploader{
    binary:bool;
    getFileInput():HTMLInputElement;
    getDropArea():HTMLElement;
    loadDone();
    fileChoosen();
    file:string;
    fileName:string;
    fileType:string;
    rawFile:any;
    needLoad(fname:string):bool;
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