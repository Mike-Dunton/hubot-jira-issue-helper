var _rootUri = null;
var _password = null;
var _username = null;

var config = {
    getRootUri : function() {
        return _rootUri;
    },
    setRootUri : function(rootUri) {
        _rootUri = rootUri;
    },
    getPassword : function() {
        return _password;
    },
    setPassword : function(password) {
        _password = password;
    },
    getUserName : function() {
        return _username;
    },
    setUserName : function(username) {
        _username = username;
    }
};

module.exports = config;

