'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

var TaskModel = require('../models/Task.js');
var TaskView = require('./Task.js');

var TaskListView = Backbone.View.extend({

    _subviews: [],

    initialize: function(options) {
        this.uploadManager = options.uploadManager;
        this.listenTo(this.model, 'add', this.onTaskAdded.bind(this));
        this.listenTo(this.model, 'remove', this.onTaskRemoved.bind(this));
    },

    onTaskAdded: function(model) {
        var taskView = new TaskView({
            model: model
        });
        var cid = model.cid;
        this._subviews.push({
            cid: cid,
            view: taskView
        });
        this.$el.append(taskView.el);

        var params = model.toJSON();
        params['private'] = true;

        this.uploadManager.upload(
            params,
            function(err, task) {
                if (err) {
                    model.set('status', TaskModel.STATUS.ERROR);
                    model.set('error', err);
                } else {
                    task.on('progress', function(value) {
                        value = parseInt(value);
                        model.set('progress', value);
                        if (value === 100) {
                            model.set('status', TaskModel.STATUS.PROCESSING);
                        } else {
                            model.set('status', TaskModel.STATUS.UPLOADING);
                        }
                    });
                    task.on('success', function(url) {
                        model.set('status', TaskModel.STATUS.FINISHED);
                        model.set('url', url);
                    });
                    task.on('error', function(error) {
                        model.set('status', TaskModel.STATUS.ERROR);
                        model.set('error', error);
                    });
                }
            }
        );
    },

    onTaskRemoved: function(model) {
        var cid = model.cid;
        var subview = _.where(this._subviews, {
            cid: cid
        });
        if (subview.length) {
            subview[0].view.remove();
        }
    }

});

module.exports = TaskListView;
