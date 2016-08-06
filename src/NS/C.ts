export let namespace:string = "https://carbonldp.com/ns/v1/platform#";

export class Class {
	static get AccessPoint():string { return namespace + "AccessPoint"; }

	static get AddMemberAction():string { return namespace + "AddMemberAction"; }

	static get API():string { return namespace + "API"; }

	static get Document():string { return namespace + "Document"; }

	static get NonReadableMembershipResourceTriples():string { return namespace + "NonReadableMembershipResourceTriples"; }

	static get PreferContainer():string { return namespace + "PreferContainer"; }

	static get PreferContainmentResources():string { return namespace + "PreferContainmentResources"; }

	static get PreferContainmentTriples():string { return namespace + "PreferContainmentTriples"; }

	static get PreferMembershipResources():string { return namespace + "PreferMembershipResources"; }

	static get PreferMembershipTriples():string { return namespace + "PreferMembershipTriples"; }

	static get PreferSelectedMembershipTriples():string { return namespace + "PreferSelectedMembershipTriples"; }

	static get VolatileResource():string { return namespace + "VolatileResource"; }

	static get RDFRepresentation():string { return namespace + "RDFRepresentation"; }

	static get RemoveMemberAction():string { return namespace + "RemoveMemberAction"; }

	static get ErrorResponse():string { return namespace + "ErrorResponse"; }

	static get Error():string { return namespace + "Error"; }

	static get ResponseMetadata():string { return namespace + "ResponseMetadata"; }

	static get ResourceMetadata():string { return namespace + "ResourceMetadata"; }
}

export class Predicate {
	static get accessPoint():string { return namespace + "accessPoint"; }

	static get appRoleMap():string { return namespace + "appRoleMap"; }

	static get bNodeIdentifier():string { return namespace + "bNodeIdentifier"; }

	static get buildDate():string { return namespace + "buildDate"; }

	static get carbonCode():string { return namespace + "carbonCode"; }

	static get created():string { return namespace + "created"; }

	static get defaultInteractionModel():string { return namespace + "defaultInteractionModel"; }

	static get entry():string { return namespace + "entry"; }

	static get error():string { return namespace + "error"; }

	static get eTag():string { return namespace + "eTag"; }

	static get httpStatusCode():string { return namespace + "httpStatusCode"; }

	static get key():string { return namespace + "key"; }

	static get mediaType():string { return namespace + "mediaType"; }

	static get message():string { return namespace + "message"; }

	static get modified():string { return namespace + "modified"; }

	static get requestID():string { return namespace + "requestID"; }

	static get resourceMetadata():string { return namespace + "resourceMetadata"; }

	static get resource():string { return namespace + "resource"; }

	static get size():string { return namespace + "size"; }

	static get targetMember():string { return namespace + "targetMember"; }

	static get version():string { return namespace + "version"; }
}
