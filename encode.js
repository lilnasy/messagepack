/** @import { ValueType } from "./types.d.ts" */

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
    encodeSlice(value, context)
    return context[bytes].subarray(0, context[offset])
}

function encodeFloat64(/** @type number */ value, /** @type EncodingContext */ encodingcontext) {
    const bytearray = encodingcontext[bytes]
    let encodingoffset = encodingcontext[offset]
    ensureCapacity(bytearray, encodingoffset + 9)
    bytearray[encodingoffset++] = 0xcb
    const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
    dataView.setFloat64(encodingoffset, value)
    encodingcontext[offset] = encodingoffset + 8
    return
}

function encodeNumber(/** @type number */ num, /** @type EncodingContext */ encodingcontext) {
    if (!Number.isInteger(num)) { // float 64
        return encodeFloat64(num, encodingcontext)
    }

    const bytearray = encodingcontext[bytes]
    let encodingoffset = encodingcontext[offset]
    ensureCapacity(bytearray, encodingoffset + 5)

    if (num < 0) {
        if (num >= -FIVE_BITS) { // negative fixint
            bytearray[encodingcontext[offset]++] = num
            return
        }

        if (num >= -SEVEN_BITS) { // int 8
            bytearray[encodingoffset++] = 0xd0
            bytearray[encodingoffset++] = num
            encodingcontext[offset] = encodingoffset
            return
        }

        if (num >= -FIFTEEN_BITS) { // int 16
            bytearray[encodingoffset++] = 0xd1
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setInt16(encodingoffset, num)
            encodingcontext[offset] = encodingoffset + 2
            return
        }

        if (num >= -THIRTY_ONE_BITS) { // int 32
            bytearray[encodingoffset++] = 0xd2
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setInt32(encodingoffset, num)
            encodingcontext[offset] = encodingoffset + 4
            return
        }

        // float 64
        return encodeFloat64(num, encodingcontext)
    }

    // if the number fits within a positive fixint, use it
    if (num <= 0x7f) {
        bytearray[encodingcontext[offset]++] = num
        return
    }

    if (num < EIGHT_BITS) { // uint8
        bytearray[encodingoffset++] = 0xcc
        bytearray[encodingoffset++] = num
        encodingcontext[offset] = encodingoffset
        return
    }

    if (num < SIXTEEN_BITS) { // uint16
        bytearray[encodingoffset++] = 0xcd
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint16(encodingoffset, num)
        encodingcontext[offset] = encodingoffset + 2
        return
    }

    if (num < THIRTY_TWO_BITS) { // uint32
        bytearray[encodingoffset++] = 0xce
        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
        dataView.setUint32(encodingoffset, num)
        encodingcontext[offset] = encodingoffset + 4
        return
    }

    // float 64
    return encodeFloat64(num, encodingcontext)
}

