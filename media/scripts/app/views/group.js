define([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'app/collections/group-repos',
    'app/collections/dirents',
    'app/views/group-repos',
    'app/views/add-group-repo',
    'app/views/group-recent-change',
    'app/views/dir',
    'app/views/group-nav',
], function($, _, Backbone, Common, GroupRepos, DirentCollection,
    GroupRepoView, AddGroupRepoView/*, DirentView*/, GroupRecentChangeView,
    DirView, GroupNavView) {
    'use strict';

    var GroupView = Backbone.View.extend({
        el: '#main',

        events: {
            'click #repo-create': 'createRepo',
            'click #grp-repos .by-name': 'sortByName',
            'click #grp-repos .by-time': 'sortByTime'
        },

        initialize: function() {
            Common.prepareApiCsrf();

            this.$cont = this.$('#right-panel');

            this.$tabs = this.$('#tabs');
            this.$tab = this.$('#tabs div:first-child');
            this.$table = this.$('#grp-repos table');
            this.$tableHead = $('thead', this.$table);
            this.$tableBody = $('tbody', this.$table);
            this.$loadingTip = $('.loading-tip', this.$cont);
            this.$emptyTip = $('.empty-tips', this.$cont);

            this.$createForm = this.$('#repo-create-form');
            this.repos = new GroupRepos();
            this.listenTo(this.repos, 'add', this.addOne);
            this.listenTo(this.repos, 'reset', this.reset);

            this.dirView = new DirView();

            this.groupView = new GroupNavView();
            Common.initAccountPopup();
            Common.initNoticePopup();
        },

        /*
        initializeRepos: function() {
            this.listenTo(Repos, 'add', this.addOne);
            this.listenTo(Repos, 'reset', this.addAll);
            // this.listenTo(Repos, 'sync', this.render);
            this.listenTo(Repos, 'all', this.render); // XXX: really render table when recieve any event ?
            this.listenTo(Repos, 'all', this.all);
        },
        */

        all: function(event) {
            console.log('event: ' + event);
        },

        addOne: function(repo, collection, options) {
            console.log('add repo: ' + repo.get('name'));
            var view = new GroupRepoView({model: repo});
            if (options.prepend) {
                this.$tableBody.prepend(view.render().el);
            } else {
                this.$tableBody.append(view.render().el);
            }
        },

        reset: function() {
            this.$tableBody.empty();
            this.repos.each(this.addOne, this);
            this.$loadingTip.hide();
            if (this.repos.length) {
                this.$emptyTip.hide();
                this.$table.show();
            } else {
                this.$emptyTip.show();
                this.$table.hide();
            }
        },

        showRepoList: function() {
            this.dirView.hide();
            this.$tabs.show();
            this.repos.fetch({reset: true});
            this.$loadingTip.show();
        },

        hideRepoList: function() {
            this.$tabs.hide();
        },

        showDir: function(repo_id, path) {
            this.hideRepoList();
            this.dirView.showDir('', repo_id, path);
        },

        createRepo: function() {
            var addGroupRepoView = new AddGroupRepoView(this.repos);
            addGroupRepoView.render();
        },

        showChanges: function() {
            this.$table.parent().hide(); // XXX: hide or empty ?

            if (!this.recentChangeView) {
                this.recentChangeView = new GroupRecentChangeView();
            }
            this.recentChangeView.show();
        },

        sortByName: function() {
            var repos = this.repos;
            var el = $('.by-name', this.$table);
            repos.comparator = function(a, b) { // a, b: model
                if (el.hasClass('icon-caret-up')) {
                    return a.get('name').toLowerCase() < b.get('name').toLowerCase() ? 1 : -1;
                } else {
                    return a.get('name').toLowerCase() < b.get('name').toLowerCase() ? -1 : 1;
                }
            };
            repos.sort();
            this.$tableBody.empty();
            repos.each(this.addOne, this);
            el.toggleClass('icon-caret-up icon-caret-down');
        },

        sortByTime: function() {
            var repos = this.repos;
            var el = $('.by-time', this.$table);
            repos.comparator = function(a, b) { // a, b: model
                if (el.hasClass('icon-caret-down')) {
                    return a.get('mtime') < b.get('mtime') ? 1 : -1;
                } else {
                    return a.get('mtime') < b.get('mtime') ? -1 : 1;
                }
            };
            repos.sort();
            this.$tableBody.empty();
            repos.each(this.addOne, this);
            el.toggleClass('icon-caret-up icon-caret-down');
        }

    });

    return GroupView;
});
