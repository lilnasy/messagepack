### This is an experimental implementation of the msgpack encoding format forked from JSR std library.
On top of the JSR std library, it improves performance by encoding into a single binary buffer that expands as needed. The original library instantiates a `Uint8Array` or `ArrayBuffer` for each primitive type. See the associated [benchmark](./benchmark) motivating this change for more details. The improvement can also be seen at the macro-level in how quickly the test suite runs with the current implementation compared to that of `jsr:@std/msgpack`.

For comparison, I encoded a 130MB dataset of known proxy IP addresses with various libraries.
- JSR's `@std/msgpack` implementation did not finish due to running out of memory. After adding command line flags to allow more memory usage than normal, it finished in **27s** after consuming a peak of **10.2GB** of memory!
- My implementation typically finishes in **~3s**. The memory usage was also modest with a peak of **935MB**.
- `msgpackr` stood out as the fastest, typically taking just **~1.2s**! Max memory usage was **1.1GB**.

I have a few things to learn from `msgpackr`, and I originally intended to implement custom types as well. However, I found that, after content encoding the dateset with zstd or brotli, msgpack's space advantage becomes insignificant. The 130MB dataset I mentioned above, becomes 4.5MB after `brotli` compression; whereas the same dataset serialized as JSON is 170MB to start, and 4.9MB with `brotli`. Good enough!

### End of experiment
In a lot of ways, it was a success! I was able to take a naive encoder and make it viable for production while keeping the implementation lightweight and straightforward. However, my main motivation was optimizing bandwidth usage, and there are other avenues. I'm convinced that content encoding is better than a binary format. It is built-in to browsers. You don't have to bump the bundle size. You don't have to go find a library for it. Additionally, the data remains introspectable right in browser devtools without needing extensions, helping velocity of development.

If you have comments or questions, feel free to start a [discussion](https://github.com/lilnasy/messagepack/discussions)!
