// Description
//   A Hubot script that will add your subtasks for you!
//
// Configuration:
//   HUBOT_JIRA_URL
//   HUBOT_JIRA_USER
//   HUBOT_JIRA_PASSWORD
//   HUBOT_JIRA_SUBTASK_ISSUE_TYPE_ID
//
// Commands:
//   hubot jira configure <project key> <issue type> <add|rm> <task name>
//   hubot jira show <project key> [issue type]
//   hubot jira add subtasks <issue type> <issue key>
//
// Author:
//   Michael Dunton

var TaskListManager = require('./lib/task-list-manager/task-list-manager');
var JIRA = require('./lib/jira-api/jira');
require('./lib/jira-api/jira-issueTypes');

JIRA.Config.setUserName(process.env.HUBOT_JIRA_USER);
JIRA.Config.setPassword(process.env.HUBOT_JIRA_PASSWORD);
JIRA.Config.setRootUri(process.env.HUBOT_JIRA_URL);


function robotShowError(response, error) {
    var errorString = error.toString() + "\n" + error.callstack;
    response.respond("Something bad happened: " + errorString);
}

function JiraHelper(robot) {
    var taskListManager = new TaskListManager(robot);
    robot.respond(/jira show (.*)/i, function(response) {
        var messageArguments = response.match[1].split(" ");
        var projectKey = messageArguments[0];
        var issueType = messageArguments[1];
        var responseMsg = taskListManager.list(projectKey, issueType);
        response.reply(responseMsg);
    });

    robot.respond(/jira configure (.*)/i, function(response) {
        var messageArguments = response.match[1].split(" ");
        var projectKey = messageArguments[0];
        var issueType = messageArguments[1];
        var action = messageArguments[2];
        var task = messageArguments[3];
        var responseMsg;
        if(action === "add"){
            responseMsg = taskListManager.add(projectKey, issueType, task);
        } else if(action === "rm") {
            responseMsg = taskListManager.remove(projectKey, issueType, task);
        }
        response.reply(responseMsg);
    });

    robot.respond(/jira add subtasks (.*)/i, function(response) {
        var responseMsg = "Not Implemented";
        response.reply(responseMsg);
    });

    robot.respond(/jira list tasks/i, function(response) {
        JIRA.IssueTypes.ListTasks()
            .then(function(result) {
                var names = result.map(function(issueType) {
                    return "\"" + issueType.name + "\"";
                });

                var taskTypes = names.join(", ")
                response.reply(taskTypes);
            })
            .catch(function(error) {
                robotShowError(response, error);
            });
    });

    robot.respond(/jira list subtasks/i, function(response) {
        JIRA.IssueTypes.ListSubTasks()
            .then(function(result) {
                var names = result.map(function(issueType) {
                    return issueType.name;
                });

                var taskSubTypes = names.join(", ")
                response.reply(taskSubTypes);
            })
            .catch(function(error) {
                robotShowError(response, error);
            });
    });
}

module.exports = JiraHelper;
