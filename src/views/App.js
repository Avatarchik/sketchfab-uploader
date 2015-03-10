'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var querystring = require('querystring');

var DndTargetView = require('./DndTarget.js');
var TaskListView = require('./TaskList.js');
var Sketchfab = require('node-sketchfab');

var request = require('request');

var MSFT_OAUTH_CLIENT_ID = '000000004C136B66';
var MSFT_OAUTH_SECRET = 'pMZtT0fkdAVQh6DhlAlV0tgOji7BjU8L'
var SKETCHFAB_OAUTH_CLIENT_ID = '1KCscXZaX1oTnCt0nA8w5N0H9Wejw8pkD4X';
var API_DOMAIN = 'https://thing.fatvertex.com'

var AppView = Backbone.View.extend({

    el: 'body',

    events: {
        'click .clear': 'onClickClear',
        'click .login': 'onClickLogin',
        'click .login-msft': 'onClickLoginMsft',
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
            $('.login-msft').show();
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

        var authorizeUrl = 'https://thing.fatvertex.com/oauth2/authorize/?state=' + state + '&response_type=token&client_id=' + SKETCHFAB_OAUTH_CLIENT_ID;
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

    onClickLoginMsft: function(e) {

        e.preventDefault();
        var state = (new Date).getTime();
        var msftRedirectPath = '/oauth2/success-msft'
        var msftRedirectUrl = API_DOMAIN + msftRedirectPath;
        var msftAuthorizeUrl = 'https://login.live.com/oauth20_authorize.srf?scope=wl.basic,wl.emails&redirect_uri=' + msftRedirectUrl + '&response_type=code&client_id=' + MSFT_OAUTH_CLIENT_ID;
        var msftAccessTokenUrl = 'https://login.live.com/oauth20_token.srf'
        var msftRegisterByTokenPath = '/social/token/live/';
        var msftRegisterByTokenUrl = API_DOMAIN + msftRegisterByTokenPath;
        var skfbAuthorizeUrl = API_DOMAIN + '/oauth2/authorize/?state=' + state + '&response_type=token&client_id=' + SKETCHFAB_OAUTH_CLIENT_ID;
        var skfbCompletePath = '/oauth2/success';
        var skfbCompleteUrl = API_DOMAIN + skfbCompletePath;

        var gui = window.require('nw.gui');
        var loginPopup = gui.Window.get(
            window.open(msftAuthorizeUrl)
        );

        var self = this;

        //Polling
        var url = '';
        var timer = setInterval(function(){
            var path = loginPopup.window.location.pathname;
            if (path !== url) {
                url = path;
                onLoaded.call(loginPopup);
            }
        }, 100);

        function onLoaded() {
            var path = this.window.location.pathname;

            if (path === msftRedirectPath) {

                var search = this.window.location.search;
                var codeRe = RegExp('code=([^&]+)');
                var code = codeRe.exec( search )[1];
                var form = {
                    'client_id': MSFT_OAUTH_CLIENT_ID,
                    'redirect_uri': msftRedirectUrl,
                    'client_secret': MSFT_OAUTH_SECRET,
                    'code': code,
                    'grant_type': 'authorization_code'
                };

                this._req = request.post({
                    method: 'POST',
                    uri: msftAccessTokenUrl,
                    form: form,
                }, function(err, response, body) {

                    if (response.statusCode === 200) {
                        var data = JSON.parse(body);

                        this.window.location.href = msftRegisterByTokenUrl + '?access_token=' + data.access_token;
                    }

                }.bind(this));
            }

            if (path === msftRegisterByTokenPath) {

                this.window.location.href = skfbAuthorizeUrl;

            }

            if (path === skfbCompletePath) {

                var hash = this.window.location.hash;
                var accessTokenRe = RegExp('#access_token=([^&]+)&(.+)');
                var accessToken = accessTokenRe.exec( hash )[1];

                var auth = {
                    type: 'oauth2',
                    token: accessToken
                };

                self.config.setAuth(auth);
                self.uploadManager.setAuth(auth);

                loginPopup.close();

                self.whoAmI();

            }

        }
    },

    onClickLogout: function () {

        this.config.setAuth();
        this.uploadManager.setAuth();
        this.model.cleanup();
        $('.loading').hide();
        $('.login').show();
        $('.login-msft').show();
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
                $('.login-msft').show();
                $('.loading').hide();
                $('.logout-wrap').hide();
                $('.username').hide().html('');

            } else {

                $('.login').hide();
                $('.login-msft').hide();
                $('.loading').hide();
                $('.logout-wrap').show();
                $('.username').show().html(data.username);

            }

        }.bind( this ) );

    }

});

module.exports = AppView;
