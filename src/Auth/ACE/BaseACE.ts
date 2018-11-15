import { Pointer } from "../../Pointer";
import { BaseResource } from "../../Resource";

export interface BaseACE extends BaseResource {
	subject:Pointer;
	permissions:Pointer[];
}
