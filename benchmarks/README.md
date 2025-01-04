# concatenating-vs-resizing-arraybuffers.js

`@messagepack/messagepack` is able to provide better performance than other msgpack libraries by using resizable buffers. This benchmark measures the initial overhead of creating resizable buffers over fixed-size buffers. 

Additionally, it compares the performance of resizing buffers vs. concatenating fixed-size buffers, a technique commonly used by other msgpack libraries. This comparison also includes the impact of the techniques on memory pressure.

The operations are run in a round-robin fashion. This is in contrast to how most benchmark runners operate, where each operation is run for the intended number of iterations before moving on to the next, resulting in later operations benefiting from the JIT compilation, disk cache, and other warmup effects more so than earlier operations. Round-robin ensures that each operation has equal opportunity to benefit from warmup effects.

## Running the benchmark

The benchmark is contained in a single file, and does _not_ depend on any npm packages or node built-in modules. Install or build commands are not necessary.

With Node.js
```
~/messagepack/benchmarks $ node concatenating-vs-resizing-arraybuffers.js
```

With Bun
```
~/messagepack/benchmarks $ bun concatenating-vs-resizing-arraybuffers.js
```

With Deno
```
~/messagepack/benchmarks $ deno run concatenating-vs-resizing-arraybuffers.js
```

## Results

<details open>
<summary>Node.js</summary>

