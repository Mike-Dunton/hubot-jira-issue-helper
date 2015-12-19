var jira = require('./jira');

const API_PATH = "rest/api/2/";

function sendRequest(uri, method, data) {
    return new Promise(function(onSuccess, onError) {
        var rootUri = jira.Config.getRootUri();
        var username = jira.Config.getUserName();
        var password = jira.Config.getPassword();

        var endpoint = rootUri + API_PATH + uri;

        var request = require('superagent');
        switch (method) {
            case "GET":
                request.get(endpoint);
                break;
            case "POST":
                request.post(endpoint);
                break;
            case "PUT":
                request.put(endpoint);
                break;
            default:
                throw new Error("Unknown method: " + method);
        }

        request.set('Content-Type', 'application/json');
        request.auth(username, password);
        if (data) {
            request.send(data)
        } else {
            request.send();
        }
        request.end(function(err, res){
            if (err || !res.ok) {
                onError(err);
            } else {
                callback(res.body);
            }
        });
    });
}

function postRequest(uri, data) {
    return sendRequest(uri, "POST", data);
}

function getRequest(uri, data) {
    return sendRequest(uri, "GET", data);
}

function putRequest(uri, data) {
    return sendRequest(uri, "PUT", data);
}

var util = {
    postRequest : postRequest,
    getRequest : getRequest,
    putRequest : putRequest
};
jira.Util = util;

module.exports = util;
