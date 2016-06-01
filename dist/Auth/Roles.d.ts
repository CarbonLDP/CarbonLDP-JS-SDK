import Context from "./../Context";
import * as Pointer from "./../Pointer";
import * as HTTP from "./../HTTP";
import * as Role from "./Role";
export declare abstract class Class {
    private context;
    constructor(context: Context);
    createChild(parentRole: string | Pointer.Class, role: Role.Class, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChild(parentRole: string | Pointer.Class, role: Role.Class, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    private getContainerURI();
}
export default Class;
