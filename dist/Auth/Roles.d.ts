import Context from "./../Context";
import * as Pointer from "./../Pointer";
import * as HTTP from "./../HTTP";
import * as PersistedDocument from "./../PersistedDocument";
import * as RetrievalPreferences from "./../RetrievalPreferences";
import * as PersistedRole from "./PersistedRole";
import * as Role from "./Role";
export declare abstract class Class {
    private context;
    constructor(context: Context);
    createChild<T extends Role.Class>(parentRole: string | Pointer.Class, role: T, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChild<T extends Role.Class>(parentRole: string | Pointer.Class, role: T, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    get<T>(roleURI: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedRole.Class, HTTP.Response.Class]>;
    listAgents(roleURI: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class[], HTTP.Response.Class]>;
    getAgents<T>(roleURI: string, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    getAgents<T>(roleURI: string, retrievalPreferences?: RetrievalPreferences.Class, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    addAgent(roleURI: string, agent: Pointer.Class | string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addAgents(roleURI: string, agents: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAgent(roleURI: string, agent: Pointer.Class | string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAgents(roleURI: string, agents: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    private resolveURI(agentURI);
    private getAgentsAccessPoint(roleURI);
    private getContainerURI();
}
export default Class;