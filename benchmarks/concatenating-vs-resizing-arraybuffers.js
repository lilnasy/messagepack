const ITERATIONS = 1_000

/** @type Record<string, bigint[]> */
const fixedAllocations = {
    "64bytes": [],
    "1kB": [],
    "4kB": [],
    "16kB": [],
    "64kB": [],
    "256kB": [],
    "1mB": [],
    "4mB": [],
}

/** @type Record<string, bigint[]> */
const resizableAllocations = {
    "64bytes, max 64kB": [],
    "1kB, max 64kB": [],
    "4kB, max 512kB": [],
    "16kB, max 512kB": [],
    "64kB, max 4mB": [],
    "256kB, max 4mB": [],
    "1mB, max 32mB": [],
    "4mB, max 32mB": [],
}

/** @type Record<string, bigint[]> */
const concatting = {
    "64b * 4": [],
    "1kB * 4": [],
    "64kB * 4": [],
    "256kB * 4": [],
    "1mB * 4": [],
    "4mB * 4": [],
}

/** @type Record<string, bigint[]> */
const resizing = {
    "64b -> 256b": [],
    "1kB -> 4kB": [],
    "64kB -> 256kB": [],
    "256kB -> 1mB": [],
    "1mB -> 4mB": [],
    "4mB -> 32mB": [],
}

