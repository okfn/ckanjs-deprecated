var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Model = function($) {
  var my = {};

  my.configure = function(url, apikey) {
    my.url = url;
    my.api = my.url + '/api';
    my.apiSearch = my.api + '/search';
    my.apiRest = my.api + '/rest';
    my.apikey = apikey;
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

CKAN.View = function($) {
  var my = {};

  my.PackageCreateView = Backbone.View.extend({
    render: function() {
      var tmpl = $('#tmpl-package-form').tmpl(this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    },

    events: {
      'submit form.package': 'saveData'
    },

    saveData: function(e) {
      e.preventDefault();
      this.model.save(this.getData());
      return false;
    },

    getData: function() {
      var _data = $(this.el).find('form.package').serializeArray();
      modelData = {};
      $.each(_data, function(idx, value) {
        modelData[value.name.split('--')[1]] = value.value
      });
      return modelData;
    }

  });

  my.PackageSearchView = Backbone.View.extend({
    initialize: function() {
      this.el = $('#search-page');
      this.$results = this.el.find('.results');
      this.$dialog = this.el.find('.dialog');
      this.el.find('#search-form').submit(this.doSearch.bind(this));

      _.bindAll(this, 'addOne', 'render');
      this.collection = CKAN.Model.PackageSearchResults;
      // listen for one add event to package list
      this.collection.bind('add', this.addOne);
      // bind to all events
      // this.collection.bind('all', this.render);
      $(document).bind('searchComplete', this.render.bind(this));
    },

    render: function() {
      this.$results.find('.count').html(this.collection.count);
      this.hideSpinner();
      this.$results.show();
      // this.makeEditable();
    },

    addOne: function(pkg) {
      var out = $('#tmpl-package-summary').tmpl(pkg.toJSON());
      this.$results.find('.packages').append(out);
      return this;
    },

//    makeEditable = function() {
//      $('.editable').editable(CKAN.Model.saveFromEditable);
//      $('.editable-area').editable(
//        CKAN.Model.saveFromEditable, {
//          type      : 'textarea',
//          cancel    : 'Cancel',
//          submit    : 'OK',
//          tooltip   : 'Click to edit...',
//          data      : function(value, settings) {
//            // Get raw markdown for this package
//            return value
//          }
//        }
//      );
//    }

    // does not seem to work (perhaps because run before document is ready?
    events: {
      'submit #search-form': 'doSearch'
    },
    
    doSearch: function() {
      var q = $(this.el).find('input.search').val();
      this.showSpinner();
      this.$results.hide();
      this.$results.find('.packages').empty();
      CKAN.Model.search(q, function(data) {
      });
      return false;
    },

    showSpinner: function() {
      this.$dialog.empty();
      this.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
      this.$dialog.show();
    },

    hideSpinner: function() {
      this.$dialog.empty().hide()
    }

  });

  return my;
}(jQuery);

CKAN.UI = function($) {
  var my = {};
  
  my.initialize = function() {
    my.$ckanUrl = $('#config-form input[name=ckan-url]');
    my.$apikey = $('#config-form input[name=ckan-api-key]');
    my.$notificationDiv = $('.flash-banner-box');

    $(document).bind('notification', my.showNotification);

    // initialize from file config
    my.$ckanUrl.val(CKAN.Config.url);
    my.$apikey.val(CKAN.Config.apikey ? CKAN.Config.apikey : '');
    my.configureModel();

    $('#config-form').submit(function(e) {
      e.preventDefault();
      my.$ckanUrl.val(my.$ckanUrl.val());
      my.$apikey.val(my.$apikey.val());
      my.configureModel();
      my.showNotification(null, 'Saved configuration', 'success');
    });

    // load templates
    // TODO: is there a problem that this is async (e.g. we complete an
    // action that requires templates before they are loaded?)
    // $.get('templates/_ckan.tmpl.html', function(templates) {
    //  // Inject all those templates at the end of the document.
    //  $('body').append(templates);
    // });

    $('#access .menu a').click(function(e) {
      // have links like a href="#search" ...
      var action = $(e.target).attr('href').slice(1);
      $('.page-view').hide();
      $('#' + action + '-page').show();
    });

    var newPkg = new CKAN.Model.Package();
    var newCreateView = new CKAN.View.PackageCreateView({model: newPkg});
    $('#add-page').append(newCreateView.render().el);
    var searchView = new CKAN.View.PackageSearchView();
  };

  my.configureModel = function() {
    CKAN.Model.configure(my.$ckanUrl.val(), my.$apikey.val());
  };

  // TODO: should this be in initialize or even in a separate view?
  $.template('notificationTemplate',
      '<div class="flash-banner ${type}">${message} <button>X</button></div>');
  $('.flash-banner button').live('click', function(e) {
    e.preventDefault() 
    my.$notificationDiv.slideUp(200);
  });
  my.showNotification = function(e, msg, type) {
    var _out = $.tmpl('notificationTemplate', {'message': msg, 'type': type})
    my.$notificationDiv.html(_out);
    my.$notificationDiv.slideDown(400);
  }

  return my;
}(jQuery);

var CKAN = function($, my) {
  my.initialize = function() {
    CKAN.UI.initialize();
  };
  return my
}(jQuery, CKAN);
