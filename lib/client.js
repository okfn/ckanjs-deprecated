this.CKAN = this.CKAN || {};

this.CKAN.Client = (function (CKAN, $, _, Backbone, undefined) {

  // Client constructor. Creates a new client for communicating with
  // the CKAN API.
  function Client(config) {
    this._environment = {};
    this.configure(config || Client.defaults);

    _.bindAll(this, 'syncDataset', '_datasetConverter');
  }

  // Default config parameters for the Client.
  Client.defaults = {
    apiKey: '',
    endpoint: 'http://ckan.net'
  };

  // Extend the Client prototype with Backbone.Events to provide .bind(),
  // .unbind() and .trigger() methods.
  _.extend(Client.prototype, Backbone.Events, {

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
    // parameters should be provided in the `options.data` property.
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
      options.data = _.extend({'limit': 10, 'all_fields': 1}, options.data);

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
    }
  });

  return Client;

})(this.CKAN, this.$, this._, this.Backbone);
