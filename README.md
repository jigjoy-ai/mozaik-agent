# Mozaik Agent

Mozaik Agent is a TypeScript framework for building AI agents.

An agent works in a loop toward a goal. It asks a model what to do next, runs a tool when the model asks for one, and repeats until the work is done. Mozaik keeps that loop under your control: every step is written down and waits, so you can pause it, continue it, stop it, or hand it to someone else.

## The agent loop

A loop is one piece of work for one goal. It remembers:

- the **goal**
- the **assignee**, the participant responsible for moving it forward
- the **context**, the conversation so far
- the **pending operation**, the single next step, when one is waiting
- the **completed operations**, each step that already finished, with its request and its result

The loop moves one step at a time. It issues the next operation, waits for the result, records that result, and then issues the following operation. When the goal is done, the loop completes.

## Pending operations

A **pending operation** is the next step, stated explicitly and not yet run. A loop holds at most one.

There are two kinds:

- **Inference.** Ask the model, using the context gathered so far.
- **Tool call.** Run a tool the model requested, with the arguments it gave.

The loop’s job is to decide that step and wait. Your application decides when the step runs, who runs it, and whether it runs. When you bring the result back, it must match the operation that is waiting. The loop stores the result and issues the next step.

That waiting step is what makes the loop flexible. You always know the exact place the agent is standing, so pausing, continuing, stopping, and handing the work off are ordinary actions on the loop.

Here is one goal, step by step:

1. The loop issues an inference and waits.
2. You run it. The model asks for a tool.
3. The loop issues that tool call and waits.
4. You pause, show the call to a person, and continue only after they approve.
5. You run the tool and return the result.
6. The loop issues another inference, now including the tool result.
7. The model answers. The loop completes.

Each step waited until you were ready for it.

## Pause, continue, and stop

**Continue.** Carry out the pending operation and return its result. The loop records it and issues the next step.

**Pause.** Leave the pending operation where it is. The goal, the context, and the finished steps stay on the loop. Continuing later resumes that same step.

**Stop.** End the loop. The pending operation is left unrun.

Because the loop is waiting on one known step, these are precise. Pause means “this tool call is next, and it has not run.” Stop means “do not run it.” Continue means “run it, then take the next step.”

## Human in the loop

A pending operation is a checkpoint a person can sit on.

Before a tool runs, the call is already on the loop: which tool, which arguments, and the history that led there. Show that to a person. They can approve it, change it, or refuse it. The agent waits at that boundary for as long as the review takes. Their decision becomes the result you return, or the reason you stop.

The same checkpoint works for an inference. A person can review what the model is about to be asked, or review the model’s answer, before the loop takes another step.

The review uses the wait the loop already has. The person answers, and the loop continues from the same step.

## Handoffs

The assignee is who currently carries the loop forward. A handoff gives that role to someone else: another agent, a person, or another service.

The loop itself does not change hands empty. The new assignee receives the same goal, the same context, the finished steps, and the operation that is still pending. They continue the work from that step.

An agent can pass a tool call to a person for approval, and the person can pass the loop back once they have decided. One agent can also pass a goal to another agent that is better suited to the next step. The receiver continues the same loop, with the pending step still attached.

## Install

```bash
npm install @mozaik-ai/core
```

## Contributing

Contributions are welcome. Read the [Contributing Guidelines](./CONTRIBUTING.md) before opening an issue or pull request.

## License

Created by the [JigJoy](https://jigjoy.io) team. Licensed under the MIT License.
