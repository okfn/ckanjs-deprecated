this.CKAN = this.CKAN || {};

this.CKAN.Client = (function (_, Backbone, undefined) {

  // Client constructor. Creates a new client for communicating with
  // the CKAN API.
  function Client(config) {
    this.env = {};
    this.environment(config || Client.defaults);
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
          return this.env[key];
        }
        this.env[key] = value;
      } else {
        _.extend(this.env, key);
      }
      return this;
    }
  });

  return Client;

})(this._, this.Backbone);
