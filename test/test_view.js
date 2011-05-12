module("View");

CKAN.UI.initialize()

test("PackageSummaryView", function () {
  var pkg = new CKAN.Model.Package(packages[1]);
  var view = new CKAN.View.PackageSummaryView({
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  var title = tmpl.find('.title a').text();
  equals(title, 'A Novel By Tolstoy');
});

test("PackageFullView", function () {
  var pkg = new CKAN.Model.Package(packages[0]);
  var $view = $('<div />').appendTo($('.fixture'));
  var view = new CKAN.View.PackageFullView({
    el: $view,
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  var title = tmpl.find('.title a').text();
  equals(title, 'A Wonderful Story');

  $('.action-add-resource').click();
  var out = tmpl.find('form.resource');
  equals(out.length, 1, 'Did not find resource form');
  tmpl.find('form input[name=Resource--url]').val('http://xyz.org');
  tmpl.find('form.resource').submit();
  equals(pkg.get('resources').length, 1);

  var out = $view.find('.resources table tr:last td:first').text();
  ok(out.indexOf('Download (no description)')!=-1, 'Did not find required string');
});

test("PackageSearchView", function () {
  var coll = new CKAN.Model.PackageCollection()

  var searchView = new CKAN.View.PackageSearchView({
    el: $('#search-page'),
    collection: coll
  });
  var pkg = new CKAN.Model.Package(packages[1]);
  coll.add([pkg]);
  searchView.render();

  var title = $('.packages li .title a').text();
  equals(title, 'A Novel By Tolstoy');
});
