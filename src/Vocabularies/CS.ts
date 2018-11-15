export interface CS {
	namespace:"https://carbonldp.com/ns/v1/security#";

	AccessControlEntry:"https://carbonldp.com/ns/v1/security#AccessControlEntry";
	AccessControlList:"https://carbonldp.com/ns/v1/security#AccessControlList";
	AddMember:"https://carbonldp.com/ns/v1/security#AddMember";
	AllDescendantsACEntry:"https://carbonldp.com/ns/v1/security#AllDescendantsACEntry";
	AllOrigins:"https://carbonldp.com/ns/v1/security#AllOrigins";
	AnonymousUser:"https://carbonldp.com/ns/v1/security#AnonymousUser";
	AuthenticatedUser:"https://carbonldp.com/ns/v1/security#AuthenticatedUser";
	AuthenticatedUserInformationAccessor:"https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor";
	AuthenticatedUserMetadata:"https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata";
	CompleteACReport:"https://carbonldp.com/ns/v1/security#CompleteACReport";
	ControlAccess:"https://carbonldp.com/ns/v1/security#ControlAccess";
	CreateAccessPoint:"https://carbonldp.com/ns/v1/security#CreateAccessPoint";
	CreateChild:"https://carbonldp.com/ns/v1/security#CreateChild";
	Creator:"https://carbonldp.com/ns/v1/security#Creator";
	Credentials:"https://carbonldp.com/ns/v1/security#Credentials";
	CredentialSet:"https://carbonldp.com/ns/v1/security#CredentialSet";
	Delete:"https://carbonldp.com/ns/v1/security#Delete";
	DetailedUserACReport:"https://carbonldp.com/ns/v1/security#DetailedUserACReport";
	DirectACEntry:"https://carbonldp.com/ns/v1/security#DirectACEntry";
	GrantingStep:"https://carbonldp.com/ns/v1/security#GrantingStep";
	ImmediateDescendantsACEntry:"https://carbonldp.com/ns/v1/security#ImmediateDescendantsACEntry";
	Impersonate:"https://carbonldp.com/ns/v1/security#Impersonate";
	LDAPCredentials:"https://carbonldp.com/ns/v1/security#LDAPCredentials";
	Owner:"https://carbonldp.com/ns/v1/security#Owner";
	PasswordSecret:"https://carbonldp.com/ns/v1/security#PasswordSecret";
	PermissionReport:"https://carbonldp.com/ns/v1/security#PermissionReport";
	PreferAuthToken:"https://carbonldp.com/ns/v1/security#PreferAuthToken";
	PreferCompleteACReport:"https://carbonldp.com/ns/v1/security#PreferCompleteACReport";
	PreferDetailedUserACReport:"https://carbonldp.com/ns/v1/security#PreferDetailedUserACReport";
	PreferSimpleUserACReport:"https://carbonldp.com/ns/v1/security#PreferSimpleUserACReport";
	ProtectedDocument:"https://carbonldp.com/ns/v1/security#ProtectedDocument";
	Read:"https://carbonldp.com/ns/v1/security#Read";
	RemoveMember:"https://carbonldp.com/ns/v1/security#RemoveMember";
	Role:"https://carbonldp.com/ns/v1/security#Role";
	SimpleUserACReport:"https://carbonldp.com/ns/v1/security#SimpleUserACReport";
	SubjectReport:"https://carbonldp.com/ns/v1/security#SubjectReport";
	Ticket:"https://carbonldp.com/ns/v1/security#Ticket";
	TokenCredentials:"https://carbonldp.com/ns/v1/security#TokenCredentials";
	Update:"https://carbonldp.com/ns/v1/security#Update";
	User:"https://carbonldp.com/ns/v1/security#User";
	UsernameAndPasswordCredentials:"https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials";

	accessControlList:"https://carbonldp.com/ns/v1/security#accessControlList";
	allDescendantsACEntry:"https://carbonldp.com/ns/v1/security#allDescendantsACEntry";
	allowsOrigin:"https://carbonldp.com/ns/v1/security#allowsOrigin";
	applied:"https://carbonldp.com/ns/v1/security#applied";
	appliedBy:"https://carbonldp.com/ns/v1/security#appliedBy";
	authenticatedUserMetadata:"https://carbonldp.com/ns/v1/security#authenticatedUserMetadata";
	authToken:"https://carbonldp.com/ns/v1/security#authToken";
	childRole:"https://carbonldp.com/ns/v1/security#childRole";
	creator:"https://carbonldp.com/ns/v1/security#creator";
	credentials:"https://carbonldp.com/ns/v1/security#credentials";
	credentialSet:"https://carbonldp.com/ns/v1/security#credentialSet";
	description:"https://carbonldp.com/ns/v1/security#description";
	directACEntry:"https://carbonldp.com/ns/v1/security#directACEntry";
	expires:"https://carbonldp.com/ns/v1/security#expires";
	forIRI:"https://carbonldp.com/ns/v1/security#forIRI";
	granted:"https://carbonldp.com/ns/v1/security#granted";
	grantingChain:"https://carbonldp.com/ns/v1/security#grantingChain";
	hashedPassword:"https://carbonldp.com/ns/v1/security#hashedPassword";
	immediateDescendantsACEntry:"https://carbonldp.com/ns/v1/security#immediateDescendantsACEntry";
	inheritanceDisabledBy:"https://carbonldp.com/ns/v1/security#inheritanceDisabledBy";
	inherits:"https://carbonldp.com/ns/v1/security#inherits";
	ldapServer:"https://carbonldp.com/ns/v1/security#ldapServer";
	ldapUserDN:"https://carbonldp.com/ns/v1/security#ldapUserDN";
	name:"https://carbonldp.com/ns/v1/security#name";
	owner:"https://carbonldp.com/ns/v1/security#owner";
	parentRole:"https://carbonldp.com/ns/v1/security#parentRole";
	password:"https://carbonldp.com/ns/v1/security#password";
	passwordSecret:"https://carbonldp.com/ns/v1/security#passwordSecret";
	permission:"https://carbonldp.com/ns/v1/security#permission";
	permissionReport:"https://carbonldp.com/ns/v1/security#permissionReport";
	protectedDocument:"https://carbonldp.com/ns/v1/security#protectedDocument";
	rootContainer:"https://carbonldp.com/ns/v1/security#rootContainer";
	subject:"https://carbonldp.com/ns/v1/security#subject";
	subjectReport:"https://carbonldp.com/ns/v1/security#subjectReport";
	ticketKey:"https://carbonldp.com/ns/v1/security#ticketKey";
	token:"https://carbonldp.com/ns/v1/security#token";
	user:"https://carbonldp.com/ns/v1/security#user";
	username:"https://carbonldp.com/ns/v1/security#username";
}

