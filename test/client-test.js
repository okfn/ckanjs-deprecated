(function ($, undefined) {

  module("CKAN.Client", {
    setup: function () {
      CKAN.Client._environment = {};
    }
  });

  test(".initialize(config)", function () {
    var spy = this.spy(CKAN.Client, 'environment'),
        config = {};

    CKAN.Client.initialize(config);

    ok(spy.calledOnce, 'Expect .environment() to have been called');
    ok(spy.calledWith(config), 'Expect .environment() to have been called with config');
  });

  test(".environment(key)", function () {
    var url = 'http://ckan.org/api/2';

    CKAN.Client._environment = {url: url};

    equal(CKAN.Client.environment('url'), url, 'Expect the "url" key to be returned from the ._environment object');
    equal(CKAN.Client.environment('invalid'), undefined, 'Expect keys that are not found to return undefined');
  });

  test(".environment(key, value)", function () {
    var url = 'http://test.ckan.org/api/2',
        returned;

    returned = CKAN.Client.environment('url', url);

    equal(CKAN.Client._environment.url, url, 'Expect the "url" key to have been set on the ._environment property');
    same(returned, CKAN.Client, 'Expect the Client object to have been returned');
  });

  test(".environment(keys)", function () {
    var keys = {url: 'http://test.ckan.org/api/2', apiKey: 'some-long-api-key'},
        returned;

    returned = CKAN.Client.environment(keys);

    deepEqual(CKAN.Client._environment, keys, 'Expect the "url" and "apiKey" keys to have been set on the ._environment property');
    same(returned, CKAN.Client, 'Expect the CKAN.Client object to have been returned');
  });

})(this.jQuery);
