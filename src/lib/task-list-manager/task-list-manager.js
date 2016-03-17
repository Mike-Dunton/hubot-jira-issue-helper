'use strict'
var TaskListManager =  function (robot, jira) {
    var _robot = robot;
    var _jira = jira;

    var _setTaskList = function(projectKey, issueType, taskList) {
        var keyedTaskList = _robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
        keyedTaskList[issueType.toUpperCase()] = taskList || [];
        _robot.brain.set('jira-' + projectKey.toUpperCase(), keyedTaskList);
    }

    var _getAllProjectTaskList = function(projectKey) {
        return _robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
    }

    var _getTaskList = function(projectKey, issueType) {
        var keyedTaskList = _robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
        return keyedTaskList[issueType.toUpperCase()] || [];
    }

    var _printTaskList = function(projectKey, issueType, taskList) {
        var response = "Project: " + projectKey + " Issue Type: " + issueType + " \n";
        response += "==================================================================== \n ";
        for (var i = 0; i < taskList.length; i++) {
            response += taskList[i] + "\n";
        }
        return response;
    }
    var list = function (projectKey, issueType) {
        if(typeof issueType !== "undefined"){
            var taskList = _getTaskList(projectKey, issueType);
            return _printTaskList(projectKey, issueType, taskList);
        } else {
            var response= "";
            var taskLists = _getAllProjectTaskList(projectKey);
            for(issueType in taskLists){
                if(taskLists.hasOwnProperty(issueType)) {
                    response += _printTaskList(projectKey, issueType, taskLists[issueType]);
                }
            }
            return response;
        }
    }
    var add = function (projectKey, issueType, listItem) {
            var taskList = _getTaskList(projectKey, issueType);
            taskList.push(listItem);
            _setTaskList(projectKey, issueType, taskList);
            var response = listItem + " added To List\n Current Task List\n ";
            response += list(projectKey, issueType);
            return response;
    }

    var remove = function (projectKey, issueType, listItem) {
            var taskList = _getTaskList(projectKey, issueType);
            var newTaskList = taskList.filter(function(currentTask){
                return !currentTask === listItem
            })
            _setTaskList(projectKey, issueType, newTaskList);
            var response = listItem + " removed from List\n Current Task List\n ";
            response += list(projectKey, issueType);
            return response;
    }

    return {
        list: list,
        add: add,
        remove: remove
    }
}
module.exports = TaskListManager;
