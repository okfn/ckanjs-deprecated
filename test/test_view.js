module("View");

CKAN.UI.initialize()

test("PackageSummaryView", function () {
  var pkg = new CKAN.Model.Package(packages[1]);
  var view = new CKAN.View.PackageSummaryView({
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  console.log(tmpl.html());
  var title = tmpl.find('.title a').text();
  equals(title, 'A Novel By Tolstoy');
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
