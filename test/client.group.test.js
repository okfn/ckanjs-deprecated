(function ($) {

module("CKAN.Client.Group");

test(".getGroupById()", function () {
  var client = new CKAN.Client(),
      error = this.spy(),
      options = {success: function () {}},
      group, group2;

  this.stub(CKAN.Model.Group.prototype, 'fetch').returns({error: error});

  group = client.getGroupById('an-id', options);

  equal(group.constructor, CKAN.Model.Group, 'Expected a group to have been returned');
  ok(group.fetch.calledOnce, 'Expected fetch to have been called');
  ok(group.fetch.calledWith(options), 'Expected fetch to have been called with options');

  group2 = client.getGroupById('an-id');
  equal(group2, group, 'Expected group to have been returned again');
  ok(group.fetch.calledOnce, 'Expected fetch NOT to have been called again');

  ok(client.cache.group.contains(group), 'Expect cache to contain group');
});

test(".syncGroup()", function () {
  var client = new CKAN.Client(),
      method  = 'create',
      options = {},
      group = new CKAN.Model.Group(),
      returned;

  this.stub(Backbone, 'sync');
  this.stub(client, 'environment').returns('stubbed');

  returned = client.syncGroup(method, group, options);

  equal(returned, client, 'Expect it to return the client instance');
  ok(Backbone.sync.calledOnce, 'Expect it to call Backbone.sync()');
  ok(Backbone.sync.calledWith(method, group), 'Expect it to call Backbone.sync() with the method and group');
  deepEqual(Backbone.sync.args[0][2], {
    url: 'stubbed' + '/group',
    headers: {'X-CKAN-API-KEY': 'stubbed'}
  }, 'Expect it to call Backbone.sync() with "header" and "url" options');
  ok(client.environment.calledTwice, 'Expect it to call client.environment twice');
  ok(client.environment.calledWith('apiKey'), 'Expect it to request the "api-key" from the client');
  ok(client.environment.calledWith('restEndpoint'), 'Expect it request the "rest-endpoint" from the client');

  group.id = 1;
  client.syncGroup('update', group, options);
  deepEqual(Backbone.sync.args[1][2], {
    url: 'stubbed/group/1',
    headers: {'X-CKAN-API-KEY': 'stubbed'}
  }, 'Expect the url to have the id included when the group has an id');
});

test(".getTopGroups()", function () {
  var client = new CKAN.Client(),
    mockPromise = {},
    success = function () {},
    returned;

  this.stub($, 'ajax').returns(mockPromise);
  this.stub(client, 'environment').returns('stubbed');

  returned = client.getTopGroups('openspending', success);
  equal(returned, mockPromise, 'Expect it to return the jQuery promise');
  ok($.ajax.calledOnce, 'Expect it to call $.ajax()');
  deepEqual($.ajax.args[0][0], {
    url: 'stubbed/api/action/package_search',
    headers: {
      "X-CKAN-API-KEY": "stubbed"
    },
    data: {
      'rows': 0, 'facet.field': 'groups', fq: 'openspending'
    },
    type: 'POST',
    success: success
  }, 'Expect it to work!');
});

})(this.jQuery);
