var showdown = new Showdown.converter();
var CKAN = CKAN || {};

CKAN.Model = function($) {
  var my = {};

  // Update model configuration with cfg
  // cfg is hash with endpoint and api_key
  my.configure = function(cfg) {
    if(cfg.endpoint.length > 0 && cfg.endpoint.slice(-1) == '/') {
      cfg.endpoint = cfg.endpoint.slice(0,-1);
    }
    my.url = cfg.endpoint;
    my.api = my.url + '/api/2';
    my.apiSearch = my.api + '/search';
    my.apiRest = my.api + '/rest';
    my.api_key = cfg.api_key;
  }

  my.notify = function(msg, type) {
    $.event.trigger('notification', [msg, type]);
  }

  // Model objects
  my.Dataset = Backbone.Model.extend({
    url : function() {
      var base = my.apiRest +  '/package';
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

  my.Resource = Backbone.Model.extend({
    url: function() {
      var base = my.apiRest +  '/resource';
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
    model: my.Dataset,

    _loadJSONP: function () {
      var self = this;
      $.ajax({
        dataType: "jsonp",
        cache: true, // Need this to disable cache query string param which breaks api.
        url: this.url(),
        success: function (data) {
          self.resultsCount = data.count;
          self.refresh(data.results);
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

  my.SearchResults = SearchResults;

  /*
   * Setting the api header as a global ajax option..
   * (no need of overriding the Backbone.sync anymore)
   */
  jQuery.ajaxSetup({
    beforeSend: function (xhr, settings) {
      xhr.setRequestHeader("X-CKAN-API-KEY", my.api_key);
    }
  });

  return my;
}(jQuery);
