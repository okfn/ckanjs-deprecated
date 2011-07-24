this.CKAN || (this.CKAN = {});
this.CKAN.Widget || (this.CKAN.Widget = {});

this.CKAN.Widget.Search = (function (CKAN, $, _, Backbone, undefined) {
  function Search(element, query, options) {
    this.el = element instanceof $ ? element : $(element);
    this.options = _.defaults(options || {}, {results: 10});
    this.client = new CKAN.Client({endpoint: this.options.endpoint});
    this.view = new CKAN.View.DatasetListing({
      collection: new Backbone.Collection()
    });

    this.el.append(this.view.render().el);
    this.query(query);
  }

  Search.create = function (element, query, options) {
    return new Search(element, query, options);
  };

  Search.prototype.query = function (query) {
    var view = this.view;

    query = typeof query === 'string' ? {q: query} : query;
    this.client.searchDatasets({
      query: _.defaults({}, query, {limit: this.options.results}),
      success: function (collection) {
        view.setCollection(collection);
      }
    });
    return this;
  };

  return Search;

})(CKAN, $, _, Backbone, undefined);
