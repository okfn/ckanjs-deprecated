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
    }
  });

  // Model objects
  Model.Dataset = Model.Base.extend({
    constructor: function Dataset() {
      Model.Base.prototype.constructor.apply(this, arguments);
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

    validate: function (attrs) {
      if (!attrs.url) {
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
