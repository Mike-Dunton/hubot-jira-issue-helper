function IssueTaskLists(robot) {
    this.setTaskList = function(projectKey, issueType, taskList) {
        var keyedTaskList = robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
        keyedTaskList[issueType.toUpperCase()] = taskList || [];
        robot.brain.set('jira-' + projectKey.toUpperCase(), keyedTaskList);
    }

    this.getAllProjectTaskList = function(projectKey) {
        return robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
    }

    this.getTaskList = function(projectKey, issueType) {
        var keyedTaskList = robot.brain.get('jira-' + projectKey.toUpperCase()) || {};
        return keyedTaskList[issueType.toUpperCase()] || [];
    }
}

IssueTaskLists.prototype.list = function(projectKey, issueType) {
    var response= "";
    if(typeof issueType !== "undefined"){
        var taskList = this.getTaskList(projectKey, issueType);
        response = "Project: " + projectKey + " Issue Type: " + issueType + " \n";
        response += "==================================================================== \n ";
        for (var i = 0; i < taskList.length; i++) {
            response += taskList[i] + "\n";
        }
        return response;
    } else {
        var taskLists = this.getAllProjectTaskList(projectKey);
        for(issueType in taskLists){
            if(taskLists.hasOwnProperty(issueType)) {
                response += "Project: " + projectKey + " Issue Type: " + issueType + " \n";
                response += "==================================================================== \n ";
                var currentTaskList = taskLists[issueType];
                for (var i = 0; i < currentTaskList.length; i++) {
                    response += currentTaskList[i] + "\n";
                }
            }
        }
        return response;
    }
}


IssueTaskLists.prototype.add = function(projectKey, issueType, listItem) {
        var taskList = this.getTaskList(projectKey, issueType);
        taskList.push(listItem);
        this.setTaskList(projectKey, issueType, taskList);
        var response = listItem + " added To List\n Current Task List\n ";
        response += this.list(projectKey, issueType);
        return response;
}

IssueTaskLists.prototype.remove = function(projectKey, issueType, listItem) {
        var taskList = this.getTaskList(projectKey, issueType);
        var newTaskList = taskList.filter(function(currentTask){
            return !currentTask === listItem
        })
        this.setTaskList(projectKey, issueType, newTaskList);
        var response = listItem + " removed from List\n Current Task List\n ";
        response += this.list(projectKey, issueType);
        return response;
}

module.exports = IssueTaskLists;
