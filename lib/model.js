var showdown = new Showdown.converter();
this.CKAN = this.CKAN || {};

// Global object that stores all CKAN models.
CKAN.Model = function ($, _, Backbone, undefined) {

  var Model = {};

  // A Base model that all CKAN models inherit from. Methods that should be
  // shared across all models should be defined here. 
  Model.Base = Backbone.Model.extend({

    // Extend the default Backbone.Model constructor simply to provide a named
    // function. This improves debugging in consoles such as the Webkit inspector.
    constructor: function Base() {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    },

    // Rather than letting the models connect to the server themselves we
    // leave this to the implementor to decide how models are saved. This allows
    // the API details such as API key and enpoints to change without having
    // to update the models. When `.save()` or `.destroy()` is called the
    // `"sync"` event will be published with the arguments provided to `.sync()`.
    //
    //    var package = new Package({name: 'My Package Name'});
    //    package.bind('sync', Backbone.sync);
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
      Model.Base.prototype.constructor.apply(this, arguments);
    },

    // Override the `set()` method on `Backbone.Model` to handle resources as
    // relationships. This will now manually update the `"resouces"` collection
    // (using `_updateResources()`) with any `Resource` models provided rather
    // than replacing the key.
    set: function (attributes, options) {
      var resources, validated;

      // If not yet defined set the resources collection. This will be done when
      // set is called for the first time in the constructor.
      if (!this.get('resources')) {
        this.attributes.resources = new Backbone.Collection();
        this.attributes.resources.model = Model.Resource;
      }

      if (attributes && attributes.resources) {
        if (!(attributes.resources instanceof Backbone.Collection)) {
          resources = attributes.resources;
          delete attributes.resources;
        }
      }

      validated = Model.Base.prototype.set.call(this, attributes, options);

      // Ensure validation passed before updating resource relationships.
      if (validated && resources) {
        this._updateResources(resources);
      }

      return validated;
    },

    // Manages the one to many relationship between resources and the dataset.
    // Accepts an array of Resources (ideally model instances but will convert
    // object literals into resources for you). New models will be added to the
    // collection and existing ones updated. Any pre-existing models not found
    // in the new array will be removed.
    _updateResources: function (resources) {
      var collection = this.get('resources'),
          ids = {};

      // Add/Update models.
      _.each(resources, function (resource) {
        var existing = collection.get(resource.id);
        if (!existing) {
          collection.add(resource);
        }
        else if (existing && !(resource instanceof Model.Resource)) {
          // Only update if not an object literal.
          existing.set(resource);
        }
        ids[resource.id] = 1;
      });

      // Remove missing models.
      collection.remove(collection.select(function (resource) {
        return !ids[resource.id];
      }));
    },

    // NOTE: Returns localised URL.
    toTemplateJSON: function () {
      var out = this.toJSON();
      out.ckan_url = '/package/' + this.get('name');
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

    // Override the default `set()` method to create a `"dataset"` key pointing
    // to the parent dataset. This will then delete the `"package_id"` key from
    // the provided attributes.
    set: function (attrs, options) {
      if (attrs && attrs.package_id) {
        attrs.dataset = new Model.Dataset({id: attrs.package_id});
        delete attrs.package_id;
      }
      return Model.Base.prototype.set.call(this, attrs, options);
    },

    // Validates the provided attributes. Returns an object literal of
    // attribute/error pairs if invalid, `undefined` otherwise.
    validate: function (attrs) {
      if (attrs && !attrs.url && !this.get('url')) {
        console.log(attrs.url, this);
        return {
          'url': 'URL must be set'
        };
      }
    }
  });

  // Collection for managing results from the CKAN search API. An additional
  // `options.total` parameter can be provided on initialisation to
  // indicate how many models there are on the server in total. This can
  // then be accessed via the `total` property.
  Model.SearchCollection = Backbone.Collection.extend({
    constructor: function SearchCollection(models, options) {
      if (options && options.total) {
        this.total = options.total;
      }
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }
  });

  return Model;

}(this.jQuery, this._, this.Backbone);
