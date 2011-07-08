(function ($, undefined) {

  module("CKAN.Client");

  test("new Client()", function () {
    var client = new CKAN.Client();

    equal(client instanceof CKAN.Client, true, 'Expect client to be an instance of Client');
    deepEqual(client._environment, CKAN.Client.defaults, 'Expect client.env to equal Client.defaults');
  });

  test("new Client(config)", function () {
    var config = {url: 'http://ckan.org/api/2'},
        client = new CKAN.Client(config);

    deepEqual(client._environment.url, config.url, 'Expect client.env.url to equal config.url');
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

})(this.jQuery);
