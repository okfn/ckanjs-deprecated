/******************************************************
  * Model tests
  *****************************************************/

(function ($, undefined) {

module("Model.Base");

test('new Model.Base()', function () {
  this.spy(Backbone.Model.prototype, 'constructor');

  var args = {name: 'My Model Name'};
  var instance = new CKAN.Model.Base(args);

  ok(Backbone.Model.prototype.constructor.calledOnce, 'Expect Base to call Backbone.Model');
  ok(Backbone.Model.prototype.constructor.calledWith(args), 'Expect Base to pass on arguments to Backbone.Model');
});

test('.sync()', function () {
  var instance = new CKAN.Model.Base(),
      method = "create",
      options = {};

  this.spy(instance, 'trigger');

  instance.sync(method, instance, options)

  ok(instance.trigger.calledOnce, 'Expect .sync() to trigger a "sync" event');
  ok(instance.trigger.calledWith('sync', method, instance, options), 'Expect .sync() to pass on arguments to listeners');
});

module("Model.Dataset");

test("new Model.Dataset()", function () {
  var indata = {
    title: 'My New Dataset',
    notes: '## Xyz',
    tags: ['abc', 'efg']
  };
  var pkg = new CKAN.Model.Dataset(indata);

  equals(pkg.get('title'), indata.title);
  var out = pkg.toTemplateJSON();
  equals(out.notesHtml, '<h2>Xyz</h2>');
  equals(out.displaytitle, indata.title);
});

test(".set({resources: []})", function () {
  var dataset = new CKAN.Model.Dataset(),
      resources = dataset.get('resources'),
      newResources = new Backbone.Collection();

  this.spy(dataset, '_updateResources');

  equals(resources.constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
  equals(resources.model, CKAN.Model.Resource, 'Should create Resource instances');
  equals(resources.length, 0, 'The resources collection should be empty');

  dataset.set({});
  ok(!dataset._updateResources.calledOnce, 'Expected collection._updateResources() NOT to have been called');

  dataset.set({resources: newResources});
  ok(!dataset._updateResources.calledOnce, 'Expected collection._updateResources() NOT to have been called');
  equal(newResources, dataset.get({resources}), 'Expected the new collection to be set to the "resources" key')

  dataset.set({resources: [{url: "http://pathtonewresource.com/download"}]});
  ok(dataset._updateResources.calledOnce, 'Expected collection._updateResources() to have been called');

  dataset.set({resources: []});
  ok(dataset._updateResources.calledTwice, 'Expected collection._updateResources() to have been called');
});

test("._updateResources()", function () {
  var dataset = new CKAN.Model.Dataset(),
      resources = dataset.get('resources'),
      existingModels = [new CKAN.Model.Resource({id: 1}), new CKAN.Model.Resource({id: 2})],
      newModels = [{id: 3}, {id: 4}, {id: 2, title: 'New title'}];

  resources.add(existingModels);

  this.spy(resources, 'add');
  this.spy(resources, 'remove');
  this.spy(existingModels[1], 'set');

  dataset._updateResources(newModels);
  ok(resources.add.calledTwice, 'Expected resources.add() to have been called');
  ok(resources.add.calledWith(newModels[0]), 'Expected resources.add() to have been called with model');
  ok(resources.add.calledWith(newModels[1]), 'Expected resources.add() to have been called with model');
  ok(existingModels[1].set.calledWith(newModels[2]), 'Expected model.set() to have been called with new data');

  ok(resources.remove.calledOnce, 'Expected resources.remove() to have been called');
  ok(resources.remove.calledWith([existingModels[0]]), 'Expected resources.remove() to have been called with array of models');
});

module("Model.SearchCollection");

test('new Model.SearchCollection()', function () {
  var proto = Backbone.Collection.prototype;

  this.spy(proto, 'constructor');

  var args = [{name: 'My Model Name'}];
  var options = {total: 32};
  var instance = new CKAN.Model.SearchCollection(args, {total: 32});

  ok(proto.constructor.calledOnce, 'Expect Base to call Backbone.Model');
  ok(proto.constructor.calledWith(args, options), 'Expect Base to pass on arguments to Backbone.Model');
  equal(instance.total, 32, 'Expect the total option to be set to the total "property"');
});

})(this.jQuery);
