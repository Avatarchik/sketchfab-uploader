'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

var STATUS = {
    NEW: 0,
    UPLOADING: 1,
    PROCESSING: 2,
    FINISHED: 3,
    ERROR: 4
};

var Task = Backbone.Model.extend({
    defaults: {
        file: '',
        name: '',
        type: '',
        size: 0,

        status: STATUS.UPLOADING,
        progress: 0,
        error: '',
        url: '',
    }
});

Task.STATUS = STATUS;

module.exports = Task;
