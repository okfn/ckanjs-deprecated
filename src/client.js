this.CKAN = this.CKAN || {};

this.CKAN.Client = (function (CKAN, $, _, Backbone, undefined) {

  // Client constructor. Creates a new client for communicating with
  // the CKAN API.
  function Client(config) {
    this._environment = {};
    this.configure(config || Client.defaults);

    _.bindAll(this, 'syncDataset', '_datasetConverter', 'syncGroup');
  }

  // Default config parameters for the Client.
  Client.defaults = {
    apiKey: '',
    endpoint: 'http://ckan.net'
  };

  // Extend the Client prototype with Backbone.Events to provide .bind(),
  // .unbind() and .trigger() methods.
  _.extend(Client.prototype, Backbone.Events, {

    cache: {
      dataset: new Backbone.Collection(),
      group: new Backbone.Collection()
    },

    // Allows the implementor to specify an object literal of settings to
    // configure the current client. Options include:
    //
    // - apiKey: The API key for the current user to create/edit datasets.
    // - endpoint: The API endpoint to connect to.
    configure: function (config) {
      config = config || {};
      if (config.endpoint) {
        config.endpoint = config.endpoint.replace(/\/$/, '');
        config.restEndpoint   = config.endpoint + '/api/2/rest';
        config.searchEndpoint = config.endpoint + '/api/2/search';
      }
      return this.environment(config);
    },

    // Client environment getter/setter. Environment variables can be retrieved
    // by providing a key string, if the key does not exist the method will
    // return `undefined`. To set keys either a key value pair can be provided
    // or an object literal containing multiple key/value pairs.
    environment: function (key, value) {
      if (typeof key === "string") {
        if (arguments.length === 1) {
          return this._environment[key];
        }
        this._environment[key] = value;
      } else {
        _.extend(this._environment, key);
      }
      return this;
    },

    // Helper method to fetch datasets from the server. Using this method to
    // fetch datasets will ensure that only one instance of a model per server
    // resource exists on the page at one time.
    //
    // The method accepts the dataset `"id"` and an object of `"options"`, these
    // can be any options accepted by the `.fetch()` method on `Backbone.Model`.
    // If the model already exists it will simply be returned otherwise an empty
    // model will be returned and the data requested from the server.
    //
    //     var dataset = client.getDatasetById('my-data-id', {
    //       success: function () {
    //         // The model is now populated.
    //       },
    //       error: function (xhr) {
    //         // Something went wrong check response status etc.
    //       }
    //     });
    //
    getDatasetById: function (id, options) {
      var cache   = this.cache.dataset,
          dataset = cache.get(id);
      var ourOptions = options || {};

      if (!dataset) {
        dataset = this.createDataset({id: id});

        // Add the stub dataset to the global cache to ensure that only one
        // is ever created.
        cache.add(dataset);
        
        // Fetch the dataset from the server passing in any options provided.
        // Also set up a callback to remove the model from the cache in
        // case of error.
        ourOptions.error = function () {
          cache.remove(dataset);
        };
        // TODO: RP not sure i understand what this does and why it is needed
        dataset.fetch(ourOptions);
      }
      return dataset;
    },

    // Helper method to create a new instance of CKAN.Model.Dataset and
    // register a sync listener to update the representation on the server when
    // the model is created/updated/deleted.
    //
    //     var myDataset = client.createDataset({
    //       title: "My new data set"
    //     });
    //
    // This ensures that the models are always saved with the latest environment
    // data.
    createDataset: function (attributes) {
      return (new CKAN.Model.Dataset(attributes)).bind('sync', this.syncDataset);
    },

    // A wrapper around Backbone.sync() that adds additional ajax options to
    // each request. These include the API key and the request url rather than
    // using the model to generate it.
    syncDataset: function (method, model, options) {
      // Get the package url.
      var url = this.environment('restEndpoint') + '/package';

      // Add additional request options.
      options = _.extend({}, {
        url: model.isNew() ? url : url + '/' + model.id,
        headers: {
          'X-CKAN-API-KEY': this.environment('apiKey')
        }
      }, options);

      Backbone.sync(method, model, options);
      return this;
    },

    // Performs a search for datasets against the CKAN API. The `options`
    // argument can contain any keys supported by jQuery.ajax(). The query
    // parameters should be provided in the `options.query` property.
    //
    //     var query = client.searchDatasets({
    //       success: function (datasets) {
    //         console.log(datasets); // Logs a Backbone.Collection
    //       }
    //     });
    //
    // The `options.success` method (and any other success callbacks) will
    // recieve a `SearchCollection` containing `Dataset` models. The method
    // returns a jqXHR object so that additional callbacks can be registered
    // with .success() and .error().
    searchDatasets: function (options) {
      options = options || {};
      options.data = _.defaults(options.query, {'limit': 10, 'all_fields': 1});
      delete options.query;

      return $.ajax(_.extend({
        url: this.environment('searchEndpoint') + '/package',
        converters: {
          'text json': this._datasetConverter
        }
      }, options));
    },

    // A "converter" method for jQuery.ajax() this is used to convert the
    // results from a search API request into models which in turn will be
    // passed into any registered success callbacks. We do this here so that
    // _all_ registered success callbacks recieve the same data rather than
    // just the callback registered when the search was made.
    _datasetConverter: function (raw) {
      var json = $.parseJSON(raw),
          models = _.map(json.results, function (attributes) {
            return this.createDataset(attributes);
          }, this);

      return new CKAN.Model.SearchCollection(models, {total: json.count});
    },

    getGroupById: function (id, options) {
      var cache   = this.cache.group,
          group = cache.get(id);
      var ourOptions = options || {};

      if (!group) {
        group = this.createGroup({id: id});

        // Add the stub group to the global cache to ensure that only one
        // is ever created.
        cache.add(group);
        
        // Fetch the group from the server passing in any options provided.
        // Also set up a callback to remove the model from the cache in
        // case of error.
        ourOptions.error = function () {
          cache.remove(group);
        };
        // TODO: RP not sure i understand what this does and why it is needed
        group.fetch(ourOptions);
      }
      return group;
    },

    createGroup: function (attributes) {
      return (new CKAN.Model.Group(attributes)).bind('sync', this.syncGroup);
    },

    // A wrapper around Backbone.sync() that adds additional ajax options to
    // each request. These include the API key and the request url rather than
    // using the model to generate it.
    syncGroup: function (method, model, options) {
      // Get the package url.
      var url = this.environment('restEndpoint') + '/group';

      // Add additional request options.
      options = _.extend({}, {
        url: model.isNew() ? url : url + '/' + model.id,
        headers: {
          'X-CKAN-API-KEY': this.environment('apiKey')
        }
      }, options);

      Backbone.sync(method, model, options);
      return this;
    },

    searchGroups: function (options) {
      options = options || {};
      options.data = _.defaults(options.query, {'limit': 10, 'all_fields': 1});
      delete options.query;

      return $.ajax(_.extend({
        url: this.environment('searchEndpoint') + '/package',
        converters: {
          'text json': this._datasetConverter
        }
      }, options));
    },

    // Get a list of Groups by dataset count with option to filter by a specific existing group.
    getTopGroups: function(filterGroup, success, error) {
      var self = this;
      var data = {
        'facet.field': 'groups',
        'rows': 0
      };
      if (filterGroup) {
        data.fq = 'groups:' + filterGroup;
      }
      var options = {
        type: 'POST',
        offset: '/action/package_search',
        data: JSON.stringify(data),
        success: function(data) {
          var groups = processResults(data);
          success(groups);
        }
      };
      function processResults(data) {
        var groups = _.map(data.result.facets.groups, function(count, key) {
          return {
            id: key,
            count: count
          };
        });
        groups = _.sortBy(groups, function(item) {
          return -item.count;
        });
        // TODO: exclude the group we filtered by ...
        var groupObjs = _.map(groups, function(groupInfo) {
          var group = self.getGroupById(groupInfo.id);
          group.set({filtered_dataset_count: groupInfo.count});
          return group;
        });
        return groupObjs;
      }
      this.apiCall(options);
    },

    // Performs a query on CKAN API.
    // The `options` argument can contain any keys supported by jQuery.ajax().
    // In addition it should contain either a url or offset variable. If
    // offset provided it will be used to construct the full api url by
    // prepending the endpoint plus 'api' (i.e. offset of '/2/rest/package'
    // will become '{endpoint}/api/2/rest'.
    //
    // The `options.success` method (and any other success callbacks) will
    // recieve a `SearchCollection` containing `Dataset` models. The method
    // returns a jqXHR object so that additional callbacks can be registered
    // with .success() and .error().
    apiCall: function (options) {
      options = options || {};
      var offset = options.offset || '';
      delete options.offset;
      // Add additional request options.
      options = _.extend({}, {
        url: this.environment('endpoint') + '/api' + offset,
        headers: {
          'X-CKAN-API-KEY': this.environment('apiKey')
        }
      }, options);

      return $.ajax(options);
    },

    // wrap CKAN /api/storage/auth/form - see http://packages.python.org/ckanext-storage
    // params and returns value are as for that API
    // key is file label/path 
    getStorageAuthForm: function(key, options) {
      options.offset = '/storage/auth/form/' + key;
      this.apiCall(options);
    }
  });

  return Client;

})(this.CKAN, this.$, this._, this.Backbone);
