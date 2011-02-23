var showdown = new Showdown.converter();

var CKAN = CKAN || {};

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
        type :'POST',
        url: url,
        data: data,
        error: function(xhr, textStatus, error) { 
          msg = 'Error: ' + xhr.responseText;
          my.notify(msg, 'error');
        },
        success: function(context, data, xhr) {
          // In WebKit and FF an unsuccessful request using CORS still
          // returns success
          if(xhr.status == 0) {
            msg = 'Sorry, save failed!\n(Not exactly sure why, but please check your API key and that CORS is enabled on the server)';
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

    $('.config-show a').click(function(e) {
      e.preventDefault();
      $('#config-form').toggle('fast');
    });

    $('#config-form').submit(function(e) {
      e.preventDefault();
      my.$ckanUrl.val(my.$ckanUrl.val());
      my.$apikey.val(my.$apikey.val());
      my.configureCatalog();
      $('#config-form').hide('slow');
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

      item.displaytitle = item.title ? item.title : item.name;

      item.snippet = $(showdown.makeHtml(item.notes ? item.notes : '')).text();
      if (item.snippet.length > 190) {
        item.snippet = item.snippet.slice(0, 190) + ' ...';
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
