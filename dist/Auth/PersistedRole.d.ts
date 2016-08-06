import * as HTTP from "./../HTTP";
import * as PersistedDocument from "./../PersistedDocument";
import * as Pointer from "./../Pointer";
import * as RetrievalPreferences from "./../RetrievalPreferences";
import * as Roles from "./Roles";
export interface Class extends PersistedDocument.Class {
    _roles: Roles.Class;
    name: string;
    agents?: Pointer.Class;
    listAgents(requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    getAgents(requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    getAgents(retrievalPreferencesOrRequestOptions?: RetrievalPreferences.Class, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    addAgent(agent: Pointer.Class | string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addAgents(agents: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAgent(agent: Pointer.Class | string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAgents(agents: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
}
export declare class Factory {
    static hasClassProperties(object: Object): boolean;
    static is(object: Object): boolean;
    static decorate<T extends Object>(object: T, roles: Roles.Class): T & Class;
}
export default Class;