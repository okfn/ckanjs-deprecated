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

test('.toJSON()', function () {
  var instance = new CKAN.Model.Base(),
      object;

  instance.set({
    test: null,
    array: [],
    obj: {},
    child: new Backbone.Model({key: 'value'}),
    children: new Backbone.Collection([{key: 'value'}])
  });

  object = instance.toJSON();

  equal(object.child.key, 'value', 'Expect child to be converted to an object');
  ok($.isArray(object.children), 'Expect children to be converted to an array');
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

test("new Model.Dataset({resources: []})", function () {
  var dataset = new CKAN.Model.Dataset({resources: []});
  equals(dataset.get('resources').constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
});

test(".set({resources: []})", function () {
  var dataset = new CKAN.Model.Dataset(),
      resources = dataset.get('resources'),
      newResources = new Backbone.Collection();

  this.spy(dataset, '_createRelationships');
  this.spy(dataset, '_updateResources');

  equals(resources.length, 0, 'The resources collection should be empty');

  dataset.set({});
  equals(dataset._createRelationships.callCount, 1, 'Expected dataset._createRelationships() to have been called');
  ok(!dataset._updateResources.calledOnce, 'Expected collection._updateResources() NOT to have been called');

  dataset.set({resources: newResources});
  ok(!dataset._updateResources.calledOnce, 'Expected collection._updateResources() NOT to have been called');
  equal(newResources, dataset.get('resources'), 'Expected the new collection to be set to the "resources" key');

  dataset.set({resources: [{url: "http://pathtonewresource.com/download"}]});
  ok(dataset._updateResources.calledOnce, 'Expected collection._updateResources() to have been called');

  dataset.set({resources: []});
  ok(dataset._updateResources.calledTwice, 'Expected collection._updateResources() to have been called');
});

test("._createRelationships()", function () {
  var dataset = new CKAN.Model.Dataset(), attrs, returned;
  attrs = dataset.attributes = {};

  returned = dataset._createRelationships();

  ok(dataset, returned, 'Expected it to return itself');
  equals(attrs.resources.constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
  equals(attrs.resources.model, CKAN.Model.Resource, 'Should create Resource instances');

  equals(attrs.relationships.constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
  equals(attrs.relationships.model, CKAN.Model.Relationship, 'Should create Resource instances');
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

  equal(newModels[0].dataset, dataset, 'Expected dataset to have been appended to the model data');

  ok(resources.add.calledTwice, 'Expected resources.add() to have been called');
  ok(resources.add.calledWith(newModels[0]), 'Expected resources.add() to have been called with model');
  ok(resources.add.calledWith(newModels[1]), 'Expected resources.add() to have been called with model');
  ok(existingModels[1].set.calledWith(newModels[2]), 'Expected model.set() to have been called with new data');

  ok(resources.remove.calledOnce, 'Expected resources.remove() to have been called');
  ok(resources.remove.calledWith([existingModels[0]]), 'Expected resources.remove() to have been called with array of models');
});

module("Model.Resource");

function getResource() {
  return new CKAN.Model.Resource({
    id: "382d4759-a21b-433d-ab3d-7a629f539ffc",
    url: "http://www.antlab.sci.waseda.ac.jp/software.html",
    package_id: "dd79c3f0-f5cc-4e55-bd66-3bbfc0382b2e",
    dataset: new CKAN.Model.Dataset({id: '1'})
  });
}

test('.save()', function () {
  var resource = getResource(),
      attrs = {}, options = {},
      dataset = resource.get("dataset");
  
  this.spy(resource, 'set');
  this.spy(dataset, 'save');

  resource.save(attrs, options);

  ok(resource.set.calledWith(attrs), 'Expected the attributes to be set on the model');
  ok(dataset.save.calledOnce, 'Expected .save() to be called on the dataset');
  ok(dataset.save.calledWith({}, options), 'Expected .save() to be called with the options');
});

test('.fetch()', function () {
  var resource = getResource(),
      options = {},
      dataset = resource.get("dataset");

  this.spy(dataset, 'fetch');

  resource.fetch(options);

  ok(dataset.fetch.calledWith(options), 'Expected .fetch() to be called on the dataset');
});

test('.destroy()', function () {
  var resource = getResource(),
      attrs = {}, options = {},
      dataset = resource.get("dataset");

  this.spy(resource, 'trigger');
  this.spy(dataset, 'save');

  resource.destroy(options);

  ok(resource.trigger.calledWith('destroy', resource), 'Expected the "destroy" event to be triggered');
  ok(dataset.save.calledOnce, 'Expected .save() to be called on the dataset');
  ok(dataset.save.calledWith({}, options), 'Expected .save() to be called with the options');
});

test(".toJSON()", function () {
  var dataset  = new CKAN.Model.Dataset({id: 'my-dataset-id'}),
      resource = new CKAN.Model.Resource({id: 1, url: 'http://', dataset: dataset});

  deepEqual(resource.toJSON(), {
    id: 1, package_id: 'my-dataset-id', url: 'http://'
  }, 'Expected a "package_id" key to have been set');
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