function encodeSlice(/** @type ValueType */ value, /** @type EncodingContext */ encodingcontext) {
    const bytearray = encodingcontext[bytes]

    if (value === null) {
        bytearray[encodingcontext[offset]++] = 0xc0
        return
    }

    if (value === false) {
        bytearray[encodingcontext[offset]++] = 0xc2
        return
    }

    if (value === true) {
        bytearray[encodingcontext[offset]++] = 0xc3
        return
    }

    if (typeof value === "number") {
        encodeNumber(value, encodingcontext)
        return
    }

    let encodingoffset = encodingcontext[offset]

    if (typeof value === "bigint") {

        const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)

        if (value < 0n) {
            if (value < -SIXTY_THREE_BITS) {
                throw new Error("Cannot safely encode bigint larger than 64 bits")
            }

            bytearray[encodingoffset++] = 0xd3
            dataView.setBigInt64(encodingoffset, value)
            encodingcontext[offset] = encodingoffset + 8
            return
        }

        if (value >= SIXTY_FOUR_BITS) {
            throw new Error("Cannot safely encode bigint larger than 64 bits")
        }

        bytearray[encodingoffset++] = 0xcf
        dataView.setBigUint64(encodingoffset, value)
        encodingcontext[offset] = encodingoffset + 8
        return
    }

    if (typeof value === "string") {
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
        ensureCapacity(bytearray, encodingoffset + 5)
        if (written < FIVE_BITS) { // fixstr
            bytearray[encodingoffset++] = 0xa0 | written
        } else if (written < EIGHT_BITS) { // str 8
            bytearray[encodingoffset++] = 0xd9
            bytearray[encodingoffset++] = written
        } else if (written < SIXTEEN_BITS) { // str 16
            bytearray[encodingoffset++] = 0xda
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint16(encodingoffset, written)
            encodingoffset += 2
        } else if (written < THIRTY_TWO_BITS) { // str 32
            bytearray[encodingoffset++] = 0xdb
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint32(encodingoffset, written)
            encodingoffset += 4
        } else {
            throw new Error(
                "Cannot safely encode string with size larger than 32 bits",
            )
        }
        ensureCapacity(bytearray, encodingoffset + written)
        bytearray.set(stringbytes.subarray(0, written), encodingoffset)
        encodingcontext[offset] = encodingoffset + written
        return
    }

    if (value instanceof Uint8Array) {
        if (value.length < EIGHT_BITS) { // bin 8
            bytearray[encodingoffset++] = 0xc4
            bytearray[encodingoffset++] = value.length
        } else if (value.length < SIXTEEN_BITS) { // bin 16
            bytearray[encodingoffset++] = 0xc5
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint16(encodingoffset, value.length)
            encodingoffset += 2
        } else if (value.length < THIRTY_TWO_BITS) { // bin 32
            bytearray[encodingoffset++] = 0xc6
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint32(encodingoffset, value.length)
            encodingoffset += 4
        } else {
            throw new Error(
                "Cannot safely encode Uint8Array with size larger than 32 bits",
            )
        }
        ensureCapacity(bytearray, encodingoffset + value.length)
        bytearray.set(value, encodingoffset)
        encodingcontext[offset] = encodingoffset + value.length
        return
    }

    if (Array.isArray(value)) {
        if (value.length < FOUR_BITS) { // fixarray
            bytearray[encodingoffset++] = 0x90 | value.length
        } else if (value.length < SIXTEEN_BITS) { // array 16
            bytearray[encodingoffset++] = 0xdc
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint16(encodingoffset, value.length)
            encodingoffset += 2
        } else if (value.length < THIRTY_TWO_BITS) { // array 32
            bytearray[encodingoffset++] = 0xdd
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint32(encodingoffset, value.length)
            encodingoffset += 4
        } else {
            throw new Error(
                "Cannot safely encode array with size larger than 32 bits",
            )
        }

        encodingcontext[offset] = encodingoffset

        for (const element of value) {
            encodeSlice(element, encodingcontext)
        }
        return
    }

    // If value is a plain object
    const prototype = Object.getPrototypeOf(value)

    if (prototype === null || prototype === Object.prototype) {
        const numKeys = Object.keys(value).length

        if (numKeys < FOUR_BITS) { // fixarray
            bytearray[encodingoffset++] = 0x80 | numKeys
        } else if (numKeys < SIXTEEN_BITS) { // map 16
            bytearray[encodingoffset++] = 0xde
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint16(encodingoffset, numKeys)
            encodingoffset += 2
        } else if (numKeys < THIRTY_TWO_BITS) { // map 32
            bytearray[encodingoffset++] = 0xdf
            const dataView = encodingcontext[dataview] ??= createDataView(encodingcontext)
            dataView.setUint32(encodingoffset, numKeys)
            encodingoffset += 4
        } else {
            throw new Error("Cannot safely encode map with size larger than 32 bits")
        }

        encodingcontext[offset] = encodingoffset

        for (const key of Object.keys(value)) {
            encodeSlice(key, encodingcontext)
            encodeSlice(value[key], encodingcontext)
        }
        return
    }

    throw new Error("Cannot safely encode value into messagepack")
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
