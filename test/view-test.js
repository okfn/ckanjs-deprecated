module("View");

CKAN.UI.initialize()

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

  this.spy(pkg, 'save');
  $('.action-add-resource').click();
  var dialog = $('.resource-add-dialog');
  var out = dialog.find('form.resource');
  equals(out.length, 1, 'Did not find resource form');
  dialog.find('form input[name=Resource--url]').val('http://xyz.org');
  dialog.find('form.resource').submit();
  equals(pkg.get('resources').length, 3);
  ok(pkg.save.calledOnce, 'Expect resource add to have been saved');

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
  var client = new CKAN.Client();
  var view = new CKAN.View.DatasetSearchView({
    el: $('#search-page'),
    client: client
  });
  var _models = _.map(datasets, function(attributes) {
      return client.createDataset(attributes);
  });
  var _results = new CKAN.Model.SearchCollection(
    _models
    , {total: 2}
  );
  this.stub(view.client, 'searchDatasets', function(options){
    options.success(_results);
  });
  var _event = {
    preventDefault: function() {}
  };
  view.onSearch(_event);
  var count = view.el.find('.count').text();
  equals(count, '2');
  var title = $('.datasets li .title a').last();
  equals(title.text(), 'A Novel By Tolstoy');
  equals(title.attr('href'), '#dataset/' + _models[1].id + '/view');
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

test("ResourceUpload", function() {
  var res = new CKAN.Model.Resource({});
  var client = new CKAN.Client();
  sinon.stub(client, 'getStorageAuthForm', function(key, options) {
    options.success(FIXTURES.apiStorageAuthForm[0]);
  });
  // metadata call
  var _metadata = {
    _bucket: "ckantest"
    , _content_length: 568
    , _format: "text/plain"
    , _label: "/README.rst"
    , _last_modified: "Sat, 13 Aug 2011 13:40:08 GMT"
    , _location: "https://commondatastorage.googleapis.com/ckantest/README.rst"
    , _owner: null
    , "uploaded-by": "dbc9423c-3410-436e-a67b-e9fc6440f089"
  };
  sinon.stub(client, 'apiCall', function(options) {
    options.success(_metadata);
  });

  var view = new CKAN.View.ResourceUpload({
    model: res,
    client: client
  });
  var $el = view.render().el;
  ok($el);
  $('.fixture').append($el);

  view.updateFormData('README.rst');
  equals($el.find('form').attr('action'), 'http://ckantest.commondatastorage.googleapis.com/');
  var expectedFields = ['signature', 'policy'];
  $.each(expectedFields, function(idx, fieldName) {
    var _found = $el.find('input[name="' + fieldName + '"]');
    equals(_found.length, 1, 'Failed to find input ' + fieldName);
  });

  // test successful submit ...
  view.onUploadComplete('README.rst');
  equals(res.get('url'),  _metadata._location);
  equals(res.get('name'),  'README.rst');
  equals(res.get('type'),  'file');
  equals(res.get('size'),  568);
});

test("ResourceCreate", function() {
  var $el = $('<div />').addClass('resource-create-test');
  $el.appendTo($('.fixture'));
  var res = new CKAN.Model.Resource({});
  var view = new CKAN.View.ResourceCreate({
    model: res,
    el: $el
  });
  view.render();
  var field = $el.find('form.resource input#Resource--url');
  equals(field.length, 1, 'Failed to find Resource Create Link to (Edit) form');
  var field = $el.find('.resource-upload');
  equals(field.length, 1, 'Failed to find Resource Upload form');
});

