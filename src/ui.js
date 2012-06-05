var CKAN = CKAN || {};

CKAN.UI = function($) {
  var my = {};

  my.Workspace = Backbone.Router.extend({
    routes: {
      "": "index",
      "search/:query/p:page": "search",
      "search/:query": "search",
      "search": "search",
      "dataset/:id/view": "datasetView",
      "dataset/:id/edit": "datasetEdit",
      "dataset/:datasetId/resource/:resourceId": "resourceView",
      "add-dataset": "datasetAdd",
      "add-resource": "resourceAdd",
      "config": "config"
    },

    initialize: function(options) {
      var self = this;
      // nasty - we set this as global singleton in this namespace
      // want to change this but have dependency from resource create on CKAN.UI.workspace
      my.workspace = this;

      var defaultConfig = {
        endpoint: 'http://ckan.net',
        apiKey: ''
      };

      this.config = _.extend({}, defaultConfig, options);
      this.client = new CKAN.Client(this.config);
      if (this.config.fixtures && this.config.fixtures.datasets) {
        $.each(this.config.fixtures.datasets, function(idx, obj) {
          var collection = self.client.cache.dataset;
          collection.add(new CKAN.Model.Dataset(obj));
        });
      }

      var newPkg = this.client.createDataset();
      var newCreateView = new CKAN.View.DatasetEditView({model: newPkg, el: $('#dataset-add-page')});
      newCreateView.render();

      var newResource = new CKAN.Model.Resource({
        dataset: newPkg
      });
      var newResourceEditView = new CKAN.View.ResourceEditView({model: newResource, el: $('#add-resource-page')});
      newResourceEditView.render();

      this.searchView =  new CKAN.View.DatasetSearchView({
        client: this.client,
        el: $('#search-page')
      });

      // set up top bar search
      $('.search-form').submit(function(e) {
        e.preventDefault();
        var _el = $(e.target);
        var _q = _el.find('input[name="q"]').val();
        self.search(_q);
      });


      var configView = new CKAN.View.ConfigView({
        el: $('#config-page'),
        config: this.config
      });
      $(document).bind('config:update', function(e, cfg) {
        self.client.configure(cfg);
      });

      this.notificationView = new CKAN.View.NotificationView({
        el: $('.flash-banner-box')
      });
    },

    switchView: function(view) {
      $('.page-view').hide();
      $('#sidebar .widget-list').empty();
      $('#minornavigation').empty();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
      this.switchView("home");
    },

    search: function(query, page) {
      this.searchView.doSearch(query);
      this.navigate('search' + '/' + query);
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
      this.switchView('dataset-edit');
      $('.page-heading').html('Edit Dataset');
      function _show(model) {
        var newView = new CKAN.View.DatasetEditView({model: model});
        $('#dataset-edit-page').html(newView.render().el);
      }
      this._findDataset(id, _show)
    },

    datasetAdd: function() {
      this.switchView('dataset-add');
      $('.page-heading').html('Add Dataset');
      $('#sidebar .widget-list').empty();
    },

    resourceView: function(datasetId, resourceId) {
      this.switchView('resource-view');
      var $viewpage = $('#resource-view-page');
      this._findDataset(datasetId, function (model) {
        var resource = model.get('resources').get(resourceId);
        var newView = new CKAN.View.ResourceView({
          model: resource,
          el: $viewpage
        });
        newView.render();
      });
    },

    resourceAdd: function() {
      this.switchView('add-resource');
    },

    config: function() {
      this.switchView('config');
    },

  });

  my.url = function(controller, action, id) {
    if (id) {
      return '#' + controller + '/' + id + '/' + action;
    } else {
      return '#' + controller + '/' + action;
    }
  }

  return my;
}(jQuery);

