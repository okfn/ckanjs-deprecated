var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Model = function($) {
  var my = {};

  // Update model configuration with cfg
  // cfg is hash with ckan_url and api_key
  my.configure = function(cfg) {
    my.url = cfg.ckan_url;
    my.api = my.url + '/api';
    my.apiSearch = my.api + '/search';
    my.apiRest = my.api + '/rest';
    my.apikey = cfg.api_key;
  }

  my.notify = function(msg, type) {
    $.event.trigger('notification', [msg, type]);
  }
  
  // Model objects
  my.Package = Backbone.Model.extend({
    url : function() {
      var base = my.apiRest +  '/package';
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },

    notesHtml: function() {
      var notes = this.get('notes');
      return showdown.makeHtml(notes ? notes : '');
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
    },

    notesHtml: function() {
      var notes = this.get('notes');
      return showdown.makeHtml(notes ? notes : '');
    }
  });

  my.search = function(q) {
    var apiUrlSearch = my.apiSearch + '/package?q='
    var url = apiUrlSearch + q + '&limit=10&all_fields=1';
    function handleSearchResults(data) {
      my.PackageSearchResults.count = data.count;

      $(data.results).each(function(idx, item) {
        item.ckan_url = CKAN.Model.url + '/package/' + item.name;

        item.displaytitle = item.title ? item.title : 'No title ...';
        item.notesHtml = function() {
          return showdown.makeHtml(this.notes ? this.notes : '');
        }
        item.snippet = function() {
          var out = $(this.notesHtml()).text();
          if (out.length > 190) {
            out = out.slice(0, 190) + ' ...';
          }
          return out;
        }

        // for templating (to be ckan compatible)
        item.package = item;

        var pkg = new my.Package(item);
        my.PackageSearchResults.add(pkg);
      });

      $.event.trigger('searchComplete');
    }
    $.ajax({
      url: url,
      success: handleSearchResults,
      dataType: 'jsonp'
    });
  }

  my.PackageSearchResultsList = Backbone.Collection.extend({
    model: my.Package
  });

  // making it a singleton (may wish to change this if one could do multiple searches at once)
  my.PackageSearchResults = new my.PackageSearchResultsList;

  // Following 2 methods come directly from Backbone
  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };
  var getUrl = function(object) {
    if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // Backbone.sync - original plus modifications to send auth headers etc
  Backbone.sync = function(method, model, success, error) {
    var type = methodMap[method];
    var modelJSON = (method === 'create' || method === 'update') ?
                    JSON.stringify(model.toJSON()) : null;

    // TODO: use success / error passed in ...
    error = function(xhr, textStatus, error) { 
      msg = 'Error: ' + xhr.responseText;
      my.notify(msg, 'error');
    }
    var success = function(context, data, xhr) {
      // In WebKit and FF an unsuccessful request using CORS still
      // returns success
      if(xhr.status == 0) {
        msg = 'Sorry, save failed!\n';
        msg += '(Not exactly sure why, but please check your API key ';
        msg += 'and that CORS is enabled on the server)';
        my.notify(msg, 'error')
      } else {
        my.notify('Saved', 'success');
      }
    }

    // Default JSON-request options.
    var params = {
      url:          getUrl(model),
      type:         type,
      data:         modelJSON,
      dataType:     'json',
      processData:  false,
      success:      success,
      error:        error,
      beforeSend: function(XMLHttpRequest) {
        XMLHttpRequest.setRequestHeader("X-CKAN-API-KEY", my.apikey);
      }
    };

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.processData = true;
      params.data        = modelJSON ? {model : modelJSON} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }

    // Make the request.
    $.ajax(params);
  };

  return my;
}(jQuery);

