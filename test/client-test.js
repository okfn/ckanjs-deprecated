(function ($, undefined) {

  module("CKAN.Client");

  test("new Client()", function () {
    var client = new CKAN.Client();

    equal(client instanceof CKAN.Client, true, 'Expect client to be an instance of Client');
    deepEqual(client._environment, CKAN.Client.defaults, 'Expect client._environment to equal Client.defaults');
  });

  test("new Client(config)", function () {
    var config = {url: 'http://ckan.org/api/2'},
        client = new CKAN.Client(config);

    deepEqual(client._environment.url, config.url, 'Expect client._environment.url to equal config.url');
  });

  test(".configure(config)", function () {
    var client = new CKAN.Client(),
        config = {endpoint: 'http://test.ckan.net', apiKey: 'some-long-string'},
        returned;

    this.stub(client, 'environment').returns(client);

    returned = client.configure(config);

    equal(returned, client, 'Expect client to be returned');
    ok(client.environment.calledOnce, 'Expect .environment() to have been called');
    deepEqual(client.environment.args[0][0], {
      apiKey: 'some-long-string',
      endpoint: 'http://test.ckan.net',
      restEndpoint: 'http://test.ckan.net/api/2/rest',
      searchEndpoint: 'http://test.ckan.net/api/2/search'
    }, 'Expect "endpoint", "restEndpoint", "searchEndpoint" and "apiKey" keys to have been set');

    client.configure({endpoint: 'http://test.ckan.net/'});
    equal(client.environment.args[1][0].endpoint, 'http://test.ckan.net', 'Expect trailing slash to be trimmed from endpoint');
  });

  test(".environment(key)", function () {
    var client = new CKAN.Client(),
        url = 'http://ckan.org/api/2';

    client._environment = {url: url};

    equal(client.environment('url'), url, 'Expect the "url" key to be returned from the .env object');
    equal(client.environment('invalid'), undefined, 'Expect keys that are not found to return undefined');
  });

  test(".environment(key, value)", function () {
    var client = new CKAN.Client(),
        url = 'http://test.ckan.org/api/2',
        returned;

    returned = client.environment('url', url);

    equal(client._environment.url, url, 'Expect the "url" key to have been set on the .env property');
    same(returned, client, 'Expect the client object to have been returned');
  });

  test(".environment(keys)", function () {
    var client = new CKAN.Client(),
        keys = {url: 'http://test.ckan.org/api/2', apiKey: 'some-long-api-key'},
        returned;

    client._environment = {};
    returned = client.environment(keys);

    deepEqual(client._environment, keys, 'Expect the "url" and "apiKey" keys to have been set on the .env property');
    same(returned, client, 'Expect the client object to have been returned');
  });

  test(".createDataset()", function () {
    var client = new CKAN.Client(),
        spy = this.spy(),
        dataset;

    this.stub(CKAN.Model, 'Dataset').returns({bind: spy});

    dataset = client.createDataset({title: 'My new dataset'});

    ok(CKAN.Model.Dataset.calledOnce, 'Expect it to return an instance of CKAN.Model.Dataset');
    ok(spy.calledOnce, 'Expect it to call bind on the returned model');
    ok(spy.calledWith('sync', client.syncDataset), 'Expect it to bind to the "sync" event with client.syncDataset()');
  });

  test(".syncDataset()", function () {
    var client = new CKAN.Client(),
        method  = 'create',
        options = {},
        dataset = new CKAN.Model.Dataset(),
        returned;

    this.stub(Backbone, 'sync');
    this.stub(client, 'environment').returns('stubbed');

    returned = client.syncDataset(method, dataset, options);

    equal(returned, client, 'Expect it to return the client instance');
    ok(Backbone.sync.calledOnce, 'Expect it to call Backbone.sync()');
    ok(Backbone.sync.calledWith(method, dataset), 'Expect it to call Backbone.sync() with the method and dataset');
    deepEqual(Backbone.sync.args[0][2], {
      url: 'stubbed' + '/package',
      headers: {'X-CKAN-API-KEY': 'stubbed'}
    }, 'Expect it to call Backbone.sync() with "header" and "url" options');
    ok(client.environment.calledTwice, 'Expect it to call client.environment twice');
    ok(client.environment.calledWith('apiKey'), 'Expect it to request the "api-key" from the client');
    ok(client.environment.calledWith('restEndpoint'), 'Expect it request the "rest-endpoint" from the client');

    dataset.id = 1;
    client.syncDataset('update', dataset, options);
    deepEqual(Backbone.sync.args[1][2], {
      url: 'stubbed/package/1',
      headers: {'X-CKAN-API-KEY': 'stubbed'}
    }, 'Expect the url to have the id included when the dataset has an id');
  });

  test('.searchDatasets()', function () {
    var client  = new CKAN.Client(),
        success = function () {},
        query = 'osm',
        mockPromise = {},
        returned;

    this.stub($, 'ajax').returns(mockPromise);
    this.stub(client, 'environment').returns('stubbed');

    returned = client.searchDatasets({data: {q: query, success: success}});
    
    equal(returned, mockPromise, 'Expect it to return the jQuery promise');
    ok(client.environment.calledOnce, 'Expect it to call client.environment()');
    ok(client.environment.calledWith('searchEndpoint'), 'Expect it to call client.environment() to get the search endpoint');
    ok($.ajax.calledOnce, 'Expect it to call $.ajax()');
    deepEqual($.ajax.args[0][0], {
      url: 'stubbed/package',
      data: {
        'limit': 10, 'all_fields': 1, 'q': query, 'success': success
      },
      converters: {
        'text json': client._datasetConverter
      }
    }, 'Expect options to be merged with defaults');
  });

  test('._datasetConverter()', function () {
    var client  = new CKAN.Client(),
        raw = '{"count": 23, "results": [{"title": "a"}, {"title": "b"}, {"title": "c"}]}',
        returned;

    this.stub(client, 'createDataset').returns({});

    returned = client._datasetConverter(raw);

    equal(returned.constructor, CKAN.Model.SearchCollection, 'Expect a search collection to be returned');
    equal(returned.total, 23, 'Expect collection to have a total of 23');
    equal(returned.length, 3, 'Expect collection to have a length of 3');
    ok(client.createDataset.calledThrice, 'Expect client.createDataset() to have been called three times');
  });
})(this.jQuery);
