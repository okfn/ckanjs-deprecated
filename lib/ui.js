var CKAN = CKAN || {};

CKAN.UI = function($) {
  var my = {};

  my.Workspace = Backbone.Controller.extend({
    routes: {
      "": "index",
      "search": "search",
      "search/:query": "search",
      "search/:query/p:page": "search",
      "package/edit/:id": "packageEdit",
      "package/view/:id": "packageView",
      "add": "add",
      "add-resource": "addResource",
      "config": "config"
    },

    initialize: function(options) {
      var self = this;
      var newPkg = new CKAN.Model.Package();
      this.lightbox = new CKAN.View.Lightbox();
      document.body.appendChild(this.lightbox.render());
      this.lightbox.hide();


      var newCreateView = new CKAN.View.PackageCreateView({model: newPkg, el: $('#add-page')});
      newCreateView.render();

      var newResource = new CKAN.Model.Resource();
      var newResourceEditView = new CKAN.View.ResourceEditView({model: newResource, el: $('#add-resource-page')});
      newResourceEditView.render();

      // making it a singleton (may wish to change this if one could do multiple searches at once)
      this.PackageSearchResults = new CKAN.Model.PackageCollection();

      var searchView = new CKAN.View.PackageSearchView({
        el: $('#search-page'),
        collection: this.PackageSearchResults 
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

    _findPackage: function(id, callback) {
      var pkg = this.PackageSearchResults.get(id);
      if (pkg===undefined) {
        var pkg = new CKAN.Model.Package({id: id});
        pkg.fetch({
          success: callback,
          error: function() {
            alert('There was an error');
          }
        });
      } else {
        callback(pkg);
      }
    },

    packageView: function(id) {
      var self = this;
      this._findPackage(id, function (model) {
        var newView = new CKAN.View.PackageFullView({model: model});

        self.lightbox
            .title(model.get("name"))
            .content(newView.render())
            .show();
      });
    },

    packageEdit: function(id) {
      var self = this;
      function _show(model) {
        var newCreateView = new CKAN.View.PackageCreateView({model: model});
        $('#edit-page').html(newCreateView.render().el);
        self.switchView('edit');
      }
      this._findPackage(id, _show)
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
    },

    url: function(controller, action, id) {
      return '#' + controller + '/' + action + '/' + id;
    }
  });
  
  my.initialize = function(options) {
    my.workspace = new my.Workspace(options);
    Backbone.history.start()
  };

  return my;
}(jQuery);

