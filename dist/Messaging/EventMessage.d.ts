import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { Resource } from "../Resource";
export interface EventMessage extends Resource {
    target: Pointer;
}
export interface EventMessageFactory {
    SCHEMA: ObjectSchema;
    is(value: any): value is EventMessage;
}
export declare const EventMessage: EventMessageFactory;
