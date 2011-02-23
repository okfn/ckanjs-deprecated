var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Remote = function($) {
  var my = {};  
  my.url = CKAN.Config.url;
  my.api = my.url + '/api';
  my.apiSearch = my.api + '/search';
  my.apiRest = my.api + '/rest';

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
          my.notify('Save failed ' + textStatus, 'error');
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
  
  my.setApiKey = function(q) {

  };

  my.showNotification = function(e, msg, type) {
    alert(msg);
  }

  my.initialize = function() {
    my.$results = $('#results');
    my.$dialog = $('#dialog'); 
    $(document).bind('notification', my.showNotification);
    $('#search-form').submit(function() {
      var q = $('input.search').val();
      my.search(q);
      return false;
    });
  };

  my.showSpinner = function() {
    my.$dialog.empty();
    my.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
    my.$dialog.show();
  };

  my.hideSpinner = function() {
    my.$dialog.empty().hide()
  };

  my.search = function(q) {
    var apiUrlSearch = CKAN.Remote.apiSearch + '/package?q='
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
      item.ckan_url = CKAN.Remote.url + '/package/' + item.name;

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
    $('.editable').editable(CKAN.Remote.saveFromEditable);
    $('.editable-area').editable(
      CKAN.Remote.saveFromEditable, {
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