```
> uname -r
6.5.0-1025-azure
> node -v
v22.12.0
```
```
> time node concatenating-vs-resizing-arraybuffers.js


 Fixed allocation
┌─────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ (index) │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├─────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 64bytes │ '12.994μs'     │ '91.01μs'       │ '114.093μs'     │ '229.799μs'     │ '328.773μs'     │
│ 1kB     │ '1.603μs'      │ '2.976μs'       │ '4.218μs'       │ '6.031μs'       │ '99.205μs'      │
│ 4kB     │ '571ns'        │ '1.022μs'       │ '64.389μs'      │ '81.351μs'      │ '138.658μs'     │
│ 16kB    │ '731ns'        │ '1.523μs'       │ '3.296μs'       │ '4.539μs'       │ '103.001μs'     │
│ 64kB    │ '4.108μs'      │ '5.951μs'       │ '8.085μs'       │ '109.284μs'     │ '161.351μs'     │
│ 256kB   │ '11.992μs'     │ '17.011μs'      │ '19.186μs'      │ '21.099μs'      │ '154.608μs'     │
│ 1mB     │ '33.292μs'     │ '56.365μs'      │ '68.428μs'      │ '76.393μs'      │ '145.812μs'     │
│ 4mB     │ '64.34μs'      │ '228.496μs'     │ '283.98μs'      │ '304.308μs'     │ '1.064014ms'    │
└─────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizable allocation
┌───────────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────┐
│ (index)           │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed   │
├───────────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ 64bytes, max 64kB │ '12.143μs'     │ '15.128μs'      │ '18.605μs'      │ '80.702μs'      │ '1.201701ms'    │ 0.16306872463691902 │
│ 1kB, max 64kB     │ '7.454μs'      │ '9.408μs'       │ '11.762μs'      │ '27.581μs'      │ '952.757μs'     │ 2.7885253674727357  │
│ 4kB, max 512kB    │ '6.933μs'      │ '10.31μs'       │ '13.635μs'      │ '23.313μs'      │ '1.050579ms'    │ 0.2117597726319713  │
│ 16kB, max 512kB   │ '6.993μs'      │ '8.696μs'       │ '10.77μs'       │ '21.029μs'      │ '1.060989ms'    │ 3.2675970873786406  │
│ 64kB, max 4mB     │ '6.822μs'      │ '8.306μs'       │ '10.64μs'       │ '20.037μs'      │ '1.221007ms'    │ 1.316017316017316   │
│ 256kB, max 4mB    │ '7.073μs'      │ '10.039μs'      │ '13.145μs'      │ '17.673μs'      │ '1.106824ms'    │ 0.6851349942666528  │
│ 1mB, max 32mB     │ '7.183μs'      │ '9.158μs'       │ '11.241μs'      │ '19.156μs'      │ '1.076075ms'    │ 0.1642748582451628  │
│ 4mB, max 32mB     │ '7.454μs'      │ '10.56μs'       │ '12.584μs'      │ '17.873μs'      │ '873.82μs'      │ 0.04431297978730896 │
└───────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────┘


 Concatenating fixed-size buffers
┌───────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ (index)   │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├───────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 64b * 4   │ '1.694μs'      │ '2.575μs'       │ '4.178μs'       │ '58.719μs'      │ '934.523μs'     │
│ 1kB * 4   │ '2.155μs'      │ '2.735μs'       │ '3.597μs'       │ '11.141μs'      │ '1.866391ms'    │
│ 64kB * 4  │ '40.665μs'     │ '50.244μs'      │ '53.981μs'      │ '63.619μs'      │ '1.772977ms'    │
│ 256kB * 4 │ '143.869μs'    │ '184.234μs'     │ '200.244μs'     │ '216.173μs'     │ '824.467μs'     │
│ 1mB * 4   │ '647.467μs'    │ '795.574μs'     │ '861.426μs'     │ '937.802μs'     │ '2.768493ms'    │
│ 4mB * 4   │ '2.771138ms'   │ '4.046026ms'    │ '5.290616ms'    │ '6.573208ms'    │ '9.061569ms'    │
└───────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizing buffers
┌───────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────────────────┐
│ (index)       │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed     │
├───────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────────────────┤
│ 64b -> 256b   │ '1.603μs'      │ '1.954μs'       │ '2.154μs'       │ '2.435μs'       │ '6.122μs'       │ 0.5155576831019627    │
│ 1kB -> 4kB    │ '942ns'        │ '1.022μs'       │ '1.102μs'       │ '1.202μs'       │ '1.683μs'       │ 0.3063664164581596    │
│ 64kB -> 256kB │ '3.336μs'      │ '3.637μs'       │ '3.807μs'       │ '4.097μs'       │ '5.661μs'       │ 0.07052481428650821   │
│ 256kB -> 1mB  │ '2.855μs'      │ '3.246μs'       │ '3.487μs'       │ '3.746μs'       │ '5.671μs'       │ 0.017413755218633267  │
│ 1mB -> 4mB    │ '2.836μs'      │ '3.056μs'       │ '3.266μs'       │ '3.596μs'       │ '8.015μs'       │ 0.0037913877686533725 │
│ 4mB -> 32mB   │ '187.62μs'     │ '209.781μs'     │ '222.335μs'     │ '238.094μs'     │ '303.356μs'     │ 0.042024406987768534  │
└───────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────────────────┘


relative to fixed: median time taken with resizable ArrayBuffers relative to the same with non-resizable ArrayBuffers
┌────────────────┬─────────────────────────────────────────┐
│ (index)        │ Significance                            │
├────────────────┼─────────────────────────────────────────┤
│ Less than 1    │ 'resizable ArrayBuffers are faster'     │
│ Equal to 1     │ 'no difference'                         │
│ Greater than 1 │ 'non-resizable ArrayBuffers are faster' │
└────────────────┴─────────────────────────────────────────┘

11.84s user
3.90s  system
141%   cpu
11.154 total
```

</details>

<details>
<summary>Bun</summary>

