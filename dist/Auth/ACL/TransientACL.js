"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../../Document");
var Pointer_1 = require("../../Pointer");
var Utils = __importStar(require("../../Utils"));
var Vocabularies_1 = require("../../Vocabularies");
var ACE_1 = require("../ACE");
exports.TransientACL = {
    TYPE: Vocabularies_1.CS.AccessControlList,
    isDecorated: function (object) {
        return Utils.hasPropertyDefined(object, "accessTo")
            && Utils.hasFunction(object, "_parsePointer")
            && Utils.hasFunction(object, "grant")
            && Utils.hasFunction(object, "deny")
            && Utils.hasFunction(object, "configureChildInheritance")
            && Utils.hasFunction(object, "grants")
            && Utils.hasFunction(object, "denies")
            && Utils.hasFunction(object, "getChildInheritance")
            && Utils.hasFunction(object, "remove")
            && Utils.hasFunction(object, "removeChildInheritance");
    },
    decorate: function (object) {
        if (exports.TransientACL.isDecorated(object))
            return object;
        Document_1.TransientDocument.decorate(object);
        var acl = object;
        Object.defineProperties(acl, {
            "_parsePointer": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: parsePointer,
            },
            "grant": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: grant,
            },
            "deny": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: deny,
            },
            "configureChildInheritance": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: configureChildInheritance,
            },
            "grants": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: grants,
            },
            "denies": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: denies,
            },
            "getChildInheritance": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: getChildInheritance,
            },
            "remove": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: remove,
            },
            "removeChildInheritance": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: removeChildInheritance,
            },
        });
        return acl;
    },
};
function parsePointer(element) {
    return Pointer_1.Pointer.is(element) ? element : Pointer_1.Pointer.create({ id: element });
}
function parsePointers(elements) {
    var _this = this;
    var elementsArray = Utils.isArray(elements) ? elements : [elements];
    return elementsArray.map(function (element) { return _this._parsePointer(element); });
}
function configACE(granting, subject, subjectsClass, permissions, aces) {
    var subjectACEs = aces.filter(function (_) { return _.subjects.length === 1 && _.granting === granting && Pointer_1.Pointer.areEqual(_.subjects[0], subject); });
    var ace;
    if (subjectACEs.length === 0) {
        ace = ACE_1.TransientACE.createFrom({
            granting: granting,
            permissions: [],
            subjects: [subject],
            subjectsClass: subjectsClass,
        });
        aces.push(this.createFragment(ace));
    }
    else {
        ace = subjectACEs[0];
    }
    Array.prototype.push.apply(ace.permissions, permissions);
    return ace;
}
function configACEs(granting, subjects, subjectsClass, permissions, aces) {
    var subjectPointers = parsePointers.call(this, subjects);
    var subjectClassPointer = this._parsePointer(subjectsClass);
    var permissionPointers = parsePointers.call(this, permissions);
    for (var _i = 0, subjectPointers_1 = subjectPointers; _i < subjectPointers_1.length; _i++) {
        var subject = subjectPointers_1[_i];
        removePermissionsFrom.call(this, subject, permissionPointers, aces);
        configACE.call(this, granting, subject, subjectClassPointer, permissionPointers, aces);
    }
}
function grant(subjects, subjectsClass, permissions) {
    var acl = this;
    acl.entries = acl.entries || [];
    configACEs.call(this, true, subjects, subjectsClass, permissions, acl.entries);
}
function deny(subjects, subjectsClass, permissions) {
    var acl = this;
    acl.entries = acl.entries || [];
    configACEs.call(this, false, subjects, subjectsClass, permissions, acl.entries);
}
function configureChildInheritance(granting, subjects, subjectsClass, permissions) {
    var acl = this;
    acl.inheritableEntries = acl.inheritableEntries || [];
    configACEs.call(this, granting, subjects, subjectsClass, permissions, acl.inheritableEntries);
}
function grantingFrom(subject, permission, aces) {
    var subjectACEs = aces.filter(function (ace) { return Utils.ArrayUtils.indexOf(ace.subjects, subject, Pointer_1.Pointer.areEqual) !== -1; });
    for (var _i = 0, subjectACEs_1 = subjectACEs; _i < subjectACEs_1.length; _i++) {
        var ace = subjectACEs_1[_i];
        if (Utils.ArrayUtils.indexOf(ace.permissions, permission, Pointer_1.Pointer.areEqual) !== -1)
            return ace.granting;
    }
    return null;
}
function getGranting(subject, permission, aces) {
    if (!aces)
        return null;
    var subjectPointer = this._parsePointer(subject);
    var permissionPointer = this._parsePointer(permission);
    return grantingFrom(subjectPointer, permissionPointer, aces);
}
function grants(subject, permission) {
    var acl = this;
    return getGranting.call(this, subject, permission, acl.entries);
}
function denies(subject, permission) {
    var acl = this;
    var granting = getGranting.call(this, subject, permission, acl.entries);
    return granting === null ? null : !granting;
}
function getChildInheritance(subject, permission) {
    var acl = this;
    return getGranting.call(this, subject, permission, acl.inheritableEntries);
}
function removePermissionsFrom(subject, permissions, aces) {
    if (!aces)
        return;
    var acl = this;
    var opposedAces = acl.entries === aces ? acl.inheritableEntries : acl.entries;
    var subjectACEs = aces.filter(function (ace) { return Utils.ArrayUtils.indexOf(ace.subjects, subject, Pointer_1.Pointer.areEqual) !== -1; });
    for (var _i = 0, subjectACEs_2 = subjectACEs; _i < subjectACEs_2.length; _i++) {
        var ace = subjectACEs_2[_i];
        if (opposedAces && Utils.ArrayUtils.indexOf(opposedAces, ace, Pointer_1.Pointer.areEqual) !== -1) {
            aces.splice(Utils.ArrayUtils.indexOf(aces, ace, Pointer_1.Pointer.areEqual), 1);
            var newACE = configACE.call(this, ace.granting, subject, ace.subjectsClass, ace.permissions, aces);
            subjectACEs.push(newACE);
            continue;
        }
        if (ace.subjects.length > 1) {
            ace.subjects.splice(Utils.ArrayUtils.indexOf(ace.subjects, subject, Pointer_1.Pointer.areEqual), 1);
            var newACE = configACE.call(this, ace.granting, subject, ace.subjectsClass, ace.permissions, aces);
            subjectACEs.push(newACE);
            continue;
        }
        for (var _a = 0, permissions_1 = permissions; _a < permissions_1.length; _a++) {
            var permission = permissions_1[_a];
            var index = Utils.ArrayUtils.indexOf(ace.permissions, permission, Pointer_1.Pointer.areEqual);
            if (index === -1)
                continue;
            ace.permissions.splice(index, 1);
        }
        if (ace.permissions.length === 0) {
            aces.splice(Utils.ArrayUtils.indexOf(aces, ace, Pointer_1.Pointer.areEqual), 1);
            acl._removeFragment(ace);
        }
    }
}
function removePermissions(subject, permissions, aces) {
    var subjectPointer = this._parsePointer(subject);
    var permissionPointers = parsePointers.call(this, permissions);
    removePermissionsFrom.call(this, subjectPointer, permissionPointers, aces);
}
function remove(subject, permissions) {
    var acl = this;
    removePermissions.call(this, subject, permissions, acl.entries);
}
function removeChildInheritance(subject, permissions) {
    var acl = this;
    removePermissions.call(this, subject, permissions, acl.inheritableEntries);
}

//# sourceMappingURL=TransientACL.js.map
