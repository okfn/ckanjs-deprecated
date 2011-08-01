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
  var tags = tmpl.find('div.tags ul > li').text();
  equals(tags, 'russian');

  $('.action-add-resource').click();
  var dialog = $('.resource-add-dialog');
  var out = dialog.find('form.resource');
  equals(out.length, 1, 'Did not find resource form');
  dialog.find('form input[name=Resource--url]').val('http://xyz.org');
  dialog.find('form.resource').submit();
  equals(pkg.get('resources').length, 1);

  var out = $view.find('.resources table tr:last td:first').text();
  ok(out.indexOf('(No description)')!=-1, 'Did not find required string');
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

test("ResourceView", function() {
  var res = new CKAN.Model.Resource(datasets[1].resources[0]);
  var $el = $('#resource-view-test');
  var view = new CKAN.View.ResourceView({
    model: res,
    el: $el
  });
  view.render();
  var url = $('.resource.view .url').text();
  equal(url, res.get('url'));
});

