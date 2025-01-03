/** @import { ValueType, ValueMap } from "./types.d.ts" */

/**
 * @typedef {[
 *     bytes: Uint8Array,
 *     offset: number,
 *     dataview: DataView | null
 * ]} EncodingContext
 */

const bytes = 0
const offset = 1
const dataview = 2

/**
 * @typedef {[
 *     encoder: TextEncoder
 *     stringbytes: Uint8Array
 * ]} StringEncoderContext
 */

/** @type { StringEncoderContext | null } */
let stringencodercontext = null

const FOUR_BITS = 16
const FIVE_BITS = 32
const SEVEN_BITS = 128
const EIGHT_BITS = 256
const FIFTEEN_BITS = 32768
const SIXTEEN_BITS = 65536
const THIRTY_ONE_BITS = 2147483648
const THIRTY_TWO_BITS = 4294967296
const SIXTY_THREE_BITS = 9223372036854775808n
const SIXTY_FOUR_BITS = 18446744073709551616n

/**
 * Encode a value to [MessagePack](https://msgpack.org/) binary format.
 *
 * @example Usage
 * ```ts
 * import { encode } from "@messagepack/messagepack"
 * import { assertEquals } from "node:assert"
 *
 * const obj = {
 *      arr: [1, 2, 3],
 *     map: {
 *         foo: "bar"
 *     }
 * }
 *
 * const encoded = encode(obj)
 * assertEquals(encoded.length, 31)
 * ```
 *
 * @param value Value to encode to MessagePack binary format.
 * @returns Encoded MessagePack binary data.
 */
export function encode(/** @type ValueType */ value) {
    /** @type EncodingContext */
    const context = [
        new Uint8Array(new ArrayBuffer(4096, {
            maxByteLength: 16 * 1024 * 1024
        })),
        0,
        null
    ]
    encodeValue(value, context)
    return context[bytes].subarray(0, context[offset])
}


function encodeValue(/** @type ValueType */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]

    if (value === null) {
        byteArray[encodingcontext[offset]++] = 0xc0
    } else if (value === false) {
        byteArray[encodingcontext[offset]++] = 0xc2
    } else if (value === true) {
        byteArray[encodingcontext[offset]++] = 0xc3
    } else if (typeof value === "number") {
        encodeNumber(value, encodingcontext)
    } else if (typeof value === "bigint") {
        encodeBigInt(value, encodingcontext)
    } else if (typeof value === "string") {
        encodeString(value, encodingcontext)
    } else if (value instanceof Uint8Array) {
        encodeBytes(value, encodingcontext)
    } else if (Array.isArray(value)) {
        encodeArray(value, encodingcontext)
    } else {
        const prototype = Object.getPrototypeOf(value)
        if (prototype === null || prototype === Object.prototype) {
            encodeMap(value, encodingcontext)
        } else {
            // If value is a plain object
            throw new Error("Cannot safely encode value into messagepack")
        }
    }
}

function encodeNumber(/** @type number */ num, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    ensureCapacity(byteArray, encodingOffset + 9)

    if (Number.isInteger(num) === false) {
        encodeFloat64(num, encodingcontext)
    } else if (0 > num && num >= -FIVE_BITS) { // negative fixint
        byteArray[encodingcontext[offset]++] = num
    } else if (0 > num && num >= -SEVEN_BITS) { // negative int 8
        byteArray[encodingOffset++] = 0xd0
        byteArray[encodingOffset++] = num
        encodingcontext[offset] = encodingOffset
    } else if (0 > num && num >= -FIFTEEN_BITS) { // negative int 16
        byteArray[encodingOffset++] = 0xd1
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setInt16(encodingOffset, num)
        encodingcontext[offset] = encodingOffset + 2
    } else if (0 > num && num >= -THIRTY_ONE_BITS) { // negative int 32
        byteArray[encodingOffset++] = 0xd2
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setInt32(encodingOffset, num)
        encodingcontext[offset] = encodingOffset + 4
    } else if (0 > num) { // large negative int is encoded as 64-bit float
        encodeFloat64(num, encodingcontext)
    } else if (num <= 0x7f) { // positive fixint
        byteArray[encodingcontext[offset]++] = num
    } else if (num < EIGHT_BITS) { // uint8
        byteArray[encodingOffset++] = 0xcc
        byteArray[encodingOffset++] = num
        encodingcontext[offset] = encodingOffset
    } else if (num < SIXTEEN_BITS) { // uint16
        byteArray[encodingOffset++] = 0xcd
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingOffset, num)
        encodingcontext[offset] = encodingOffset + 2
    } else if (num < THIRTY_TWO_BITS) { // uint32
        byteArray[encodingOffset++] = 0xce
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingOffset, num)
        encodingcontext[offset] = encodingOffset + 4
    } else { // large positive int
        encodeFloat64(num, encodingcontext)
    }
}

function encodeFloat64(/** @type number */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]
    ensureCapacity(byteArray, encodingOffset + 9)
    byteArray[encodingOffset++] = 0xcb
    const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
    dataView.setFloat64(encodingOffset, value)
    encodingcontext[offset] = encodingOffset + 8
}

