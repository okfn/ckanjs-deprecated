$(document).ready(function(){

var dataproxyDialogId = 'our-dialog';
var preview = CKANEXT.DATAPREVIEW;
    
test("normalizeFormat", function() {
  var data = {
    'CSV': 'csv',
    'text/csv': 'csv',
    'application/xls': 'xls'
  }
  for (var k in data) {
    var out = preview.normalizeFormat(k);
    equals(out, data[k]);
  }
});

test("normalizeUrl", function() {
  var data = {
    'https://xyz.com/': 'http://xyz.com/',
    'http://xyz.com/': 'http://xyz.com/',
    'http://xyz.com/?url=https://xyz.com/': 'http://xyz.com/?url=https://xyz.com/'
  }
  for (var k in data) {
    var out = preview.normalizeUrl(k);
    equals(out, data[k]);
  }
});

});
