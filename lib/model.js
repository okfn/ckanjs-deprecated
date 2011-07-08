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

  // Update model configuration with cfg
  // cfg is hash with endpoint and api_key
  Model.configure = function(cfg) {
    if(cfg.endpoint.length > 0 && cfg.endpoint.slice(-1) == '/') {
      cfg.endpoint = cfg.endpoint.slice(0,-1);
    }
    Model.url = cfg.endpoint;
    Model.api = Model.url + '/api/2';
    Model.apiSearch = Model.api + '/search';
    Model.apiRest = Model.api + '/rest';
    Model.api_key = cfg.api_key;
  }

  // Model objects
  Model.Dataset = Backbone.Model.extend({
    url : function() {
      var base = Model.apiRest +  '/package';
      if (this.isNew()) return base;
      var out = base + (base.charAt(base.length - 1) == '/' ? '' : '/');
      if (this.get('name')) {
        out += this.get('name');
      } else {
        out += this.id;
      }
      return out;
    },

    toTemplateJSON: function() {
      var out = this.toJSON();
      out.ckan_url = CKAN.Model.url + '/package/' + this.get('name');
      var title = this.get('title');
      out.displaytitle = title ? title : 'No title ...';
      var notes = this.get('notes');
      out.notesHtml = showdown.makeHtml(notes ? notes : '');
      out.snippet = this.makeSnippet(out.notesHtml);
      return out;
    },

    makeSnippet: function(notesHtml) {
      var out = $(notesHtml).text();
      if (out.length > 190) {
        out = out.slice(0, 190) + ' ...';
      }
      return out;
    }
  });

  Model.Resource = Backbone.Model.extend({
    url: function() {
      var base = Model.apiRest +  '/resource';
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },

    validate: function(attrs) {
      if (!attrs.url) {
        return {
          'url': 'URL must be set'
        }
      }
    }
  });


  var SearchResults = Backbone.Collection.extend({
    model: Model.Dataset,

    _loadJSONP: function () {
      var self = this;
      $.ajax({
        dataType: "jsonp",
        cache: true, // Need this to disable cache query string param which breaks api.
        url: this.url(),
        success: function (data) {
          self.resultsCount = data.count;
          self.reset(data.results);
        }
      });
    },

    query: function (query) {
      query = query || {};
      if (!"limit" in query) {
        query.limit = 10;
      }
      var queryString = "";
      _.each(query, function (value, key) {
        queryString += key + "=" + value + "&";
      });

      this.url = function () {
        return SearchResults.baseUri+queryString.replace(/\&$/,"");
      };

      this._loadJSONP();
    }
  });

  SearchResults.baseUri = "http://ckan.net/api/2/search/package?all_fields=1&";

  Model.SearchResults = SearchResults;

  return Model;

}(this.jQuery, this._, this.Backbone);
