module("View");

CKAN.UI.initialize()

test("DatasetSummaryView", function () {
  var pkg = new CKAN.Model.Dataset(datasets[1]);
  var view = new CKAN.View.DatasetSummaryView({
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  var title = tmpl.find('.title a').text();
  equals(title, 'A Novel By Tolstoy');
});

test("DatasetFullView", function () {
  var pkg = new CKAN.Model.Dataset(datasets[0]);
  var $view = $('<div />').appendTo($('.fixture'));
  var view = new CKAN.View.DatasetFullView({
    el: $view,
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);

  $('.action-add-resource').click();
  var out = tmpl.find('form.resource');
  equals(out.length, 1, 'Did not find resource form');
  tmpl.find('form input[name=Resource--url]').val('http://xyz.org');
  tmpl.find('form.resource').submit();
  equals(pkg.get('resources').length, 1);

  var out = $view.find('.resources table tr:last td:first').text();
  ok(out.indexOf('Download (no description)')!=-1, 'Did not find required string');
});

test("DatasetSearchView", function () {
  var coll = new CKAN.Model.SearchCollection([]);

  var searchView = new CKAN.View.DatasetSearchView({
    el: $('#search-page'),
    collection: coll
  });
  var pkg = new CKAN.Model.Dataset(datasets[1]);
  coll.add(pkg);
  searchView.addOne(pkg);
  searchView.render();
  var title = $('.datasets li .title a').text();
  equals(title, 'A Novel By Tolstoy');
});