function encodeBigInt(/** @type bigint */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)

    ensureCapacity(byteArray, encodingOffset + 9)
    if (value < 0n) {
        if (value < -SIXTY_THREE_BITS) {
            throw new Error("Cannot safely encode bigint larger than 64 bits")
        }

        byteArray[encodingOffset++] = 0xd3
        dataView.setBigInt64(encodingOffset, value)
        encodingcontext[offset] = encodingOffset + 8
    } else if (value >= SIXTY_FOUR_BITS) {
        throw new Error("Cannot safely encode bigint larger than 64 bits")
    } else {        
        byteArray[encodingOffset++] = 0xcf
        dataView.setBigUint64(encodingOffset, value)
        encodingcontext[offset] = encodingOffset + 8
    }
}

function encodeString(/** @type string */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    const [
        encoder,
        stringbytes
    ] = stringencodercontext ??= [
        new TextEncoder(),
        new Uint8Array(new ArrayBuffer(
            Math.min(4096, value.length * 3),
            { maxByteLength: 16 * 1024 * 1024 }
        ))
    ]
    let { read, written,} = encoder.encodeInto(value, stringbytes)
    if (read < value.length) {
        ensureCapacity(stringbytes, written + (value.length - read) * 3)
        const refill = encoder.encodeInto(value.slice(read), stringbytes.subarray(written))
        read += refill.read
        written += refill.written
    }
    ensureCapacity(byteArray, encodingOffset + 5)
    if (written < FIVE_BITS) { // fixstr
        byteArray[encodingOffset++] = 0xa0 | written
    } else if (written < EIGHT_BITS) { // str 8
        byteArray[encodingOffset++] = 0xd9
        byteArray[encodingOffset++] = written
    } else if (written < SIXTEEN_BITS) { // str 16
        byteArray[encodingOffset++] = 0xda
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingOffset, written)
        encodingOffset += 2
    } else if (written < THIRTY_TWO_BITS) { // str 32
        byteArray[encodingOffset++] = 0xdb
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingOffset, written)
        encodingOffset += 4
    } else {
        throw new Error(
            "Cannot safely encode string with size larger than 32 bits",
        )
    }
    ensureCapacity(byteArray, encodingOffset + written)
    byteArray.set(stringbytes.subarray(0, written), encodingOffset)
    encodingcontext[offset] = encodingOffset + written
}

function encodeBytes(/** @type Uint8Array */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    ensureCapacity(byteArray, encodingOffset + 5)
    if (value.length < EIGHT_BITS) { // bin 8
        byteArray[encodingOffset++] = 0xc4
        byteArray[encodingOffset++] = value.length
    } else if (value.length < SIXTEEN_BITS) { // bin 16
        byteArray[encodingOffset++] = 0xc5
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingOffset, value.length)
        encodingOffset += 2
    } else if (value.length < THIRTY_TWO_BITS) { // bin 32
        byteArray[encodingOffset++] = 0xc6
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingOffset, value.length)
        encodingOffset += 4
    } else {
        throw new Error(
            "Cannot safely encode Uint8Array with size larger than 32 bits",
        )
    }
    ensureCapacity(byteArray, encodingOffset + value.length)
    byteArray.set(value, encodingOffset)
    encodingcontext[offset] = encodingOffset + value.length
}

function encodeArray(/** @type ValueType[] */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    ensureCapacity(byteArray, encodingOffset + 5)
    if (value.length < FOUR_BITS) { // fixarray
        byteArray[encodingOffset++] = 0x90 | value.length
    } else if (value.length < SIXTEEN_BITS) { // array 16
        byteArray[encodingOffset++] = 0xdc
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingOffset, value.length)
        encodingOffset += 2
    } else if (value.length < THIRTY_TWO_BITS) { // array 32
        byteArray[encodingOffset++] = 0xdd
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingOffset, value.length)
        encodingOffset += 4
    } else {
        throw new Error(
            "Cannot safely encode array with size larger than 32 bits",
        )
    }

    encodingcontext[offset] = encodingOffset

    for (const element of value) {
        encodeValue(element, encodingcontext)
    }
}

function encodeMap(/** @type ValueMap */ value, /** @type EncodingContext */ encodingcontext) {
    const byteArray = encodingcontext[bytes]
    let encodingOffset = encodingcontext[offset]

    const numKeys = Object.keys(value).length
    
    ensureCapacity(byteArray, encodingOffset + 5)
    if (numKeys < FOUR_BITS) { // fixarray
        byteArray[encodingOffset++] = 0x80 | numKeys
    } else if (numKeys < SIXTEEN_BITS) { // map 16
        byteArray[encodingOffset++] = 0xde
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingOffset, numKeys)
        encodingOffset += 2
    } else if (numKeys < THIRTY_TWO_BITS) { // map 32
        byteArray[encodingOffset++] = 0xdf
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingOffset, numKeys)
        encodingOffset += 4
    } else {
        throw new Error("Cannot safely encode map with size larger than 32 bits")
    }

    encodingcontext[offset] = encodingOffset

    for (const key of Object.keys(value)) {
        encodeValue(key, encodingcontext)
        encodeValue(value[key], encodingcontext)
    }
}

function ensureCapacity(/** @type Uint8Array */ bytes, /** @type number */ capacity) {
    let newsize = bytes.byteLength
    while (newsize < capacity) {
        newsize *= 2
    }
    if (newsize > bytes.byteLength) {
        bytes.buffer.resize(newsize)
    }
}

function createDataView(/** @type EncodingContext */ encodingcontext) {
    return new DataView(encodingcontext[bytes].buffer)
}
