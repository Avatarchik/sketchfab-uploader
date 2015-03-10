'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

var gui = require('nw.gui');

// Native menu for OSX
var win = gui.Window.get();
var nativeMenuBar = new gui.Menu({
    type: "menubar"
});
nativeMenuBar.createMacBuiltin("Sketchfab Uploader");
win.menu = nativeMenuBar;

// DB
var Datastore = require('nedb');
var path = require('path');
var db = new Datastore({
    filename: path.join(require('nw.gui').App.dataPath, 'config.db'),
    autoload: true
});

// Config
var Config = require('./src/Config.js');
var config = new Config(db, function(data){
    onConfigReady(config);
});

function onConfigReady(config) {

    // Upload manager
    var UploadManager = require('./src/UploadManager.js');
    var uploadManager = new UploadManager();
    if (config.getAuth()) {
        uploadManager.setAuth(config.getAuth());
    }

    // App
    var AppView = require('./src/views/App.js');
    var Tasks = require('./src/collections/Tasks.js');

    var tasks = new Tasks();
    var appView = new AppView({
        model: tasks,
        uploadManager: uploadManager,
        config: config
    });

    // Global fix for links
    $('body').on('click', 'a[target]', function(e) {
        e.preventDefault();
        var $target = $(e.target);
        var url = $target.attr('href');
        gui.Shell.openExternal(url);
    });

    gui.Window.get().show();

    // Open dev tools
    // win.showDevTools();
}
