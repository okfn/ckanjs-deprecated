var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Model = function($) {
  var my = {};
  my.Package = Backbone.Model.extend({});

  return my;
}(jQuery);

CKAN.View = function($) {
  var my = {};

  my.PackageCreateView = Backbone.View.extend({
    render: function() {
      var tmpl = $('#tmpl-package-form').tmpl(this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    }
  });

  return my;
}(jQuery);

CKAN.Catalog = function($) {
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
  
  my.saveFromEditable = function(value, settings) {
    var attrname = $(this).attr('ckan-attrname');
    var pkg_id = $(this).closest('.ckan-package').attr('ckan-package-id');
    var url = my.apiRest + '/package/'+ pkg_id;
    data = {};
    data[attrname] = value;

    $.ajax({
        type :'PUT',
        url: url,
        data: JSON.stringify(data),
        dataType: 'json',
        beforeSend: function(XMLHttpRequest) {
          XMLHttpRequest.setRequestHeader("X-CKAN-API-KEY", my.apikey);
        },
        error: function(xhr, textStatus, error) { 
          msg = 'Error: ' + xhr.responseText;
          my.notify(msg, 'error');
        },
        success: function(context, data, xhr) {
          // In WebKit and FF an unsuccessful request using CORS still
          // returns success
          if(xhr.status == 0) {
            msg = 'Sorry, save failed!\n';
            msg += '(Not exactly sure why, but please check your API key ';
            msg += 'and that CORS is enabled on the server)';
            my.notify(msg, 'error')
          }
        }
    });

    return value;
  };

  return my;
}(jQuery);

CKAN.UI = function($) {
  var my = {};
  
  my.initialize = function() {
    my.$results = $('#results');
    my.$dialog = $('#dialog'); 
    my.$ckanUrl = $('#config-form input[name=ckan-url]');
    my.$apikey = $('#config-form input[name=ckan-api-key]');

    $(document).bind('notification', my.showNotification);
    $('#search-form').submit(function() {
      var q = $('input.search').val();
      my.search(q);
      return false;
    });

    // initialize from file config
    my.$ckanUrl.val(CKAN.Config.url);
    my.$apikey.val(CKAN.Config.apikey ? CKAN.Config.apikey : '');
    my.configureCatalog();

    $('#config-form').submit(function(e) {
      e.preventDefault();
      my.$ckanUrl.val(my.$ckanUrl.val());
      my.$apikey.val(my.$apikey.val());
      my.configureCatalog();
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

    $('#access .menu a[href=#add]').click(function (e) {
      var newPkg = new CKAN.Model.Package();
      var newCreateView = new CKAN.View.PackageCreateView({model: newPkg});
      $('#add-page').append(newCreateView.render().el);
    });
  };

  my.configureCatalog = function() {
    CKAN.Catalog.configure(my.$ckanUrl.val(), my.$apikey.val());
  };

  my.showNotification = function(e, msg, type) {
    alert(msg);
  }

  my.showSpinner = function() {
    my.$dialog.empty();
    my.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
    my.$dialog.show();
  };

  my.hideSpinner = function() {
    my.$dialog.empty().hide()
  };

  my.search = function(q) {
    var apiUrlSearch = CKAN.Catalog.apiSearch + '/package?q='
    var url = apiUrlSearch + q + '&limit=10&all_fields=1';
    my.showSpinner();
    my.$results.hide();
    $.ajax({
      url: url,
      success: my.renderSearchResults,
      dataType: 'jsonp'
    });
  };

  my.renderSearchResults = function(data) {
    var $results = my.$results;
    $results.find('.count').html(data.count);

    $(data.results).each(function(idx, item) {
      item.ckan_url = CKAN.Catalog.url + '/package/' + item.name;

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
    });
    var out = $('#tmpl-package-summary').tmpl(data.results);
    $results.find('.packages').html(out);
    my.hideSpinner();
    $results.show();
    my.makeEditable();
  };
  
  my.makeEditable = function() {
    $('.editable').editable(CKAN.Catalog.saveFromEditable);
    $('.editable-area').editable(
      CKAN.Catalog.saveFromEditable, {
        type      : 'textarea',
        cancel    : 'Cancel',
        submit    : 'OK',
        tooltip   : 'Click to edit...',
        data      : function(value, settings) {
          // Get raw markdown for this package
          return value
        }
      }
    );
  }
  return my;
}(jQuery);

var CKAN = function($, my) {
  my.initialize = function() {
    CKAN.UI.initialize();
  };
  return my
}(jQuery, CKAN);
