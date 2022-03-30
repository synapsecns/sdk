export type ID = symbol;

export interface Distinct {
	readonly id: ID;
}

export type ValueOf<T> = T[keyof T]