var PackageSearchView = Backbone.View.extend({
  events: {
    'submit #search-form': 'doSearch'
  },

  initialize: function (options) {
    var view = this,
        query = options.ckan.getOptions('query');

    this.ckan = options.ckan;
    this.collection = new SearchResults([], options);

    if (query) {
      this.collection.query(query);
    }

    _.bindAll(this, "onReset", "render", "addOne");
    this.collection.bind("reset", view.onReset);
  },

  render: function () {
    var widgetOptions = this.ckan.getOptions('widget');
    this.el = this.ckan.renderTemplate('packageSearch', widgetOptions)[0];
    this.$results = this.$('.results');
    this.$results.hide();
    this.$dialog = this.$('.dialog');
    return this.el;
  },

  onReset: function (collection) {
    var self = this;
    collection.each( function( ckanPackage) {
      self.addOne(ckanPackage);
    });
    this._showResults();
  },

  _showResults: function () {
    this.$('.count').html(this.collection.resultsCount);
    this.hideSpinner();
    this.$results.show();
    return this;
  },


  addOne: function (ckanPackage) {
    var newView = new PackageSummaryView({model: ckanPackage});
    this.$results.find('.packages').append(newView.render());
    return this;
  },

  doSearch: function (event) {
    var q = $(this.el).find('input.search').val();
    this.showSpinner();
    this.$results.hide();
    this.$results.find('.packages').empty();
    this.collection.query({q:q});

    event.preventDefault();
  },

  showSpinner: function() {
    this.$dialog.empty();
    this.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
    this.$dialog.show();
  },

  hideSpinner: function() {
    this.$dialog.empty().hide();
  }

});
