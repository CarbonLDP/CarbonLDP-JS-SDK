import { ModelFactory } from "../ModelFactory";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { Resource } from "../Resource";
export interface EventMessage extends Resource {
    target: Pointer;
}
export interface EventMessageFactory extends ModelFactory<EventMessage> {
    SCHEMA: ObjectSchema;
    isDecorated(object: object): object is EventMessage;
}
export declare const SCHEMA: ObjectSchema;
export declare const EventMessage: EventMessageFactory;
export default EventMessage;