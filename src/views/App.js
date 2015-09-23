'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var querystring = require('querystring');

var DndTargetView = require('./DndTarget.js');
var TaskListView = require('./TaskList.js');
var Sketchfab = require('sketchfab');

var OAUTH_CLIENT_ID = '3FzFLz89bxNoYmRd=CCYhBHN62PgdeQgHZq0Ri0h';

var AppView = Backbone.View.extend({

    el: 'body',

    events: {
        'click .clear': 'onClickClear',
        'click .login': 'onClickLogin',
        'click .logout': 'onClickLogout'
    },

    initialize: function(options) {
        this.uploadManager = options.uploadManager;
        this.config = options.config;

        new DndTargetView({
            el: this.el,
            model: this.model
        });
        new TaskListView({
            el: this.$el.find('.tasks'),
            model: this.model,
            uploadManager: this.uploadManager
        });

        var auth = options.config.getAuth();
        if ( auth && auth.type == 'oauth2' && auth.token ) {
            this.whoAmI();
        } else {
            $('.loading').hide();
            $('.login').show();
        }

        this.render();
    },

    render: function() {
        return this;
    },

    onClickClear: function() {
        this.model.cleanup();
    },

    onClickLogin: function(e) {

        e.preventDefault();

        var state = (new Date).getTime();

        var authorizeUrl = 'https://sketchfab.com/oauth2/authorize/?state=' + state + '&response_type=token&client_id=' + OAUTH_CLIENT_ID;
        var completeUrlPath = '/oauth2/success';

        var gui = window.require('nw.gui');
        var loginPopup = gui.Window.get(
            window.open(authorizeUrl)
        );

        var self = this;

        loginPopup.on('loaded', function() {
            var pathname = this.window.location.pathname;

            if (pathname === completeUrlPath) {

                var hash = this.window.location.hash;
                var accessTokenRe = RegExp('#access_token=([^&]+)&(.+)');
                var accessToken = accessTokenRe.exec( hash )[1];

                var auth = {
                    type: 'oauth2',
                    token: accessToken
                };

                self.config.setAuth(auth);
                self.uploadManager.setAuth(auth);

                self.whoAmI();

                loginPopup.close();

            }

        } );
    },

    onClickLogout: function () {

        this.config.setAuth();
        this.uploadManager.setAuth();
        this.model.cleanup();
        $('.loading').hide();
        $('.login').show();
        $('.logout-wrap').hide();
        $('.username').html('');

    },

    whoAmI: function() {

        this.uploadManager._client.me( function (error, data ) {

            // An error occured. The token might be invalid
            // Show the login menu.
            if ( error ) {

                this.config.setAuth();
                this.uploadManager.setAuth();
                $('.login').show();
                $('.loading').hide();
                $('.logout-wrap').hide();
                $('.username').hide().html('');

            } else {

                $('.login').hide();
                $('.loading').hide();
                $('.logout-wrap').show();
                $('.username').show().html(data.username);

            }

        }.bind( this ) );

    }

});

module.exports = AppView;
