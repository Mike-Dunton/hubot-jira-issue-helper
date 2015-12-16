// Description
//   A Hubot script that will add your subtasks for you!
//
// Configuration:
//   HUBOT_JIRA_URL
//   HUBOT_JIRA_USER
//   HUBOT_JIRA_PASSWORD
//
// Commands:
//   hubot jira configure <project key> <issue type> <add|rm> <task name>
//   hubot jira show <project key> [issue type]
//   hubot jira add subtasks <issue type> <issue key>
//
// Author:
//   Michael Dunton

function IssueTaskLists(robot, JIRA_URL, JIRA_USER, JIRA_PASSWORD) {
    function TaskList(issueType){
        var newTaskList = {};
        newTaskList[issueType] = [];
        return newTaskList;
    }
    function setTaskList(projectKey, issueType, taskList) {
        robot.brain.set('jira-' + projectKey + '-' + issueType, taskList);
    }

    function getTaskList(projectKey, issueType) {
        var taskList = robot.brain.get('jira-' + projectKey + '-' + issueType) || [];
        return taskList;
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

    return {
        list: list,
        add: add,
        remove: remove
    };

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
}

module.exports = JiraHelper;
