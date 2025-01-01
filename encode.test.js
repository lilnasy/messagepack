// @ts-check
import { test } from "node:test"
import { deepEqual, throws } from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { encode } from "./encode.js"
import { decode } from "./decode.js"


const moduleDir = dirname(fileURLToPath(import.meta.url))
const testdataDir = resolve(moduleDir, "testdata")

test("encode() handles testdata", () => {
    const one = JSON.parse(
        readFileSync(join(testdataDir, "1.json"), "utf8"),
    )
    deepEqual(decode(encode(one)), one)

    const two = JSON.parse(
        readFileSync(join(testdataDir, "2.json"), "utf8"),
    )
    deepEqual(decode(encode(two)), two)

    const three = JSON.parse(
        readFileSync(join(testdataDir, "3.json"), "utf8"),
    )
    deepEqual(decode(encode(three)), three)

    const four = JSON.parse(
        readFileSync(join(testdataDir, "4.json"), "utf8"),
    )
    deepEqual(decode(encode(four)), four)

    const five = JSON.parse(
        readFileSync(join(testdataDir, "5.json"), "utf8"),
    )
    deepEqual(decode(encode(five)), five)
})

test("encode() handles positive numbers", () => {
    deepEqual(encode(1), Uint8Array.of(1))
    deepEqual(decode(encode(1)), 1)

    deepEqual(encode(255), Uint8Array.of(0xcc, 255))
    deepEqual(decode(encode(255)), 255)

    deepEqual(encode(2000), Uint8Array.of(0xcd, 7, 208))
    deepEqual(decode(encode(2000)), 2000)

    deepEqual(encode(70000), Uint8Array.of(0xce, 0, 1, 17, 112))
    deepEqual(decode(encode(70000)), 70000)

    deepEqual(
        encode(20000000000),
        Uint8Array.of(0xcb, 66, 18, 160, 95, 32, 0, 0, 0),
    )
    deepEqual(decode(encode(20000000000)), 20000000000)
})

test("encode() handles negative numbers", () => {
    deepEqual(encode(-1), Uint8Array.of(255))
    deepEqual(decode(encode(-1)), -1)

    deepEqual(encode(-127), Uint8Array.of(0xd0, 129))
    deepEqual(decode(encode(-127)), -127)

    deepEqual(encode(-1000), Uint8Array.of(0xd1, 252, 24))
    deepEqual(decode(encode(-1000)), -1000)

    deepEqual(encode(-60000), Uint8Array.of(0xd2, 255, 255, 21, 160))
    deepEqual(decode(encode(-60000)), -60000)

    deepEqual(
        encode(-600000000000),
        Uint8Array.of(0xcb, 194, 97, 118, 89, 46, 0, 0, 0),
    )
    deepEqual(decode(encode(-600000000000)), -600000000000)
})

test("encode() handles floats", () => {
    deepEqual(
        encode(0.3),
        Uint8Array.of(0xcb, 63, 211, 51, 51, 51, 51, 51, 51),
    )
    deepEqual(decode(encode(0.3)), 0.3)
})

test("encode() handles bigints", () => {
    deepEqual(encode(0n), Uint8Array.of(0xcf, 0, 0, 0, 0, 0, 0, 0, 0))
    deepEqual(decode(encode(0n)), 0n)
    deepEqual(
        encode(-10n),
        Uint8Array.of(0xd3, 255, 255, 255, 255, 255, 255, 255, 246),
    )
    deepEqual(decode(encode(-10n)), -10n)
    deepEqual(encode(10n), Uint8Array.of(0xcf, 0, 0, 0, 0, 0, 0, 0, 10))
    deepEqual(decode(encode(10n)), 10n)
    deepEqual(
        encode(9999999999999999999n),
        Uint8Array.of(0xcf, 138, 199, 35, 4, 137, 231, 255, 255),
    )
    deepEqual(decode(encode(9999999999999999999n)), 9999999999999999999n)

    throws(() => encode(99999999999999999999999n))
    throws(() => encode(-99999999999999999999999n))
})

