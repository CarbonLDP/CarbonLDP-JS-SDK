System.register(["./PersistedResource"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var PersistedResource;
    var Factory;
    return {
        setters:[
            function (PersistedResource_1) {
                PersistedResource = PersistedResource_1;
            }],
        execute: function() {
            Factory = (function () {
                function Factory() {
                }
                Factory.decorate = function (fragment, snapshot) {
                    if (snapshot === void 0) { snapshot = {}; }
                    PersistedResource.Factory.decorate(fragment, snapshot);
                    return fragment;
                };
                return Factory;
            }());
            exports_1("Factory", Factory);
        }
    }
});

//# sourceMappingURL=PersistedFragment.js.map
