this.CKAN = this.CKAN || {};

this.CKAN.Client = (function (_, Backbone, undefined) {

  // An object literal containing global methods to be used across the app.
  return _.extend({}, Backbone.Events, {

    // Sets up the client with various config options.
    initialize: function (config) {
      return this.environment(config);
    },

    // Object for storing environment variables.
    _environment: {},

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
    }
  });

})(this._, this.Backbone);
