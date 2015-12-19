var JIRA = require('./jira');
require('./jira-util');

function listAll() {
    return new Promise(function(onSuccess, onError) {
        JIRA.Util.getRequest('issuetype')
            .then(function(result) {
                onSuccess(result);
            })
            .catch(function(error) {
                onError(error);
            });
    });
}

function listTasks() {
    return new Promise(function(onSuccess, onError) {
        listAll()
            .then(function(result) {
                var tasks = result.filter(function(issueType) {
                    return (issueType.subtask === false);
                });
                onSuccess(tasks);
            })
            .catch(function(error) {
                onError(error);
            });
    });
}

function listSubTasks() {
    return new Promise(function(onSuccess, onError) {
        listAll()
            .then(function(result) {
                var tasks = result.filter(function(issueType) {
                    return (issueType.subtask === true);
                });
                onSuccess(tasks);
            })
            .catch(function(error) {
                onError(error);
            });
    });
}

var issueTypes = {
    /*
     * Array:
     *    self : urlString
     *    id : string,
     *    description : string,
     *    iconUrl : string
     *    name : string
     *    subtask : boolean
     */
    ListAll : listAll,

    /*
     * Array:
     *    self : urlString
     *    id : string,
     *    description : string,
     *    iconUrl : string
     *    name : string
     *    subtask : boolean
     */
    ListTasks : listTasks,

    /*
     * Array:
     *    self : urlString
     *    id : string,
     *    description : string,
     *    iconUrl : string
     *    name : string
     *    subtask : boolean
     */
    ListSubTasks : listSubTasks
};

JIRA.IssueTypes = issueTypes;

module.exports = issueTypes;
