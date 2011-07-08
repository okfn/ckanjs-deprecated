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

})(this.jQuery);
