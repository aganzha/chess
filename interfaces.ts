export interface Cell{
    parent:Cell;
    append(cell:Cell);
    render():HTMLElement;
    classes:string[];
    id:string;
}
