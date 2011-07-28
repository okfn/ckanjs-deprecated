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
      newResources = new Backbone.Collection(),
      args;

  this.spy(dataset, '_createChildren');
  this.spy(dataset, '_updateChildren');

  equals(resources.length, 0, 'The resources collection should be empty');

  dataset.set({});
  equals(dataset._createChildren.callCount, 1, 'Expected dataset._updateChildren() to have been called');
  equals(dataset._updateChildren.callCount, 0, 'Expected collection._updateChildren() NOT to have been called');

  dataset.set({resources: newResources});
  equal(dataset._updateChildren.callCount, 0, 'Expected collection._updateChildren() NOT to have been called');
  equal(newResources, dataset.get('resources'), 'Expected the new collection to be set to the "resources" key');

  args = [{url: "http://pathtonewresource.com/download"}];
  dataset.set({resources: args});
  equals(dataset._updateChildren.callCount, 1, 'Expected collection._updateChildren() to have been called');
  ok(dataset._updateChildren.calledWith({resources: args}), 'Expected collection._updateChildren() to have been called with array of resources');

  dataset.set({resources: []});
  ok(dataset._updateChildren.calledTwice, 'Expected collection._updateChildren() to have been called');
});

test("._createChildren()", function () {
  var dataset = new CKAN.Model.Dataset(), attrs, returned;
  attrs = dataset.attributes = {};

  returned = dataset._createChildren();

  ok(dataset, returned, 'Expected it to return itself');
  equals(attrs.resources.constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
  equals(attrs.resources.model, CKAN.Model.Resource, 'Should create Resource instances');

  equals(attrs.relationships.constructor, Backbone.Collection, 'The resources attribute should be a Backbone collection');
  equals(attrs.relationships.model, CKAN.Model.Relationship, 'Should create Resource instances');
});

test("._updateChildren()", function () {
  var dataset = new CKAN.Model.Dataset(),
      resources = dataset.get('resources'),
      relationships = dataset.get('relationships'),
      existingResources = [new CKAN.Model.Resource({id: 1}), new CKAN.Model.Resource({id: 2})],
      newResources = [{id: 3, package_id: 1}, {id: 4}, {id: 2, title: 'New title'}],
      newRelationships = [{id: 3}];

  resources.add(existingResources);

  this.spy(resources, 'add');
  this.spy(resources, 'remove');
  this.spy(relationships, 'add');
  this.spy(existingResources[1], 'set');

  dataset._updateChildren({resources: newResources, relationships: newRelationships});

  equal(newResources[0].dataset, dataset, 'Expected dataset to have been appended to the model data');

  ok(resources.add.calledTwice, 'Expected resources.add() to have been called');
  ok(resources.add.calledWith(newResources[0]), 'Expected resources.add() to have been called with model');
  ok(resources.add.calledWith(newResources[1]), 'Expected resources.add() to have been called with model');
  ok(existingResources[1].set.calledWith(newResources[2]), 'Expected model.set() to have been called with new data');
  equal(newResources[0].dataset, dataset, 'Expected resources to have a dataset assigned');
  equal(newResources[0].package_id, undefined, 'Expected resources to have its package_id removed');

  ok(relationships.add.calledOnce, 'Expected relationships.add() to have been called');
  equal(newRelationships[0].dataset, undefined, 'Expected relationships not to have a dataset')
  
  ok(resources.remove.calledOnce, 'Expected resources.remove() to have been called');
  ok(resources.remove.calledWith([existingResources[0]]), 'Expected resources.remove() to have been called with array of models');
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

test('create', function() {
  var res = getResource();
  var out = res.toJSON();
  equal(out.package_id, '1');

  var res = new CKAN.Model.Resource();
  var out = res.toJSON();
  equal(out.package_id, null);
});

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
