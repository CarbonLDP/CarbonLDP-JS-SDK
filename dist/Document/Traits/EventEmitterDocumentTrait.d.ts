import { EventEmitterDocumentsRepositoryTrait } from "../../DocumentsRepository/Traits/EventEmitterDocumentsRepositoryTrait";
import { ChildCreated } from "../../Messaging/ChildCreated";
import { DocumentDeleted } from "../../Messaging/DocumentDeleted";
import { DocumentModified } from "../../Messaging/DocumentModified";
import { Event } from "../../Messaging/Event";
import { EventMessage } from "../../Messaging/EventMessage";
import { MemberAdded } from "../../Messaging/MemberAdded";
import { MemberRemoved } from "../../Messaging/MemberRemoved";
import { ModelDecorator } from "../../Model/ModelDecorator";
import { ModelPrototype } from "../../Model/ModelPrototype";
import { ResolvablePointer } from "../../Repository/ResolvablePointer";
import { TransientDocument } from "../TransientDocument";
export interface BaseEventEmitterDocumentTrait {
    $repository: EventEmitterDocumentsRepositoryTrait;
}
export interface EventEmitterDocumentTrait extends TransientDocument, ResolvablePointer {
    $repository: EventEmitterDocumentsRepositoryTrait;
    on(event: Event.CHILD_CREATED, uriPattern: string, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    on(event: Event.CHILD_CREATED, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    on(event: Event.DOCUMENT_MODIFIED, uriPattern: string, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    on(event: Event.DOCUMENT_MODIFIED, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    on(event: Event.DOCUMENT_DELETED, uriPattern: string, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    on(event: Event.DOCUMENT_DELETED, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    on(event: Event.MEMBER_ADDED, uriPattern: string, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    on(event: Event.MEMBER_ADDED, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    on(event: Event.MEMBER_REMOVED, uriPattern: string, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    on(event: Event.MEMBER_REMOVED, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    on(event: Event | string, uriPattern: string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    on(event: Event | string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    off(event: Event.CHILD_CREATED, uriPattern: string, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    off(event: Event.CHILD_CREATED, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    off(event: Event.DOCUMENT_MODIFIED, uriPattern: string, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    off(event: Event.DOCUMENT_MODIFIED, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    off(event: Event.DOCUMENT_DELETED, uriPattern: string, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    off(event: Event.DOCUMENT_DELETED, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    off(event: Event.MEMBER_ADDED, uriPattern: string, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    off(event: Event.MEMBER_ADDED, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    off(event: Event.MEMBER_REMOVED, uriPattern: string, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    off(event: Event.MEMBER_REMOVED, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    off(event: Event | string, uriPattern: string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    off(event: Event | string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    one(event: Event.CHILD_CREATED, uriPattern: string, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    one(event: Event.CHILD_CREATED, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    one(event: Event.DOCUMENT_MODIFIED, uriPattern: string, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    one(event: Event.DOCUMENT_MODIFIED, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    one(event: Event.DOCUMENT_DELETED, uriPattern: string, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    one(event: Event.DOCUMENT_DELETED, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    one(event: Event.MEMBER_ADDED, uriPattern: string, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    one(event: Event.MEMBER_ADDED, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    one(event: Event.MEMBER_REMOVED, uriPattern: string, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    one(event: Event.MEMBER_REMOVED, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    one(event: Event | string, uriPattern: string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    one(event: Event | string, onEvent: (message: EventMessage) => void, onError?: (error: Error) => void): void;
    onChildCreated(uriPattern: string, onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    onChildCreated(onEvent: (message: ChildCreated) => void, onError?: (error: Error) => void): void;
    onDocumentModified(uriPattern: string, onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    onDocumentModified(onEvent: (message: DocumentModified) => void, onError?: (error: Error) => void): void;
    onDocumentDeleted(uriPattern: string, onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    onDocumentDeleted(onEvent: (message: DocumentDeleted) => void, onError?: (error: Error) => void): void;
    onMemberAdded(uriPattern: string, onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    onMemberAdded(onEvent: (message: MemberAdded) => void, onError?: (error: Error) => void): void;
    onMemberRemoved(uriPattern: string, onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
    onMemberRemoved(onEvent: (message: MemberRemoved) => void, onError?: (error: Error) => void): void;
}
export declare type EventEmitterDocumentTraitFactory = ModelPrototype<EventEmitterDocumentTrait, TransientDocument & ResolvablePointer> & ModelDecorator<EventEmitterDocumentTrait, BaseEventEmitterDocumentTrait>;
export declare const EventEmitterDocumentTrait: EventEmitterDocumentTraitFactory;
