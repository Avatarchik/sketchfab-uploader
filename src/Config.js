//@TODO : this can probably be a Backbone model
function Config(db, callback) {

    this._db = db;
    this._data = {
        key: 'config',
        auth: ''
    };

    this.createDefaultConfig = function(db, callback) {
        this._db.insert(this._data, callback);
    };

    this.setAuth = function(auth, callback) {
        var self = this;
        this._data.auth = auth;
        this._db.update({
            key: 'config'
        }, this._data, {

        }, function(err, numReplaced, newDoc) {
            callback && callback(err, numReplaced);
        });
    };

    this.getAuth = function() {
        return this._data.auth;
    };

    this._db.find({
        key: 'config'
    }, function(err, docs) {
        if (err) {
            this.createDefaultConfig(db, function(err, data) {
                callback(this);
            });
        } else {
            if (docs.length > 0) {
                this._data = docs[0];
                callback(this);
            } else {
                this.createDefaultConfig(db, function(err, data) {
                    callback(this);
                });
            }
        }
    }.bind(this));
};

module.exports = Config;
