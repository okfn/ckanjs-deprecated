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

test("Create dataset", function () {
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
