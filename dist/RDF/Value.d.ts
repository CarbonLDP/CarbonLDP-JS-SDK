import { PointerLibrary } from "../Pointer";
import { RDFList } from "./List";
import { RDFLiteral } from "./Literal";
import { RDFNode } from "./Node";
export interface RDFValue {
    "@id"?: string;
    "@type"?: string;
    "@value"?: string;
    "@language"?: string;
}
export interface RDFValueFactory {
    parse(pointerLibrary: PointerLibrary, value: RDFLiteral | RDFNode | RDFList | RDFValue | string): any;
}
export declare const RDFValue: RDFValueFactory;
export default RDFValue;
