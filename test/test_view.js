module("View");

CKAN.UI.initialize()

test("PackageSearchView", function () {
  var coll = new CKAN.Model.PackageCollection()

  var searchView = new CKAN.View.PackageSearchView({
    el: $('#search-page'),
    collection: coll
  });
  var pkg = new CKAN.Model.Package(packages[1]);
  coll.add([pkg]);

  searchView.render();
});