```
> uname -r
6.5.0-1025-azure
> bun -v
1.1.42
```
```
> time bun concatenating-vs-resizing-arraybuffers.js


 Fixed allocation
┌─────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│         │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├─────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 64bytes │ 1.443μs        │ 3.466μs         │ 4.99μs          │ 6.803μs         │ 20.828μs        │
│     1kB │ 901ns          │ 1.673μs         │ 2.245μs         │ 2.865μs         │ 14.938μs        │
│     4kB │ 681ns          │ 922ns           │ 1.102μs         │ 1.333μs         │ 6.122μs         │
│    16kB │ 1.452μs        │ 2.174μs         │ 4.358μs         │ 10.239μs        │ 41.658μs        │
│    64kB │ 4.889μs        │ 26.178μs        │ 28.283μs        │ 29.956μs        │ 44.623μs        │
│   256kB │ 16.53μs        │ 20.819μs        │ 110.636μs       │ 538.354μs       │ 1.150865ms      │
│     1mB │ 61.014μs       │ 76.733μs        │ 84.307μs        │ 155.65μs        │ 667.435μs       │
│     4mB │ 236.381μs      │ 296.102μs       │ 323.513μs       │ 660.983μs       │ 2.471723ms      │
└─────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizable allocation
┌───────────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬────────────────────┐
│                   │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed  │
├───────────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼────────────────────┤
│ 64bytes, max 64kB │ 16.059μs       │ 29.125μs        │ 37.821μs        │ 47.197μs        │ 840.607μs       │ 7.57935871743487   │
│     1kB, max 64kB │ 9.297μs        │ 11.331μs        │ 14.007μs        │ 15.599μs        │ 44.393μs        │ 6.239198218262806  │
│    4kB, max 512kB │ 15.049μs       │ 17.953μs        │ 20.869μs        │ 27.972μs        │ 65.602μs        │ 18.93738656987296  │
│   16kB, max 512kB │ 12.403μs       │ 14.116μs        │ 15.94μs         │ 29.525μs        │ 56.996μs        │ 3.6576411197797154 │
│     64kB, max 4mB │ 16.01μs        │ 224.329μs       │ 255.537μs       │ 276.886μs       │ 829.647μs       │ 9.035003358908178  │
│    256kB, max 4mB │ 13.996μs       │ 241.1μs         │ 256.288μs       │ 277.117μs       │ 713.21μs        │ 2.3164973426371165 │
│     1mB, max 32mB │ 16.18μs        │ 25.777μs        │ 1.746527ms      │ 2.032621ms      │ 2.560024ms      │ 20.716275042404547 │
│     4mB, max 32mB │ 12.002μs       │ 19.096μs        │ 381.792μs       │ 1.692556ms      │ 2.151883ms      │ 1.1801442291345325 │
└───────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴────────────────────┘


 Concatenating fixed-size buffers
┌───────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│           │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├───────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│   64b * 4 │ 7.474μs        │ 10.549μs        │ 12.052μs        │ 13.866μs        │ 25.969μs        │
│   1kB * 4 │ 2.194μs        │ 2.705μs         │ 3.026μs         │ 3.436μs         │ 10.199μs        │
│  64kB * 4 │ 41.538μs       │ 49.904μs        │ 55.223μs        │ 74.879μs        │ 200.474μs       │
│ 256kB * 4 │ 164.617μs      │ 202.037μs       │ 219.449μs       │ 287.276μs       │ 1.172396ms      │
│   1mB * 4 │ 705.776μs      │ 883.408μs       │ 1.07252ms       │ 1.976045ms      │ 4.570614ms      │
│   4mB * 4 │ 9.513432ms     │ 11.101484ms     │ 12.771739ms     │ 14.812624ms     │ 17.219069ms     │
└───────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizing buffers
┌───────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬────────────────────┐
│               │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed  │
├───────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼────────────────────┤
│   64b -> 256b │ 3.787μs        │ 5.139μs         │ 8.115μs         │ 9.809μs         │ 28.073μs        │ 0.6733322270162628 │
│    1kB -> 4kB │ 2.244μs        │ 2.555μs         │ 2.715μs         │ 2.955μs         │ 6.352μs         │ 0.8972240581625909 │
│ 64kB -> 256kB │ 79.789μs       │ 82.303μs        │ 83.987μs        │ 85.771μs        │ 1.221518ms      │ 1.5208699273853286 │
│  256kB -> 1mB │ 302.975μs      │ 313.555μs       │ 318.785μs       │ 325.718μs       │ 909.697μs       │ 1.4526609827340293 │
│    1mB -> 4mB │ 1.211099ms     │ 1.26008ms       │ 1.282772ms      │ 1.660917ms      │ 2.512686ms      │ 1.1960355051654048 │
│   4mB -> 32mB │ 11.515035ms    │ 11.872822ms     │ 12.003998ms     │ 12.189544ms     │ 13.213715ms     │ 0.9398875125775746 │
└───────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴────────────────────┘


relative to fixed: median time taken with resizable ArrayBuffers relative to the same with non-resizable ArrayBuffers
┌────────────────┬───────────────────────────────────────┐
│                │ Significance                          │
├────────────────┼───────────────────────────────────────┤
│    Less than 1 │ resizable ArrayBuffers are faster     │
│     Equal to 1 │ no difference                         │
│ Greater than 1 │ non-resizable ArrayBuffers are faster │
└────────────────┴───────────────────────────────────────┘

10.91s user
34.46s system
119%   cpu
38.093 total
```

