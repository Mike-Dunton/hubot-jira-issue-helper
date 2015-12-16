# hubot-jira-issue-helper

A Hubot script that will add your subtasks for you!

See [`src/jira-issue-helper.coffee`](src/jira-issue-helper.js) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-jira-issue-helper --save`

Then add **hubot-jira-issue-helper** to your `external-scripts.json`:

```json
["hubot-jira-issue-helper"]
```

## Commands

```
//   hubot jira show <project key> [issue type]
//   hubot jira add subtasks <issue type> <issue key>
//   hubot jira add subtasks <issue type> <issue key>
```
