var CKAN = CKAN || {};

CKAN.Remote = function($) {
  var Remote = {};  
  Remote.apiSearch = CKAN.Config.api + '/search';
  Remote.apiRest = CKAN.Config.api + '/rest';
  return Remote;
}(jQuery);

var CKAN = function($, my) {
  my.apiUrlSearch = CKAN.Remote.apiSearch + '/package?q='
  my.initialize = function() {
    $('#search-form').submit(function() {
      var q = $('input.search').val();
      var url = my.apiUrlSearch + q + '&limit=10&all_fields=1';
      $.ajax({
          url: url,
          success: function(data) {
          var $results = $('#results');
          $(data.results).each(function(idx, item) {
          });
        },
        dataType: 'jsonp'
      });
      return false;
    });
  };
  return my
}(jQuery, CKAN);
