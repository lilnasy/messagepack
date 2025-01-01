export function concat(/** @type Uint8Array[] */ buffers) {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length
    }
    const output = new Uint8Array(length)
    let index = 0
    for (const buffer of buffers) {
        output.set(buffer, index)
        index += buffer.length
    }

    return output
}
