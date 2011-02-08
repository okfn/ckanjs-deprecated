var showdown = new Showdown.converter();

var CKAN = CKAN || {};

CKAN.Remote = function($) {
  var my = {};  
  my.url = CKAN.Config.url;
  my.api = my.url + '/api';
  my.apiSearch = my.api + '/search';
  my.apiRest = my.api + '/rest';

  return my;
}(jQuery);

CKAN.UI = function($) {
  var my = {};

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

      item.displaytitle = item.title ? item.title : item.name;

      item.snippet = $(showdown.makeHtml(item.notes ? item.notes : '')).text();
      if (item.snippet.split(' ') > 190) {
        item.snippet = item.snippet.split(' ').slice(0, 190).join(' ') + ' ...';
      }

      // for templating (to be ckan compatible)
      item.package = item;
    });
    var out = $('#tmpl-package-summary').tmpl(data.results);
    $results.find('.packages').html(out);
  };

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
