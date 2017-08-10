import * as Pointer from "./../Pointer";
export interface BindingObject {
    [binding: string]: string | number | boolean | Date | Pointer.Class;
}
export interface Class<T = BindingObject> {
    vars: string[];
    bindings: T[];
}
export default Class;
