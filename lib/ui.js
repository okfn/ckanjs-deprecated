var CKAN = CKAN || {};

CKAN.UI = function($) {
  var my = {};

  var Workspace = Backbone.Controller.extend({
    routes: {
      "": "index",
      "search": "search",
      "search/:query": "search",
      "search/:query/p:page": "search",
      "add": "add",
      "add-resource": "addResource",
      "config": "config"
    },

    initialize: function(options) {
      var self = this;
      var newPkg = new CKAN.Model.Package();
      var newCreateView = new CKAN.View.PackageCreateView({model: newPkg, el: $('#add-page')});
      newCreateView.render();

      var newResource = new CKAN.Model.Resource();
      var newResourceEditView = new CKAN.View.ResourceEditView({model: newResource, el: $('#add-resource-page')});
      newResourceEditView.render();

      // making it a singleton (may wish to change this if one could do multiple searches at once)
      var PackageSearchResults = new CKAN.Model.PackageSearchResultsList();

      var searchView = new CKAN.View.PackageSearchView({
        el: $('#search-page'),
        collection: PackageSearchResults 
      });

      var default_cfg = {
        endpoint: 'http://ckan.net',
        api_key: ''
      };
      var cfg = options.config ? options.config : default_cfg;

      CKAN.Model.configure(cfg);

      var configView = new CKAN.View.ConfigView({
        el: $('#config-page'),
        config: cfg
        });
      $(document).bind('config:update', function(e, cfg) {
        CKAN.Model.configure(cfg)
      });

      this.notificationView = new CKAN.View.NotificationView({
        el: $('.flash-banner-box')
        });

      function switchView(view) {
        self.switchView(view);
      }

      $(document).bind('package-edit', function(e, pkg) {
        var newCreateView = new CKAN.View.PackageCreateView({model: pkg});
        $('#edit-page').html(newCreateView.render().el);
        switchView('edit');
      });
    },

    switchView: function(view) {
      $('.page-view').hide();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
      this.search();
    },

    search: function(query, page) {
      this.switchView('search');
    },

    add: function() {
      this.switchView('add');
    },

    addResource: function() {
      this.switchView('add-resource');
    },

    edit: function(pkg) {
    },

    config: function() {
      this.switchView('config');
    }
  });
  
  my.initialize = function(options) {
    var workspace = new Workspace(options);
    Backbone.history.start()
  };

  return my;
}(jQuery);

