"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var SockJS = require("sockjs-client");
var webstomp = require("webstomp-client");
var Errors_1 = require("../Errors");
var Parser_1 = require("../JSONLD/Parser");
var Utils_1 = require("../Utils");
exports.DEFAULT_OPTIONS = {
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
};
var Class = (function () {
    function Class(context) {
        this.context = context;
        this._subscriptionsMap = new Map();
        this._subscriptionsQueue = [];
        this._options = exports.DEFAULT_OPTIONS;
    }
    Class.prototype.setOptions = function (options) {
        this._options = __assign({}, exports.DEFAULT_OPTIONS, options);
    };
    Class.prototype.connect = function (onConnect, onError) {
        var _this = this;
        if (this._client) {
            var error = new Errors_1.IllegalStateError("The messaging service is already connect" + (this._client.connected ? "ed" : "ing") + ".");
            if (onError)
                onError(error);
            throw error;
        }
        onError = onError ? onError : function (error) {
            _this._subscriptionsMap.forEach(function (callbacksMap) { return callbacksMap.forEach(function (subscription) {
                subscription.errorCallback(error);
            }); });
        };
        this._attempts = 0;
        this.reconnect(onConnect, onError);
    };
    Class.prototype.reconnect = function (onConnect, onError) {
        var _this = this;
        var sock = new SockJS(this.context.resolve("/broker"));
        this._client = webstomp.over(sock, {
            protocols: webstomp.VERSIONS.supportedProtocols(),
            debug: false,
            heartbeat: false,
            binary: false,
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
            if (isCloseError(errorFrameOrEvent)) {
                if (canReconnect) {
                    if (++_this._attempts === 1)
                        _this.storeSubscriptions();
                    setTimeout(function () { return _this.reconnect(onConnect, onError); }, _this._options.reconnectDelay);
                    return;
                }
                _this._client = null;
                _this._subscriptionsQueue.length = 0;
                errorMessage = "CloseEventError: " + errorFrameOrEvent.reason;
            }
            else if (isFrameError(errorFrameOrEvent)) {
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
    Class.prototype.subscribe = function (destination, onEvent, onError) {
        if (!this._subscriptionsMap.has(destination))
            this._subscriptionsMap.set(destination, new Map());
        var callbacksMap = this._subscriptionsMap.get(destination);
        if (callbacksMap.has(onEvent))
            return;
        var subscriptionID = Utils_1.UUID.generate();
        callbacksMap.set(onEvent, {
            id: subscriptionID,
            errorCallback: onError,
        });
        var subscribeTo = this.makeSubscription(subscriptionID, destination, onEvent, onError);
        if (!this._client)
            this.connect();
        if (this._client.connected)
            return subscribeTo();
        this._subscriptionsQueue.push(subscribeTo);
    };
    Class.prototype.unsubscribe = function (destination, onEvent) {
        if (!this._client || !this._subscriptionsMap.has(destination))
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
    Class.prototype.makeSubscription = function (id, destination, eventCallback, errorCallback) {
        var _this = this;
        return function () { return _this._client.subscribe(destination, function (message) {
            new Parser_1.default()
                .parse(message.body)
                .then(eventCallback)
                .catch(errorCallback);
        }, { id: id }); };
    };
    Class.prototype.storeSubscriptions = function () {
        var _this = this;
        if (this._subscriptionsQueue.length)
            return;
        this._subscriptionsMap.forEach(function (callbackMap, destination) { return callbackMap.forEach(function (subscription, eventCallback) {
            var subscribeTo = _this.makeSubscription(subscription.id, destination, eventCallback, subscription.errorCallback);
            _this._subscriptionsQueue.push(subscribeTo);
        }); });
    };
    return Class;
}());
exports.Class = Class;
function isCloseError(object) {
    return "reason" in object;
}
function isFrameError(object) {
    return "body" in object;
}
exports.default = Class;

//# sourceMappingURL=Service.js.map