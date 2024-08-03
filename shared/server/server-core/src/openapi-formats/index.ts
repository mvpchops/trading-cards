import { isValid } from "ulidx";

type FormatValue<T extends string | number> = T;

export const isUlidFormat = (value: FormatValue<string>): boolean =>
	isValid(value);
