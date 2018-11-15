export type AnyJasmineValue<T> = T extends object ?
	{
		[P in keyof T]?:
		| T[P] extends object ?
			| T[P] extends any[] ?
				| T[P]
				| jasmine.Any
				| jasmine.ArrayContaining<T[P][any]>
				| jasmine.ObjectContaining<T[P][any]>[]
				| AnyJasmineValue<T[P][any]>[]
				:
				| T[P]
				| jasmine.Any
				| jasmine.ObjectContaining<T[P]>
				| AnyJasmineValue<T[P]>
			:
			| T[P]
			| jasmine.Any
	}
	:
	| T
	| jasmine.Any
	;


export type Diff<T extends string, U extends string> = ({ [P in T]:P } & { [P in U]:never } & { [ x:string ]:never })[T];

export type Minus<T, U> = Pick<T, Diff<keyof T, keyof U>>;

export type StrictMinus<T, U> = { [P in Diff<keyof T, keyof U>]:T[P] };
