import { BaseDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import { ACE } from "../ACE";
export interface BaseACL extends BaseDocument {
    protectedDocument: Pointer;
    inherits?: boolean;
    directACEntries?: ACE[];
    immediateDescendantsACEntries?: ACE[];
    allDescendantsACEntries?: ACE[];
}
