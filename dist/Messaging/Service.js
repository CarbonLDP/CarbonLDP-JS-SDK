"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sockjs_client_1 = __importDefault(require("sockjs-client"));
var webstomp = __importStar(require("webstomp-client"));
var Errors_1 = require("../Errors");
var FreeResources_1 = require("../FreeResources/FreeResources");
var JSONLD_1 = require("../JSONLD");
var Utils_1 = require("../Utils");
var EventMessage_1 = require("./EventMessage");
var DEFAULT_OPTIONS = {
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
};
var MessagingService = (function () {
    function MessagingService(context) {
        this.context = context;
        this._subscriptionsQueue = [];
        this._options = DEFAULT_OPTIONS;
    }
    MessagingService.prototype.setOptions = function (options) {
        this._options = __assign({}, DEFAULT_OPTIONS, options);
    };
    MessagingService.prototype.connect = function (onConnect, onError) {
        if (this._client) {
            var error = new Errors_1.IllegalStateError("The messaging service is already connect" + (this._client.connected ? "ed" : "ing") + ".");
            if (onError)
                onError(error);
            throw error;
        }
        if (this._subscriptionsMap)
            this._subscriptionsMap.clear();
        this.reconnect(onConnect, onError);
    };
    MessagingService.prototype.reconnect = function (onConnect, onError) {
        var _this = this;
        if (onError === void 0) { onError = this._broadcastError.bind(this); }
        if (!this._client)
            this._attempts = 0;
        else if (this._client.connected)
            this._client.disconnect();
        if (!this._subscriptionsMap)
            this._subscriptionsMap = new Map();
        var sock = new sockjs_client_1.default(this.context.resolve("/broker"));
        this._client = webstomp.over(sock, {
            debug: false,
            heartbeat: false,
        });
        this._client.connect({}, function () {
            _this._subscriptionsQueue.forEach(function (callback) { return callback(); });
            _this._subscriptionsQueue.length = 0;
            _this._attempts = 0;
            if (onConnect)
                onConnect();
        }, function (errorFrameOrEvent) {
            var canReconnect = _this._options.maxReconnectAttempts === null || _this._options.maxReconnectAttempts >= _this._attempts;
            var errorMessage;
            if ("reason" in errorFrameOrEvent) {
                if (canReconnect) {
                    if (++_this._attempts === 1)
                        _this._saveSubscriptions();
                    setTimeout(function () { return _this.reconnect(onConnect, onError); }, _this._options.reconnectDelay);
                    return;
                }
                _this._client = null;
                _this._subscriptionsQueue.length = 0;
                errorMessage = "CloseEventError: " + errorFrameOrEvent.reason;
            }
            else if ("body" in errorFrameOrEvent) {
                if (!_this._client.connected && canReconnect)
                    return;
                errorMessage = errorFrameOrEvent.headers["message"] + ": " + errorFrameOrEvent.body.trim();
            }
            else {
                errorMessage = "Unknown error: " + errorFrameOrEvent;
            }
            onError(new Error(errorMessage));
        });
    };
    MessagingService.prototype.subscribe = function (destination, onEvent, onError) {
        if (!this._client)
            this.connect();
        if (!this._subscriptionsMap.has(destination))
            this._subscriptionsMap.set(destination, new Map());
        var callbacksMap = this._subscriptionsMap.get(destination);
        if (callbacksMap.has(onEvent))
            return;
        var subscriptionID = Utils_1.UUIDUtils.generate();
        callbacksMap.set(onEvent, {
            id: subscriptionID,
            errorCallback: onError,
        });
        var subscribeTo = this._makeSubscription(subscriptionID, destination, onEvent, onError);
        if (this._client.connected)
            return subscribeTo();
        this._subscriptionsQueue.push(subscribeTo);
    };
    MessagingService.prototype.unsubscribe = function (destination, onEvent) {
        if (!this._client || !this._subscriptionsMap || !this._subscriptionsMap.has(destination))
            return;
        var callbackMap = this._subscriptionsMap.get(destination);
        if (!callbackMap.has(onEvent))
            return;
        var subscriptionID = callbackMap.get(onEvent).id;
        callbackMap.delete(onEvent);
        if (callbackMap.size === 0)
            this._subscriptionsMap.delete(destination);
        this._client.unsubscribe(subscriptionID);
    };
    MessagingService.prototype._broadcastError = function (error) {
        if (!this._subscriptionsMap)
            return;
        this._subscriptionsMap.forEach(function (callbacksMap) { return callbacksMap.forEach(function (subscription) {
            subscription.errorCallback(error);
        }); });
    };
    MessagingService.prototype._makeSubscription = function (id, destination, eventCallback, errorCallback) {
        var _this = this;
        return function () { return _this._client.subscribe(destination, function (message) {
            new JSONLD_1.JSONLDParser()
                .parse(message.body)
                .then(function (data) {
                var freeResources = FreeResources_1.FreeResources
                    .parseFreeNodes(_this.context.registry, data);
                var eventMessage = freeResources
                    .getPointers(true)
                    .find(EventMessage_1.EventMessage.is);
                if (!eventMessage)
                    throw new Error("No message was returned by the notification.");
                return eventMessage;
            })
                .then(eventCallback)
                .catch(errorCallback);
        }, { id: id }); };
    };
    MessagingService.prototype._saveSubscriptions = function () {
        var _this = this;
        if (this._subscriptionsQueue.length || !this._subscriptionsMap)
            return;
        this._subscriptionsMap.forEach(function (callbackMap, destination) { return callbackMap.forEach(function (subscription, eventCallback) {
            var subscribeTo = _this._makeSubscription(subscription.id, destination, eventCallback, subscription.errorCallback);
            _this._subscriptionsQueue.push(subscribeTo);
        }); });
    };
    return MessagingService;
}());
exports.MessagingService = MessagingService;

//# sourceMappingURL=Service.js.map
