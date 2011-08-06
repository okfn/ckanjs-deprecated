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
  var pkg = new CKAN.Model.Dataset(datasets[1]);
  var $view = $('<div />').appendTo($('.fixture'));
  var view = new CKAN.View.DatasetFullView({
    el: $view,
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  var tags = tmpl.find('div.tags ul > li').text();
  equals(tags, 'russiantolstoy');

  $('.action-add-resource').click();
  var dialog = $('.resource-add-dialog');
  var out = dialog.find('form.resource');
  equals(out.length, 1, 'Did not find resource form');
  dialog.find('form input[name=Resource--url]').val('http://xyz.org');
  dialog.find('form.resource').submit();
  equals(pkg.get('resources').length, 3);

  var out = $view.find('.resources table tr:last td:first').text();
  ok(out.indexOf('(No description)')!=-1, 'Did not find required string');

  // connections in sidebar
  var out = $('#sidebar .widget-list ul li');
  equals(out.length, 1);
  out = out.find('a').text();
  equals(out, '54b9ee58-d7ab-4db8-a55b-57a22d496ede');
});

test("DatasetEditView", function () {
  var pkg = new CKAN.Model.Dataset(datasets[1]);
  var $view = $('<div />').appendTo($('.fixture'));
  var view = new CKAN.View.DatasetEditView({
    el: $view,
    model: pkg
  });
  view.render();
  var tmpl = $(view.el);
  out = tmpl.find('#Dataset--title').val();
  equals(out, 'A Novel By Tolstoy');
  out = tmpl.find('#Dataset--name').val();
  equals(out, pkg.get('name'));
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

test("ResourceEditView", function() {
  var res = new CKAN.Model.Resource(datasets[1].resources[0]);
  var $el = $('<div />').addClass('resource-form-test');
  $el.appendTo($('.fixture'));
  var view = new CKAN.View.ResourceEditView({
    model: res,
    el: $el
  });
  view.render();
  var url = $el.find('form.resource input#Resource--url').val();
  equal(url, res.get('url'));
});

