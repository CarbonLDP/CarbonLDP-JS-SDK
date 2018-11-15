import { BaseDocument } from "../../Document";
import { Pointer } from "../../Pointer";

export interface BaseRole extends BaseDocument {
	name?:string;
	description?:string;
	parent:Pointer | string;
}
