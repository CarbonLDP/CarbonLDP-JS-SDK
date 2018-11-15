export interface PlatformPaths {
	paths?:{
		[document:string]:string | DocumentPaths;
	};
}

export interface DocumentPaths extends PlatformPaths {
	slug?:string;
}

export interface ContextSettings extends PlatformPaths {
	vocabulary?:string;
}

export interface CarbonLDPSettings extends ContextSettings {
	host:string;
	port?:number;
	ssl?:boolean;
}
