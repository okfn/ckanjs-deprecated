/******************************************************
  * DatasetListing tests
  *****************************************************/

(function ($, undefined) {

module("View.DatasetListing");

test('new View.DatasetListing()', function () {
  this.spy(Backbone.View.prototype, 'constructor');
  this.stub(CKAN.View.DatasetListing.prototype, 'setCollection');

  var args = {collection: new Backbone.Collection};
  var instance = new CKAN.View.DatasetListing(args);

  ok(Backbone.View.prototype.constructor.calledOnce, 'Expect constructor to call Backbone.Model');
  ok(Backbone.View.prototype.constructor.calledWith(args), 'Expect constructor to pass on arguments to Backbone.Model');

  ok(instance.setCollection.calledOnce, 'Expect constructor to call .setCollection()');
  ok(instance.setCollection.calledWith(args.collection), 'Expect constructor to call .setCollection() with collection');
});

test('.setCollection()', function () {
  var collection = new Backbone.Collection;
  var newCollection = new Backbone.Collection;
  var view = new CKAN.View.DatasetListing({collection: collection});

  this.spy(collection, 'unbind');
  this.spy(newCollection, 'bind');
  this.spy(newCollection, 'unbind');

  view.setCollection(newCollection);

  equal(collection.unbind.callCount, 2, 'Expect .setCollection() to call .unbind on old collection');
  ok(collection.unbind.calledWith('add', view.addItem), 'Expect .setCollection() to unbind .addItem() on old collection');
  ok(collection.unbind.calledWith('remove', view.removeItem), 'Expect .setCollection() to unbind .removeItem() on old collection');

  equal(newCollection.bind.callCount, 2, 'Expect .setCollection() to call .bind on new collection');
  ok(newCollection.bind.calledWith('add', view.addItem), 'Expect .setCollection() to bind .addItem() on new collection');
  ok(newCollection.bind.calledWith('remove', view.removeItem), 'Expect .setCollection() to bind .removeItem() on new collection');

  view.setCollection(null);

  equal(newCollection.unbind.callCount, 2, 'Expect .setCollection() to call .unbind on old collection');
  ok(newCollection.unbind.calledWith('add', view.addItem), 'Expect .setCollection() to unbind .addItem() on old collection');
  ok(newCollection.unbind.calledWith('remove', view.removeItem), 'Expect .setCollection() to unbind .removeItem() on old collection');
});

test('.addItem()', function () {
  var collection = new Backbone.Collection;
  var model = new CKAN.Model.Dataset();
  var view = new CKAN.View.DatasetListing({collection: collection});
  var mockItemView = {el: {}};
  mockItemView.render = this.stub().returns(mockItemView);

  this.stub(CKAN.View, 'DatasetListingItem').returns(mockItemView);
  this.stub(view.el, 'data').returns(view.el);
  this.stub(view.el, 'append').returns(view.el);

  view.addItem(model);

  equal(CKAN.View.DatasetListingItem.callCount, 1, 'Expect new list item to have been created');
  ok(CKAN.View.DatasetListingItem.calledWith({
    model: model,
    domain: view.options.domain
  }), 'Expect new list item to have been created with the model and domain');

  equal(mockItemView.render.callCount, 1, 'Expect the view.render() method to have been called');
  equal(view.el.data.callCount, 1, 'Expect the el.data() method to have been called');
  equal(view.el.append.callCount, 1, 'Expect the el.append() method to have been called');
  ok(view.el.append.calledWith(mockItemView.el), 'Expect the el.append() method to have been called with the element');
});

test('.removeItem()', function () {
  var collection = new Backbone.Collection;
  var model = new CKAN.Model.Dataset();
  var view = new CKAN.View.DatasetListing({collection: collection});
  var mockItemView = {remove: this.spy()};

  this.stub(view.el, 'data').returns(mockItemView);

  view.removeItem(model);

  equal(view.el.data.callCount, 1, 'Expect view.el.data() to have been called');
  ok(view.el.data.calledWith(model.cid), 'Expect view.el.data() to have been called with the model cid');
  equal(mockItemView.remove.callCount, 1, 'Expect the .remove() method to have been called on the view');
});

test('.render()', function () {
  var collection = new Backbone.Collection;
  var view = new CKAN.View.DatasetListing({collection: collection});

  this.stub(view.el, 'empty');
  this.stub(view.collection, 'each');

  view.render();

  equal(view.el.empty.callCount, 1, 'Expect view.el.empty() to have been called');
  equal(view.collection.each.callCount, 1, 'Expect the view.collection.each() method to have been called');
  ok(view.collection.each.calledWith(view.addItem), 'Expect the view.collection.each() method to have been called with the .addItem() method');
});

test('.remove()', function () {
  var collection = new Backbone.Collection;
  var view = new CKAN.View.DatasetListing({collection: collection});

  this.stub(view, 'setCollection');

  view.remove();

  equal(view.setCollection.callCount, 1, 'Expect view.setCollection() to have been called');
  ok(view.setCollection.calledWith(null), 'Expect the view.setCollection() method to have been called with null');
});

module("View.DatasetListingItem");

test('._availableFormats()', function () {
  var model = new CKAN.Model.Dataset({
    resources: [
      {url:'http://example.com'},
      {url:'http://example.com', format: 'csv'},
      {url:'http://example.com', format: 'xml'}
    ]
  });
  var view = new CKAN.View.DatasetListingItem({model: model});

  var returned = view._availableFormats();
  deepEqual(returned, ['csv', 'xml'], 'Expect "xml" and "csv" formats to be returned');
});

})(this.jQuery);
