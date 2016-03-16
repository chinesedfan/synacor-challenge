### Introduction

At first, I think the challenge is only to implement a CPU, which requires 2 steps:

- Load the binary file as a lot of 16-bit numbers
- Divide them into operations and execute

But in fact, it is a very complex RPG! Let's begin.

```
node index.js bin/challenge.bin
```

### Progress

Codes collected(5/8):

- `UpiNqTKzQPcV`, at the beginning of this challenge
- `tZBeiefrPsUM`, once the CPU is runnable and can output something
- `xIkuFtHWGgvj`, after the self-test is passed
- `quDrLIIsFhRO`, by `use tablet`, and the whole input is `/bin/input_code_4.txt`
- `rJBYiKxjfqAI`, at node 21 and `go north`
- ... ...(TODO)

### Tips

- If you need readable instructions to analyse the challenge program, `/tools/exportinstr.js` will output the result to `/bin/instructions.txt`. I also provide a [partial commented](docs/instrs_with_simple_comments.txt) version.
- Test cases are very important to guarantee the CPU has been implemented as expected. Otherwise, you will fail on the self-test.