export const CS:CS = {
	namespace: "https://carbonldp.com/ns/v1/security#",

	AccessControlEntry: "https://carbonldp.com/ns/v1/security#AccessControlEntry",
	AccessControlList: "https://carbonldp.com/ns/v1/security#AccessControlList",
	AddMember: "https://carbonldp.com/ns/v1/security#AddMember",
	AllDescendantsACEntry: "https://carbonldp.com/ns/v1/security#AllDescendantsACEntry",
	AllOrigins: "https://carbonldp.com/ns/v1/security#AllOrigins",
	AnonymousUser: "https://carbonldp.com/ns/v1/security#AnonymousUser",
	AuthenticatedUser: "https://carbonldp.com/ns/v1/security#AuthenticatedUser",
	AuthenticatedUserInformationAccessor: "https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor",
	AuthenticatedUserMetadata: "https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata",
	CompleteACReport: "https://carbonldp.com/ns/v1/security#CompleteACReport",
	ControlAccess: "https://carbonldp.com/ns/v1/security#ControlAccess",
	CreateAccessPoint: "https://carbonldp.com/ns/v1/security#CreateAccessPoint",
	CreateChild: "https://carbonldp.com/ns/v1/security#CreateChild",
	Creator: "https://carbonldp.com/ns/v1/security#Creator",
	Credentials: "https://carbonldp.com/ns/v1/security#Credentials",
	CredentialSet: "https://carbonldp.com/ns/v1/security#CredentialSet",
	Delete: "https://carbonldp.com/ns/v1/security#Delete",
	DetailedUserACReport: "https://carbonldp.com/ns/v1/security#DetailedUserACReport",
	DirectACEntry: "https://carbonldp.com/ns/v1/security#DirectACEntry",
	GrantingStep: "https://carbonldp.com/ns/v1/security#GrantingStep",
	ImmediateDescendantsACEntry: "https://carbonldp.com/ns/v1/security#ImmediateDescendantsACEntry",
	Impersonate: "https://carbonldp.com/ns/v1/security#Impersonate",
	LDAPCredentials: "https://carbonldp.com/ns/v1/security#LDAPCredentials",
	Owner: "https://carbonldp.com/ns/v1/security#Owner",
	PasswordSecret: "https://carbonldp.com/ns/v1/security#PasswordSecret",
	PermissionReport: "https://carbonldp.com/ns/v1/security#PermissionReport",
	PreferAuthToken: "https://carbonldp.com/ns/v1/security#PreferAuthToken",
	PreferCompleteACReport: "https://carbonldp.com/ns/v1/security#PreferCompleteACReport",
	PreferDetailedUserACReport: "https://carbonldp.com/ns/v1/security#PreferDetailedUserACReport",
	PreferSimpleUserACReport: "https://carbonldp.com/ns/v1/security#PreferSimpleUserACReport",
	ProtectedDocument: "https://carbonldp.com/ns/v1/security#ProtectedDocument",
	Read: "https://carbonldp.com/ns/v1/security#Read",
	RemoveMember: "https://carbonldp.com/ns/v1/security#RemoveMember",
	Role: "https://carbonldp.com/ns/v1/security#Role",
	SimpleUserACReport: "https://carbonldp.com/ns/v1/security#SimpleUserACReport",
	SubjectReport: "https://carbonldp.com/ns/v1/security#SubjectReport",
	Ticket: "https://carbonldp.com/ns/v1/security#Ticket",
	TokenCredentials: "https://carbonldp.com/ns/v1/security#TokenCredentials",
	Update: "https://carbonldp.com/ns/v1/security#Update",
	User: "https://carbonldp.com/ns/v1/security#User",
	UsernameAndPasswordCredentials: "https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials",

	accessControlList: "https://carbonldp.com/ns/v1/security#accessControlList",
	allDescendantsACEntry: "https://carbonldp.com/ns/v1/security#allDescendantsACEntry",
	allowsOrigin: "https://carbonldp.com/ns/v1/security#allowsOrigin",
	applied: "https://carbonldp.com/ns/v1/security#applied",
	appliedBy: "https://carbonldp.com/ns/v1/security#appliedBy",
	authToken: "https://carbonldp.com/ns/v1/security#authToken",
	authenticatedUserMetadata: "https://carbonldp.com/ns/v1/security#authenticatedUserMetadata",
	childRole: "https://carbonldp.com/ns/v1/security#childRole",
	creator: "https://carbonldp.com/ns/v1/security#creator",
	credentials: "https://carbonldp.com/ns/v1/security#credentials",
	credentialSet: "https://carbonldp.com/ns/v1/security#credentialSet",
	description: "https://carbonldp.com/ns/v1/security#description",
	directACEntry: "https://carbonldp.com/ns/v1/security#directACEntry",
	expires: "https://carbonldp.com/ns/v1/security#expires",
	forIRI: "https://carbonldp.com/ns/v1/security#forIRI",
	granted: "https://carbonldp.com/ns/v1/security#granted",
	grantingChain: "https://carbonldp.com/ns/v1/security#grantingChain",
	hashedPassword: "https://carbonldp.com/ns/v1/security#hashedPassword",
	immediateDescendantsACEntry: "https://carbonldp.com/ns/v1/security#immediateDescendantsACEntry",
	inheritanceDisabledBy: "https://carbonldp.com/ns/v1/security#inheritanceDisabledBy",
	inherits: "https://carbonldp.com/ns/v1/security#inherits",
	ldapServer: "https://carbonldp.com/ns/v1/security#ldapServer",
	ldapUserDN: "https://carbonldp.com/ns/v1/security#ldapUserDN",
	name: "https://carbonldp.com/ns/v1/security#name",
	owner: "https://carbonldp.com/ns/v1/security#owner",
	parentRole: "https://carbonldp.com/ns/v1/security#parentRole",
	password: "https://carbonldp.com/ns/v1/security#password",
	passwordSecret: "https://carbonldp.com/ns/v1/security#passwordSecret",
	permission: "https://carbonldp.com/ns/v1/security#permission",
	permissionReport: "https://carbonldp.com/ns/v1/security#permissionReport",
	protectedDocument: "https://carbonldp.com/ns/v1/security#protectedDocument",
	rootContainer: "https://carbonldp.com/ns/v1/security#rootContainer",
	subject: "https://carbonldp.com/ns/v1/security#subject",
	subjectReport: "https://carbonldp.com/ns/v1/security#subjectReport",
	ticketKey: "https://carbonldp.com/ns/v1/security#ticketKey",
	token: "https://carbonldp.com/ns/v1/security#token",
	user: "https://carbonldp.com/ns/v1/security#user",
	username: "https://carbonldp.com/ns/v1/security#username",
};
