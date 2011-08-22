var showdown = new Showdown.converter();
this.CKAN = this.CKAN || {};

// Global object that stores all CKAN models.
CKAN.Model = function ($, _, Backbone, undefined) {

  var Model = {};

  // Simple validator helper returns a `validate()` function that checks
  // the provided model keys and returns an error object if these do not
  // exist on the model or the attributes object provided.\
  //
  //     validate: validator('title', 'description', url)
  //
  function validator() {
    var required = arguments;
    return function (attrs) {
      var errors;
      if (attrs) {
        _.each(required, function (key) {
          if (!attrs[key] && !this.get(key)) {
            if (!errors) {
              errors = {};
            }
            errors[key] = 'The "' + key + '" is required';
          }
        }, this);
      }
      return errors;
    };
  }

  // A Base model that all CKAN models inherit from. Methods that should be
  // shared across all models should be defined here.
  Model.Base = Backbone.Model.extend({

    // Extend the default Backbone.Model constructor simply to provide a named
    // function. This improves debugging in consoles such as the Webkit inspector.
    constructor: function Base(attributes, options) {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    },

    // Rather than letting the models connect to the server themselves we
    // leave this to the implementor to decide how models are saved. This allows
    // the API details such as API key and enpoints to change without having
    // to update the models. When `.save()` or `.destroy()` is called the
    // `"sync"` event will be published with the arguments provided to `.sync()`.
    //
    //     var package = new Package({name: 'My Package Name'});
    //     package.bind('sync', Backbone.sync);
    //
    // This method returns itself for chaining.
    sync: function () {
      return this.trigger.apply(this, ['sync'].concat(_.toArray(arguments)));
    },

    // Overrides the standard `toJSON()` method to serialise any nested
    // Backbone models and collections (or any other object that has a `toJSON()`
    // method).
    toJSON: function () {
      var obj = Backbone.Model.prototype.toJSON.apply(this, arguments);
      _.each(obj, function (value, key) {
        if (value && typeof value === 'object' && value.toJSON) {
          obj[key] = value.toJSON();
        }
      });
      return obj;
    }
  });

  // Model objects
  Model.Dataset = Model.Base.extend({
    constructor: function Dataset() {
      // Define an key/model mapping for child relationships. These will be
      // managed as a Backbone collection when setting/getting the key.
      this.children = {
        resources: Model.Resource,
        relationships: Model.Relationship
      };
      Model.Base.prototype.constructor.apply(this, arguments);
    },

    defaults: {
      title: '',
      name: '',
      notes: '',
      resources: [],
      tags: []
    },

    // Override the `set()` method on `Backbone.Model` to handle resources as
    // relationships. This will now manually update the `"resouces"` collection
    // (using `_updateResources()`) with any `Resource` models provided rather
    // than replacing the key.
    set: function (attributes, options) {
      var children, validated;

      // If not yet defined set the child collections. This will be done when
      // set is called for the first time in the constructor.
      this._createChildren();

      // Check to see if any child keys are present in the attributes and
      // remove them from the object. Then update them seperately after the
      // parent `set()` method has been called.
      _.each(this.children, function (Model, key) {
        if (attributes && attributes[key]) {
          if (!(attributes[key] instanceof Backbone.Collection)) {
            if (!children) {
              children = {};
            }
            children[key] = attributes[key];
            delete attributes[key];
          }
        }
      }, this);

      validated = Model.Base.prototype.set.call(this, attributes, options);

      // Ensure validation passed before updating child models.
      if (validated && children) {
        this._updateChildren(children);
      }

      return validated;
    },

    // Checks to see if our model instance has Backbone collections defined for
    // child keys. If they do not exist it creates them.
    _createChildren: function () {
      _.each(this.children, function (Model, key) {
        if (!this.get(key)) {
          var newColl = new Backbone.Collection();
          this.attributes[key] = newColl;
          newColl.model = Model;
          // bind change events so updating the children trigger change on Dataset
          var self = this;
          // TODO: do we want to do all or be more selective
          newColl.bind('all', function() {
            self.trigger('change');
          });
        }
      }, this);
      return this;
    },

    // Manages the one to many relationship between resources and the dataset.
    // Accepts an array of Resources (ideally model instances but will convert
    // object literals into resources for you). New models will be added to the
    // collection and existing ones updated. Any pre-existing models not found
    // in the new array will be removed.
    _updateChildren: function (children) {
      _.each(children, function (models, key) {
        var collection = this.get(key),
            ids = {};

        // Add/Update models.
        _.each(models, function (model) {
          var existing = collection.get(model.id),
              isLiteral = !(model instanceof this.children[key]);

          // Provide the dataset key if not already there and current model is
          // not a relationship.
          if (isLiteral && key !== 'relationships') {
            model.dataset = this;
            delete model.package_id;
          }

          if (!existing) {
            collection.add(model);
          }
          else if (existing && isLiteral) {
            existing.set(model);
          }

          ids[model.id] = 1;
        }, this);

        // Remove missing models.
        collection.remove(collection.select(function (model) {
          return !ids[model.id];
        }));
      }, this);
      return this;
    },

    // NOTE: Returns localised URL.
    toTemplateJSON: function () {
      var out = this.toJSON();
      var title = this.get('title');
      out.displaytitle = title ? title : 'No title ...';
      var notes = this.get('notes');
      out.notesHtml = showdown.makeHtml(notes ? notes : '');
      out.snippet = this.makeSnippet(out.notesHtml);
      return out;
    },

    makeSnippet: function (notesHtml) {
      var out = $(notesHtml).text();
      if (out.length > 190) {
        out = out.slice(0, 190) + ' ...';
      }
      return out;
    }
  });

  // A model for working with resources. Each resource is _required_ to have a
  // parent `Dataset`. This must be provided under the `"dataset"` key when the
  // `Resource` is created. This is handled for you when creating resources
  // via the `Dataset` `set()` method.
  //
  // The `save()`, `fetch()` and `delete()` methods are mapped to the parent
  // dataset and can be used to update a Resource's metadata.
  //
  //     var resource = new Model.Resource({
  //       name: 'myresource.csv',
  //       url:  'http://www.example.com/myresource.csv',
  //       dataset: dataset
  //     });
  //
  //     // Updates the resource name on the server by saving the parent dataset
  //     resource.set({name: 'Some new name'});
  //
  Model.Resource = Model.Base.extend({
    constructor: function Resource() {
      Model.Base.prototype.constructor.apply(this, arguments);
    },

    // Override the `save()` method to update the Resource with attributes then
    // call the parent dataset and save that. Any `options` provided will be
    // passed on to the dataset `save()` method.
    save: function (attrs, options) {
      var validated = this.set(attrs);
      if (validated) {
        return this.get('dataset').save({}, options);
      }
      return validated;
    },

    // Override the `fetch()` method to call `fetch()` on the parent dataset.
    fetch: function (options) {
      return this.get('dataset').fetch(options);
    },

    // Override the `fetch()` method to trigger the `"destroy"` event which
    // will remove it from any collections then save the parent dataset.
    destroy: function (options) {
      return this.trigger('destroy', this).get('dataset').save({}, options);
    },

    // Override the `toJSON()` method to set the `"package_id"` key required
    // by the server.
    toJSON: function () {
      // Call Backbone.Model rather than Base to break the circular reference.
      var obj = Backbone.Model.prototype.toJSON.apply(this, arguments);
      if (obj.dataset) {
        obj.package_id = obj.dataset.id;
        delete obj.dataset;
      } else {
        obj.package_id = null;
      }
      return obj;
    },

    toTemplateJSON: function() {
      var obj = Backbone.Model.prototype.toJSON.apply(this, arguments);
      obj.displaytitle = obj.description ? obj.description : 'No description ...';
      return obj;
    },

    // Validates the provided attributes. Returns an object literal of
    // attribute/error pairs if invalid, `undefined` otherwise.
    validate: validator('url')
  });

  // Helper function that returns a stub method that warns the devloper that
  // this method has not yet been implemented.
  function apiPlaceholder(method) {
    var console = window.console;
    return function () {
      if (console && console.warn) {
        console.warn('The method "' + method + '" has not yet been implemented');
      }
      return this;
    };
  }

  // A model for working with relationship objects. These are currently just the
  // realtionship objects returned by the server wrapped in a `Base` model
  // instance. Currently there is no save or delete functionality.
  Model.Relationship = Model.Base.extend({
    constructor: function Relationship() {
      Model.Base.prototype.constructor.apply(this, arguments);
    },

    // Add placeholder method that simply returns itself to all methods that
    // interact with the server. This will also log a warning message to the
    // developer into the console.
    save: apiPlaceholder('save'),
    fetch: apiPlaceholder('fetch'),
    destroy: apiPlaceholder('destroy'),

    // Validates the provided attributes. Returns an object literal of
    // attribute/error pairs if invalid, `undefined` otherwise.
    validate: validator('object', 'subject', 'type')
  });

  // Collection for managing results from the CKAN search API. An additional
  // `options.total` parameter can be provided on initialisation to
  // indicate how many models there are on the server in total. This can
  // then be accessed via the `total` property.
  Model.SearchCollection = Backbone.Collection.extend({
    constructor: function SearchCollection(models, options) {
      if (options) {
        this.total = options.total;
      }
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }
  });

  return Model;

}(this.jQuery, this._, this.Backbone);
