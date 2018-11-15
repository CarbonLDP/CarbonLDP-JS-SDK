import { Pointer } from "../Pointer";
import { ProtectedDocument } from "../ProtectedDocument";
import { C } from "../Vocabularies";
import { TransientAccessPointFactory } from "./TransientAccessPoint";
export interface AccessPoint extends ProtectedDocument {
    membershipResource?: Pointer;
    hasMemberRelation?: Pointer;
    isMemberOfRelation?: Pointer;
    insertedContentRelation?: Pointer;
}
export interface AccessPointFactory extends Pick<TransientAccessPointFactory, Exclude<keyof TransientAccessPointFactory, "is">> {
    TYPE: C["AccessPoint"];
    is(value: any): value is AccessPoint;
}
export declare const AccessPoint: AccessPointFactory;
