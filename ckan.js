var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Remote = function($) {
  var my = {};  
  my.url = CKAN.Config.url;
  my.api = my.url + '/api';
  my.apiSearch = my.api + '/search';
  my.apiRest = my.api + '/rest';
  
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
        error: function(e) { alert(e) },
        success: function(e) {
            var msg = 'success!'+e;
            alert(msg) 
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

  my.search = function(q) {
    var apiUrlSearch = CKAN.Remote.apiSearch + '/package?q='
    var url = apiUrlSearch + q + '&limit=10&all_fields=1';
    $.ajax({
      url: url,
      success: my.renderSearchResults,
      dataType: 'jsonp'
    });
  };

  my.renderSearchResults = function(data) {
    var $results = $('#results');
    $results.find('.count').html(data.count);
    $results.show();

    $(data.results).each(function(idx, item) {
      item.ckan_url = CKAN.Remote.url + '/package/' + item.name;

      item.displaytitle = item.title ? item.title : 'No Title ...';

      item.snippet = $(showdown.makeHtml(item.notes ? item.notes : '')).text();
      if (item.snippet.length > 190) {
        item.snippet = item.snippet.slice(0, 190) + ' ...';
      }

      // for templating (to be ckan compatible)
      item.package = item;
    });
    var out = $('#tmpl-package-summary').tmpl(data.results);
    $results.find('.packages').html(out);
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
    $('#search-form').submit(function() {
      var q = $('input.search').val();
      CKAN.UI.search(q);
      return false;
    });
  };
  return my
}(jQuery, CKAN);
