var CKAN = CKAN || {};

CKAN.UI = function($) {
  var my = {};

  my.Workspace = Backbone.Router.extend({
    routes: {
      "": "index",
      "search": "search",
      "search/:query": "search",
      "search/:query/p:page": "search",
      "dataset/:id/view": "datasetView",
      "dataset/:id/edit": "datasetEdit",
      "add": "add",
      "add-resource": "addResource",
      "config": "config"
    },

    initialize: function(options) {
      var self = this;
      var defaultConfig = {
        endpoint: 'http://ckan.net',
        apiKey: ''
      };

      var config = options.config || defaultConfig;
      this.client = new CKAN.Client(config);
      if (options.fixtures && options.fixtures.datasets) {
        $.each(options.fixtures.datasets, function(idx, obj) {
          var collection = self.client.cache.dataset;
          collection.add(new CKAN.Model.Dataset(obj));
        });
      }

      var newPkg = this.client.createDataset();
      var newCreateView = new CKAN.View.DatasetCreateView({model: newPkg, el: $('#add-page')});
      newCreateView.render();

      var newResource = new CKAN.Model.Resource({
        dataset: newPkg
      });
      var newResourceEditView = new CKAN.View.ResourceEditView({model: newResource, el: $('#add-resource-page')});
      newResourceEditView.render();


      var searchView = this.searchView =  new CKAN.View.DatasetSearchView({
        client: this.client,
        domain: config.endpoint,
        el: $('#search-page')
      });

      var configView = new CKAN.View.ConfigView({
        el: $('#config-page'),
        config: config
      });
      $(document).bind('config:update', function(e, cfg) {
        self.client.configure(cfg);
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
      $('#sidebar .widget-list').empty();
      $('#minornavigation').empty();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
      this.search();
    },

    search: function(query, page) {
      this.switchView('search');
      $('.page-heading').html('Search');
    },

    _findDataset: function(id, callback) {
      var pkg = this.client.getDatasetById(id);

      if (pkg===undefined) {
        pkg = this.client.createDataset({id: id});
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

    datasetView: function(id) {
      var self = this;
      self.switchView('view');
      var $viewpage = $('#view-page');
      this._findDataset(id, function (model) {
        var newView = new CKAN.View.DatasetFullView({
          model: model,
          el: $viewpage
        });
        newView.render();
      });
    },

    datasetEdit: function(id) {
      var self = this;
      self.switchView('edit');
      function _show(model) {
        var newCreateView = new CKAN.View.DatasetCreateView({model: model});
        $('#edit-page').html(newCreateView.render().el);
      }
      this._findDataset(id, _show)
    },

    add: function() {
      this.switchView('add');
      $('.page-heading').html('Add Dataset');
      $('#sidebar .widget-list').empty();
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
      if (id) {
        return '#' + controller + '/' + id + '/' + action;
      } else {
        return '#' + controller + '/' + action;
      }
    }
  });
  
  my.initialize = function(options) {
    my.workspace = new my.Workspace(options);
    Backbone.history.start()
  };

  return my;
}(jQuery);

