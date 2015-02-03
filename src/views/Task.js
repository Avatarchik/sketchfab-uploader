'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

var TaskModel = require('../models/Task.js');

var statuses = [];
statuses[TaskModel.STATUS.NEW] = 'Starting';
statuses[TaskModel.STATUS.UPLOADING] = 'Uploading';
statuses[TaskModel.STATUS.PROCESSING] = 'Processing';
statuses[TaskModel.STATUS.FINISHED] = 'Your model is ready';
statuses[TaskModel.STATUS.ERROR] = 'Error';

var tpl = _.template([
    '<div>',
    '   <span class="task-name" title="<%= file %>"><%= name %></span>',
    '   <span class="task-status">',
    '       <%= statusText %> ',
    '       <% if (status === 1){ %> (<%= progress %> %) <% } %>',
    '       <%= error %>',
    '   </span>',
    '   <a class="task-url" href="<%= url %>" target="_blank"><%= url %></a>',
    '</div>'
].join(''));

var TaskView = Backbone.View.extend({

    tagName: 'li',

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },

    render: function() {
        var data = this.model.toJSON();
        data.statusText = statuses[data.status];
        this.$el.addClass('task');
        this.$el.html(tpl(data));
        return this;
    }

});

module.exports = TaskView;
