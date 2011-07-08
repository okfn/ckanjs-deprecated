this.CKAN = this.CKAN || {};

this.CKAN.Client = (function (CKAN, _, Backbone, undefined) {

  // Client constructor. Creates a new client for communicating with
  // the CKAN API.
  function Client(config) {
    this._environment = {};
    this.environment(config || Client.defaults);

    _.bindAll(this, 'syncDataset');
  }

  // Default config parameters for the Client.
  Client.defaults = {};

  // Extend the Client prototype with Backbone.Events to provide .bind(),
  // .unbind() and .trigger() methods.
  _.extend(Client.prototype, Backbone.Events, {

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
      var url = this.environment('rest-endpoint') + '/package';

      // Add additional request options.
      options = _.extend({}, {
        url: model.isNew() ? url : url + '/' + model.id,
        headers: {
          'X-CKAN-API-KEY': this.environment('api-key')
        }
      }, options);

      Backbone.sync(method, model, options);
      return this;
    }
  });

  return Client;

})(this.CKAN, this._, this.Backbone);
