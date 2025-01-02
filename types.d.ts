/**
 * Value types that can be encoded to MessagePack.
 */
export type ValueType =
    | number
    | bigint
    | string
    | boolean
    | null
    | Uint8Array
    | readonly ValueType[]
    | ValueMap;

/**
 * Value map that can be encoded to MessagePack.
 */
export interface ValueMap {
    /** Value map entry */
    [index: string | number]: ValueType;
}
