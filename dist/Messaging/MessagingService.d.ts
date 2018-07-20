import { DocumentsContext } from "../Context/DocumentsContext";
import { EventMessage } from "./EventMessage";
import { MessagingOptions } from "./MessagingOptions";
export declare class MessagingService {
    readonly context: DocumentsContext;
    private _options;
    private _attempts;
    private _client?;
    private _subscriptionsMap;
    private _subscriptionsQueue;
    constructor(context: DocumentsContext);
    setOptions(options: MessagingOptions): void;
    connect(onConnect?: () => void, onError?: (error: Error) => void): void;
    reconnect(onConnect?: () => void, onError?: (error: Error) => void): void;
    subscribe(destination: string, onEvent: (data: EventMessage) => void, onError: (error: Error) => void): void;
    unsubscribe(destination: string, onEvent: (data: EventMessage) => void): void;
    private __broadcastError;
    private __makeSubscription;
    private __saveSubscriptions;
}