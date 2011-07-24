/******************************************************
  * Search Widget tests
  *****************************************************/

(function ($, undefined) {

module("Widget.Search");

test('new Widget.Search()', function () {
  this.stub($, 'ajax');

  var widget = new CKAN.Widget.Search('#fixture', 'osm', {
    endpoint: 'http://test.ckan.net'
  });

  ok(widget.el instanceof $, 'Expect el property to be instance of jQuery');
  ok(widget.client instanceof CKAN.Client, 'Expect .client to be an instance of Client');
  ok(widget.view instanceof CKAN.View.DatasetListing, 'Expect .view to be an instance of DatasetListing');
  equal(widget.options.endpoint, 'http://test.ckan.net', 'Expect endpoint option to have been set');
  equal(widget.el[0], $('fixture').children().get(-1), 'Expect view to have been appended to the fixture');
});

test('.query()', function () {
  this.stub($, 'ajax');

  var widget = CKAN.Widget.Search.create('#fixture', '', {results: 5}),
      mockCollection = new Backbone.Collection();
  
  this.stub(widget.client, 'searchDatasets');
  this.stub(widget.view, 'setCollection');

  widget.query('osm');

  equal(widget.client.searchDatasets.callCount, 1, 'Expect client.searchDatasets() to have been called');
  deepEqual(widget.client.searchDatasets.args[0][0].query, {
    q: 'osm', limit: 5
  }, 'Expect client.searchDatasets() to have been called');

  widget.client.searchDatasets.args[0][0].success(mockCollection);
  equal(widget.view.setCollection.callCount, 1, 'Expect view.setCollection() to have been called');
  ok(widget.view.setCollection.calledWith(mockCollection), 'Expect view.setCollection() to have been called with collection');
});

test('Widget.Search.create()', function () {
  this.stub($, 'ajax');

  var widget = CKAN.Widget.Search.create();
  equal(widget.constructor, CKAN.Widget.Search, 'Expect new widget to be created');
});

})(this.jQuery);
