const namespace:string = "https://carbonldp.com/ns/v1/security#";

class Class {
	static get Application():string { return namespace + "Application"; }
	static get Token():string { return namespace + "Token"; }
	static get AllOrigins():string { return namespace + "AllOrigins"; }
	static get Agent():string { return namespace + "Agent"; }
	static get AppRole():string { return namespace + "AppRole"; }
}

class Predicate {
	static get namae():string { return namespace + "name"; }
	static get allowsOrigin():string { return namespace + "allowsOrigin"; }
	static get rootContainer():string { return namespace + "rootContainer"; }
	static get tokenKey():string { return namespace + "tokenKey"; }
	static get expirationTime():string { return namespace + "expirationTime"; }
	static get password():string { return namespace + "password"; }
	static get description():string { return namespace + "description"; }
}

export {
	namespace,
	Class,
	Predicate
};
