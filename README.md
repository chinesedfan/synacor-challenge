### Introduction

At first, I think the challenge is only to implement a CPU, which requires 2 steps:

- Load the binary file as a lot of 16-bit numbers
- Divide them into operations and execute

But in fact, it is a very complex RPG! Let's begin.

```
node index.js bin/challenge.bin
```

My solution also supports to accept a file as pre-input, so that you can always start at a certain game point.

```
node index.js bin/challenge.bin bin/input.txt
```

### Progress

Codes collected(8/8):

- `UpiNqTKzQPcV`, at the beginning of this challenge
- `tZBeiefrPsUM`, once the CPU is runnable and can output something
- `xIkuFtHWGgvj`, after the self-test is passed
- `quDrLIIsFhRO`, by `use tablet`, and the whole input is `/bin/input_code_4.txt`
- `rJBYiKxjfqAI`, when found the thing `can`
- `iupNpossLXvK`, by `use teleporter`
- `FmMGDBPACIhj`, by hack r7 correctly
- `wxvWuMqqAlbb`, the mirror of `ddlAppMuWvxw`

### Tips

- Implement the CPU first. Test cases are very important. If you need readable instructions to analyse the challenge program, `/tools/exportinstr.js` will output the result to `/bin/instructions.txt`. I also provide a [partial commented](docs/instrs_with_simple_comments.txt) version.
- Collect items to light the lantern or you will be eaten by a grue. `/tools/rpgcrawler.js` is used to scan each possible path.
- Solve the equation then find the right order of coins. Refer to `/tools/eqsolver.js`.
- Fix the teleporter. This step costs most of my time, because simply hack the result (at ip 5491) does not work. The original function is like the implementation in `/tools/fnsimulator.js`, and the optimized one is `/tools/r7solver.js`. Check [details](docs/magic_function_analysis.txt).
- Find a path to make the orb to be the expected value. As well as r7, hack the verification code may give you a code, but the website will reject it as an invalid one. I scan the game map by `/tools/rpgcrawler.js` with special pre-input, and BFS by `/tools/orbsolver.js`.
- Convert the final code in the mirror.
