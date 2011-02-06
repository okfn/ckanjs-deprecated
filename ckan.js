var CKAN = CKAN || {};

var CKAN = function($, my) {
  my.apiUrl = 'http://ckan.net/api';
  my.apiUrlSearch = my.apiUrl + '/search/package?q='
  my.initialize = function() {
    $('#search-form').submit(function() {
      var q = $('input.search').val();
      var url = my.apiUrlSearch + q + '&limit=10&all_fields=1'; 
      console.log(url);
      $.ajax({
        url: url,
        success: function(data) {
          var $results = $('#results');
          $(data.results).each(function(idx, item) {
            console.log(item);
          });
        }
      });
      return false;
    });
  };
  return my
}(jQuery, CKAN);