test("encode() handles strings", () => {
    deepEqual(
        encode("hello world"),
        Uint8Array.of(171, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100),
    )
    deepEqual(decode(encode("hello world")), "hello world")

    const mediumString = "a".repeat(255)
    deepEqual(
        encode(mediumString),
        Uint8Array.of(0xd9, 255, ...new Array(mediumString.length).fill(97)),
    )
    deepEqual(decode(encode(mediumString)), mediumString)

    const longString = "a".repeat(256)
    deepEqual(
        encode(longString),
        Uint8Array.of(0xda, 1, 0, ...new Array(longString.length).fill(97)),
    )
    deepEqual(decode(encode(longString)), longString)

    const reallyLongString = "a".repeat(65536)
    deepEqual(
        encode(reallyLongString),
        Uint8Array.of(
            0xdb,
            0,
            1,
            0,
            0,
            ...new Array(reallyLongString.length).fill(97),
        ),
    )
    deepEqual(decode(encode(reallyLongString)), reallyLongString)
})

test("encode() handles Uint8Arrays", () => {
    deepEqual(
        encode(Uint8Array.of(0, 1, 2, 3)),
        Uint8Array.of(0xc4, 4, 0, 1, 2, 3),
    )
    deepEqual(
        encode(new Uint8Array(256)),
        Uint8Array.of(0xc5, 1, 0, ...new Uint8Array(256)),
    )
    deepEqual(
        encode(new Uint8Array(65536)),
        Uint8Array.of(0xc6, 0, 1, 0, 0, ...new Uint8Array(65536)),
    )
})

test("encode() handles arrays", () => {
    const arr0 = []
    deepEqual(decode(encode(arr0)), arr0)

    const arr1 = [1, 2, 3, 4, 5, 6]
    deepEqual(decode(encode(arr1)), arr1)

    const arr2 = new Array(256).fill(0)
    deepEqual(decode(encode(arr2)), arr2)

    const nestedArr = [[1, 2, 3], [1, 2], 5]
    deepEqual(decode(encode(nestedArr)), nestedArr)
})

test("encode() handles maps", () => {
    /** @type Record<never, never> */
    const map0 = {}
    deepEqual(decode(encode(map0)), map0)

    const mapNull = Object.create(null)
    deepEqual(decode(encode(mapNull)), {})

    const map1 = { "a": 0, "b": 2, "c": "three", "d": null }
    {
        const u8 = Uint8Array.from([
            132, 161,  97,   0, 161,  98,
              2, 161,  99, 165, 116, 104,
            114, 101, 101, 161, 100, 192
        ])
        deepEqual(encode(map1), u8)
        deepEqual(decode(u8), map1)
    }

    const nestedMap = { "a": -1, "b": 2, "c": "three", "d": null, "e": map1 }
    {
        const u8 = Uint8Array.from([
                133, 161,  97, 255, 161,  98,   2, 161,
                 99, 165, 116, 104, 114, 101, 101, 161,
                100, 192, 161, 101, 132, 161,  97,   0,
                161,  98,   2, 161,  99, 165, 116, 104,
                114, 101, 101, 161, 100, 192
        ])
        deepEqual(encode(nestedMap), u8)
        deepEqual(decode(u8), nestedMap)
    }
})

test("encode() handles huge array with 100k objects", () => {
    const bigArray = []
    for (let i = 0; i < 100000; i++) {
        bigArray.push({ a: { i: `${i}` }, i: i })
    }
    const bigObject = { a: bigArray }

    deepEqual(decode(encode(bigObject)), bigObject)
})

test("encode() handles huge object with 100k properties", () => {
    /** @type Record<string, number> */
    const bigObject = {}
    for (let i = 0; i < 100000; i++) {
        Reflect.set(bigObject, `prop_${i}`, i)
    }
    deepEqual(decode(encode(bigObject)), bigObject)
})

test("encode() throws when the object is an instance of a custom class", () => {
    class Foo {
        a = 1
    }
    const foo = new Foo()
    throws(
        // @ts-expect-error
        () => encode(foo),
        Error,
        "Cannot safely encode value into messagepack",
    )
})

test("encode() accepts `as const` data", () => {    
    const data = /** @type {const} */ ({
        a: 1,
        b: { c: 2 },
        d: [3, { e: 4 }],
    })
    encode(data)
})
