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

var async = require('async');
var request = require('superagent');

var JIRA = require('./lib/jira');
require('./lib/jira-issueTypes');

JIRA.Config.setUserName(process.env.HUBOT_JIRA_USER);
JIRA.Config.setPassword(process.env.HUBOT_JIRA_PASSWORD);
JIRA.Config.setRootUri(process.env.HUBOT_JIRA_URL);

function IssueTaskLists(robot, JIRA_URL, JIRA_USER, JIRA_PASSWORD) {
    var issueEndPoint = JIRA_URL + "/rest/api/latest/issue/";
    function createTask(task, callback) {
        request
            .post(issueEndPoint)
            .set('Content-Type', 'application/json')
            .auth(JIRA_USER, JIRA_PASSWORD)
            .send({
                "fields": {
                    "project": {
                            "key": task.project_key
                    },
                    "parent": {
                        "key": task.parent_key
                    },
                    "summary": task.task_name,
                    "issuetype":
                    {
                        "id": HUBOT_JIRA_SUBTASK_ISSUE_TYPE_ID
                    }
                }
            })
            .end(function(err, res){
                if (err || !res.ok) {callback(err)}
                else {callback()}
            });

    }

    function TaskList(issueType){
        var newTaskList = {};
        newTaskList[issueType] = [];
        return newTaskList;
    }
    function setTaskList(projectKey, issueType, taskList) {
        var keyedTaskList = robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
        keyedTaskList[issueType.toUpperCase()] = taskList;
        robot.brain.set('jira-' + projectKey.toUpperCase(), keyedTaskList);
    }

    function getTaskList(projectKey, issueType) {
        var keyedTaskList = robot.brain.get('jira-' + projectKey.toUpperCase());
        return keyedTaskList[issueType.toUpperCase()] || [];
    }

    function list(projectKey) {
        var response = "";
        var taskLists = getAllTaskList(projectKey);
        for(issueType in taskLists){
            if(taskLists.hasOwnProperty(issueType)) {
                response += "Project: " + projectKey + "Issue Type: " + issueType + " \n";
                response += "==================================================================== \n ";
                var currentTaskList = taskLists[issueType];
                for (var i = 0; i < currentTaskList.length; i++) {
                    response += currentTaskList[i] + "\n";
                }
            }
        }
        return response;
    }

    function list(projectKey, issueType) {
        var taskList = getTaskList(projectKey, issueType);
        var response = "Project: " + projectKey + "Issue Type: " + issueType + " \n";
        response += "==================================================================== \n ";
        for (var i = 0; i < taskList.length; i++) {
            response += taskList[i] + "\n";
        }
        return response;
    }


    function add(projectKey, issueType, listItem) {
            var taskList = getTaskList(projectKey, issueType);
            taskList.push(listItem);
            setTaskList(projectKey, issueType, taskList);
            var response = listItem + " added To List\n Current Task List\n ";
            response += list(projectKey, issueType);
            return response;
    }

    function remove(projectKey, issueType, listItem) {
            var taskList = getTaskList(projectKey, issueType);
            var newTaskList = taskList.filter(function(currentTask){
                return !currentTask === listItem
            })
            setTaskList(projectKey, issueType, newTaskList);
            var response = listItem + " removed from List\n Current Task List\n ";
            response += list(projectKey, issueType);
            return response;
    }

    function createSubtasks(issueType, issueKey) {
        var project = issueKey.split("-")[0];
        var taskList = getTaskList(project, issueType);
        if(taskList.length === 0){
            return "Could not find project or issue type";
        } else {
            var taskObjList = taskList.map(function(currentTask){
                return {
                    "project_key" : project,
                    "parent_key" : issueKey,
                    "task_name" : currentTask
                }
            })
            async.eachSeries(taskObjList, IssueTaskLists.createTask, function(err){
                if(err){
                    return "Something went wrong...Good Luck";
                } else {
                    return "Tasks Created!";
                }
            });
        }
    }

    function listIssueTypes(projectId) {

    }

    return {
        list: list,
        add: add,
        remove: remove,
        createSubtasks : createSubtasks,
        listIssueTypes : listIssueTypes
    };

}

function robotShowError(response, error) {
    var errorString = error.toString() + "\n" + error.callstack;
    response.respond("Something bad happened: " + errorString);
}

function JiraHelper(robot) {
    var JIRA_URL = process.env.HUBOT_JIRA_URL;
    var JIRA_USER = process.env.HUBOT_JIRA_USER;
    var JIRA_PASSWORD = process.env.HUBOT_JIRA_PASSWORD;
    var issueTaskListManager = new IssueTaskLists(robot, JIRA_URL, JIRA_USER, JIRA_PASSWORD);
    robot.respond(/jira show (.*)/i, function(response) {
        var messageArguments = response.match[1].split(" ");
        var projectKey = messageArguments[0];
        var issueType = messageArguments[1];
        var responseMsg = issueTaskListManager.list(projectKey, issueType);
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
            responseMsg = issueTaskListManager.add(projectKey, issueType, task);
        } else if(action === "rm") {
            responseMsg = issueTaskListManager.remove(projectKey, issueType, task);
        }
        response.reply(responseMsg);
    });

    robot.respond(/jira add subtasks (.*)/i, function(response) {
        var messageArguments = response.match[1].split(" ");
        var issueType = messageArguments[0];
        var issueKey = messageArguments[1];
        var responseMsg = issueTaskListManager.createSubtasks(issueType, issueKey);
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