</details>

<details>
<summary>Deno</summary>

```
> uname -r
6.5.0-1025-azure
> deno -v
deno 2.1.4
```
```
> time deno run benchmarks/concatenating-vs-resizing-arraybuffers.js


 Fixed allocation
┌─────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ (idx)   │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├─────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 64bytes │ "56.916μs"     │ "75.681μs"      │ "86.231μs"      │ "97.422μs"      │ "149.999μs"     │
│ 1kB     │ "3.968μs"      │ "5.03μs"        │ "5.53μs"        │ "6.543μs"       │ "15.529μs"      │
│ 4kB     │ "3.767μs"      │ "5.9μs"         │ "63.478μs"      │ "78.206μs"      │ "124.282μs"     │
│ 16kB    │ "4.879μs"      │ "6.242μs"       │ "7.524μs"       │ "38.863μs"      │ "107.821μs"     │
│ 64kB    │ "8.205μs"      │ "10.138μs"      │ "11.872μs"      │ "70.842μs"      │ "117.049μs"     │
│ 256kB   │ "18.164μs"     │ "22.923μs"      │ "25.347μs"      │ "28.603μs"      │ "120.294μs"     │
│ 1mB     │ "49.843μs"     │ "72.525μs"      │ "82.023μs"      │ "89.997μs"      │ "122.849μs"     │
│ 4mB     │ "94.967μs"     │ "264.564μs"     │ "299.209μs"     │ "323.633μs"     │ "403.553μs"     │
└─────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizable allocation
┌───────────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────┐
│ (idx)             │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed   │
├───────────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ 64bytes, max 64kB │ "16.1μs"       │ "19.136μs"      │ "21.601μs"      │ "113.933μs"     │ "185.656μs"     │ 0.25050155976389    │
│ 1kB, max 64kB     │ "12.333μs"     │ "15.609μs"      │ "17.923μs"      │ "103.564μs"     │ "177.411μs"     │ 3.2410488245931286  │
│ 4kB, max 512kB    │ "14.577μs"     │ "17.262μs"      │ "19.066μs"      │ "95.107μs"      │ "182.571μs"     │ 0.3003560288603926  │
│ 16kB, max 512kB   │ "11.993μs"     │ "15.499μs"      │ "18.634μs"      │ "101.479μs"     │ "168.905μs"     │ 2.4766081871345027  │
│ 64kB, max 4mB     │ "11.371μs"     │ "13.186μs"      │ "14.777μs"      │ "96.32μs"       │ "161.571μs"     │ 1.244693396226415   │
│ 256kB, max 4mB    │ "12.314μs"     │ "15.108μs"      │ "17.432μs"      │ "87.152μs"      │ "157.674μs"     │ 0.6877342486290291  │
│ 1mB, max 32mB     │ "12.083μs"     │ "14.286μs"      │ "17.142μs"      │ "102.491μs"     │ "162.073μs"     │ 0.2089901612962218  │
│ 4mB, max 32mB     │ "11.982μs"     │ "14.507μs"      │ "17.182μs"      │ "93.404μs"      │ "158.326μs"     │ 0.05742474323967528 │
└───────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────┘


 Concatenating fixed-size buffers
┌───────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ (idx)     │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │
├───────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 64b * 4   │ "7.223μs"      │ "158.035μs"     │ "1.042214ms"    │ "1.27088ms"     │ "1.733704ms"    │
│ 1kB * 4   │ "4.859μs"      │ "6.051μs"       │ "7.744μs"       │ "12.824μs"      │ "39.996μs"      │
│ 64kB * 4  │ "46.136μs"     │ "56.375μs"      │ "61.714μs"      │ "68.858μs"      │ "112.54μs"      │
│ 256kB * 4 │ "157.884μs"    │ "190.285μs"     │ "207.807μs"     │ "222.425μs"     │ "353.599μs"     │
│ 1mB * 4   │ "628.131μs"    │ "787.479μs"     │ "867.307μs"     │ "944.872μs"     │ "1.661679ms"    │
│ 4mB * 4   │ "2.885161ms"   │ "3.888672ms"    │ "4.507336ms"    │ "4.987992ms"    │ "6.825189ms"    │
└───────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘


 Resizing buffers
┌───────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────────────────┐
│ (idx)         │ 1st percentile │ 25th percentile │ 50th percentile │ 75th percentile │ 99th percentile │ relative to fixed     │
├───────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────────────────┤
│ 64b -> 256b   │ "3.567μs"      │ "4.638μs"       │ "5.08μs"        │ "5.52μs"        │ "10.67μs"       │ 0.0048742388799229335 │
│ 1kB -> 4kB    │ "2.265μs"      │ "3.196μs"       │ "3.397μs"       │ "3.526μs"       │ "6.341μs"       │ 0.4386621900826446    │
│ 64kB -> 256kB │ "5.3μs"        │ "6.271μs"       │ "6.572μs"       │ "6.994μs"       │ "11.451μs"      │ 0.10649123375571183   │
│ 256kB -> 1mB  │ "4.789μs"      │ "5.67μs"        │ "5.931μs"       │ "6.252μs"       │ "10.289μs"      │ 0.02854090574427233   │
│ 1mB -> 4mB    │ "4.258μs"      │ "5.33μs"        │ "5.611μs"       │ "5.891μs"       │ "10.509μs"      │ 0.006469450840359873  │
│ 4mB -> 32mB   │ "210.702μs"    │ "252.821μs"     │ "271.487μs"     │ "291.454μs"     │ "360.572μs"     │ 0.060232252487944095  │
└───────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────────────────┘


relative to fixed: median time taken with resizable ArrayBuffers relative to the same with non-resizable ArrayBuffers
┌────────────────┬─────────────────────────────────────────┐
│ (idx)          │ Significance                            │
├────────────────┼─────────────────────────────────────────┤
│ Less than 1    │ "resizable ArrayBuffers are faster"     │
│ Equal to 1     │ "no difference"                         │
│ Greater than 1 │ "non-resizable ArrayBuffers are faster" │
└────────────────┴─────────────────────────────────────────┘

20.66s user
0.83s  system
208%   cpu
10.292 total
```

</details>

## Observations
- Memory in never allocated for the buffers upfront. The runtimes ask for memory from the OS as the buffer is filled with non-zero bytes, which this benchmark does not simulate.
- Instantiating a resizable buffer is faster than instantiating a fixed-size buffer in Node.js and Deno, but not in Bun.
- In Node.js and Deno (both based on Google's V8 engine), instantiating resizable arraybuffer takes constant time, unlike instantiating fixed-size ones, which take longer for larger sizes.
- Resizing existing buffers is generally faster than creating a new larger buffer and copying smaller buffers into it. However, in Bun, the performance benefit is minimal and can even be slower at certain sizes, whereas in Node.js and Deno, the performance improvement is drastic.

### Oddities
- In Node.js and Deno, there is an odd spike in the time taken to instantiate fixed-size buffer of sizes of around 4kB. It takes longer than instantiating smaller and larger buffers. The exact size at which this spike occurs varies across systems, but it is consistently there.
