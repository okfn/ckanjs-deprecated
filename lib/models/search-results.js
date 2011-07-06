var SearchResults = Backbone.Collection.extend({
  model: Package,

  //reference to the Ckan instance which initialises all widget's Router, Models, and views.
  ckan: null,

  initialize: function (models, options) {
    this.ckan = options.ckan;
    Backbone.Collection.prototype.initialize.apply(this, arguments);
  },


 /*
  * Fetches a set of CKAN search results as jsonp data and use them to set the collection's items.
  *
  * Returns nothing.
  *
  */
  _loadJSONP: function () {
    var self = this;
    $.ajax({
      dataType: "jsonp",
      cache: true,
      url: this.url(),
      success: function (data) {
        self.resultsCount = data.count;
        self.reset(data.results);
      }
    });


  },


  /*
  * Public:
  * Query the ckan api search endpoint.
  *
  * query - Key - value pairs representing a search query
  *
  * Examples:
  *  var results = new SearchResults();
  *  results.query({q:"biology", limit: 200});
  *  results.bind("refresh", view.showResults);
  *
  *
  */
  query: function (query) {
    query = query || {};
    if (!"limit" in query) {
      query.limit = 10;
    }
    var queryString = "";
    _.each(query, function (value, key) {
      queryString += key + "=" + value + "&";
    });

    this.url = function () {
      return SearchResults.baseUri+queryString.replace(/\&$/,"");
    };

    this._loadJSONP();
  }
});

//set the base url as a static property
SearchResults.baseUri = "http://ckan.net/api/2/search/package?all_fields=1&";
