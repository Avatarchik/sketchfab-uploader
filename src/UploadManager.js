var Client = require('node-sketchfab');

function UploadManager(token) {
    if (token) {
        this.setToken(token);
    }
}

UploadManager.prototype.setToken = function(token) {
    if (token) {
        this._token = token;
        this._client = new Client({
            type: 'token',
            token: token
        });
    }
}

UploadManager.prototype.upload = function(params, callback) {
    if (this._client) {
        this._client.upload(params, callback);
    } else {
        callback('Token is missing');
    }
}

module.exports = UploadManager;
