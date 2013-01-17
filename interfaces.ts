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
}
export interface ScreenMap{
    name:string;
    screen:Screen;
}
export interface ScreenSelector{
    (screens:ScreenMap):Screen;
}