for (let i = 1; i <= ITERATIONS; i++) {
    {
        const start = now()
        new ArrayBuffer(64)
        fixedAllocations["64bytes"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(1024)
        fixedAllocations["1kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(4 * 1024)
        fixedAllocations["4kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(16 * 1024)
        fixedAllocations["16kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(64 * 1024)
        fixedAllocations["64kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(256 * 1024)
        fixedAllocations["256kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(1024 * 1024)
        fixedAllocations["1mB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(4 * 1024 * 1024)
        fixedAllocations["4mB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(64, { maxByteLength: 64 * 1024 })
        resizableAllocations["64bytes, max 64kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(1024, { maxByteLength: 64 * 1024 })
        resizableAllocations["1kB, max 64kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(4 * 1024, { maxByteLength: 512 * 1024 })
        resizableAllocations["4kB, max 512kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(16 * 1024, { maxByteLength: 512 * 1024 })
        resizableAllocations["16kB, max 512kB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(64 * 1024, { maxByteLength: 4 * 1024 * 1024 })
        resizableAllocations["64kB, max 4mB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(256 * 1024, { maxByteLength: 4 * 1024 * 1024 })
        resizableAllocations["256kB, max 4mB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(1024 * 1024, { maxByteLength: 32 * 1024 * 1024 })
        resizableAllocations["1mB, max 32mB"].push(now() - start)
    }
    {
        const start = now()
        new ArrayBuffer(4 * 1024 * 1024, { maxByteLength: 32 * 1024 * 1024 })
        resizableAllocations["4mB, max 32mB"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(64)
        const a2 = new Uint8Array(64)
        const a3 = new Uint8Array(64)
        const a4 = new Uint8Array(64)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["64b * 4"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(1024)
        const a2 = new Uint8Array(1024)
        const a3 = new Uint8Array(1024)
        const a4 = new Uint8Array(1024)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["1kB * 4"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(64 * 1024)
        const a2 = new Uint8Array(64 * 1024)
        const a3 = new Uint8Array(64 * 1024)
        const a4 = new Uint8Array(64 * 1024)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["64kB * 4"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(256 * 1024)
        const a2 = new Uint8Array(256 * 1024)
        const a3 = new Uint8Array(256 * 1024)
        const a4 = new Uint8Array(256 * 1024)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["256kB * 4"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(1024 * 1024)
        const a2 = new Uint8Array(1024 * 1024)
        const a3 = new Uint8Array(1024 * 1024)
        const a4 = new Uint8Array(1024 * 1024)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["1mB * 4"].push(now() - start)
    }
    {
        const a1 = new Uint8Array(4 * 1024 * 1024)
        const a2 = new Uint8Array(4 * 1024 * 1024)
        const a3 = new Uint8Array(4 * 1024 * 1024)
        const a4 = new Uint8Array(4 * 1024 * 1024)
        const start = now()
        concat(a1, a2, a3, a4)
        concatting["4mB * 4"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(64, { maxByteLength: 256 }))
        const start = now()
        u8.buffer.resize(256)
        resizing["64b -> 256b"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(1024, { maxByteLength: 4 * 1024 }))
        const start = now()
        u8.buffer.resize(4 * 1024)
        resizing["1kB -> 4kB"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(64 * 1024, { maxByteLength: 256 * 1024 }))
        const start = now()
        u8.buffer.resize(256 * 1024)
        resizing["64kB -> 256kB"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(256 * 1024, { maxByteLength: 1 * 1024 * 1024 }))
        const start = now()
        u8.buffer.resize(1 * 1024 * 1024)
        resizing["256kB -> 1mB"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(1024 * 1024, { maxByteLength: 4 * 1024 * 1024 }))
        const start = now()
        u8.buffer.resize(4 * 1024 * 1024)
        resizing["1mB -> 4mB"].push(now() - start)
    }
    {
        const u8 = new Uint8Array(new ArrayBuffer(4 * 1024 * 1024, { maxByteLength: 32 * 1024 * 1024 }))
        const start = now()
        u8.buffer.resize(32 * 1024 * 1024)
        resizing["4mB -> 32mB"].push(now() - start)
    }
}

/** @type Record<string, bigint[]> */
let fixedAllocationsHistograms = {}

/** @type Record<string, bigint[]> */
let concattingHistograms = {}

for (const [category, categoryBenchmarks] of Object.entries({
    "Fixed allocation": fixedAllocations,
    "Resizable allocation": resizableAllocations,
    "Concatenating fixed-size buffers": concatting,
    "Resizing buffers": resizing
})) {
    const results = {}
    for (const [bench, durations] of Object.entries(categoryBenchmarks)) {
        const histogram = durations.sort((a, b) => Number(a - b))

        if (category === "Fixed allocation") {
            fixedAllocationsHistograms[bench] = histogram
        } else if (category === "Concatenating fixed-size buffers") {
            concattingHistograms[bench] = histogram
        }

        results[bench] ??= {}
        results[bench]["1st percentile"] = format(histogram[Math.floor(ITERATIONS * 0.01)])
        results[bench]["25th percentile"] = format(histogram[Math.floor(ITERATIONS * 0.25)])
        results[bench]["50th percentile"] = format(histogram[Math.floor(ITERATIONS * 0.50)])
        results[bench]["75th percentile"] = format(histogram[Math.floor(ITERATIONS * 0.75)])
        results[bench]["99th percentile"] = format(histogram[Math.floor(ITERATIONS * 0.99)])

        if (category === "Resizable allocation") {
            results[bench]["relative to fixed"] =
                Number(histogram[Math.floor(ITERATIONS * 0.5)]) /
                Number(fixedAllocationsHistograms[bench.split(",")[0]][Math.floor(ITERATIONS * 0.5)])
        } else if (category === "Resizing buffers") {
            results[bench]["relative to fixed"] =
                Number(histogram[Math.floor(ITERATIONS * 0.5)]) /
                Number(concattingHistograms[bench.split(" ")[0] + " * 4"][Math.floor(ITERATIONS * 0.5)])
        }

        function format(/** @type bigint */ ns) {
            if (ns > 1_000_000n) return `${Number(ns) / 1_000_000}ms`
            if (ns > 1_000n) return `${Number(ns) / 1_000}μs`
            return `${ns}ns`
        }
    }
    console.log("\n\n", category)
    console.table(results)
}

console.log(
    "\n\n" +
    "relative to fixed: median time taken with resizable ArrayBuffers " +
    "relative to the same with non-resizable ArrayBuffers"
)
console.table({
    "Less than 1": { "Significance": "resizable ArrayBuffers are faster" },
    "Equal to 1": { "Significance": "no difference" },
    "Greater than 1": { "Significance": "non-resizable ArrayBuffers are faster" },
})

function concat(/** @type ArrayBuffer[] */...buffers) {

    let cumulativeSize = 0
    for (const buffer of buffers)
        cumulativeSize += buffer.byteLength

    const result = new Uint8Array(cumulativeSize)

    let offset = 0
    for (const buffer of buffers) {
        result.set(new Uint8Array(buffer), offset)
        offset += buffer.byteLength
    }

    return result.buffer
}

function now() {
    if (typeof process !== "undefined") {
        return process.hrtime.bigint()
    }
    return BigInt(Math.round(performance.now() * 1_000))
}
