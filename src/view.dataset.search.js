var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.DatasetSearchView = Backbone.View.extend({
    events: {
      'submit #search-form': 'onSearch'
    },

    initialize: function(options) {
      var view = this;

      // Temporarily provide the view with access to the client for searching.
      this.client = options.client;
      this.$results = this.el.find('.results');
      this.$datasetList = this.$results.find('.datasets');
      this.$dialog = this.el.find('.dialog');

      this.resultView = new CKAN.View.DatasetListing({
        collection: new Backbone.Collection(),
        el: this.$datasetList
      });

      _.bindAll(this, "render");
    },

    render: function() {
      this.$('.count').html(this.totalResults);
      this.hideSpinner();
      this.$results.show();
      return this;
    },

    onSearch: function (event) {
      event.preventDefault();
      var q = $(this.el).find('input.search').val();
      this.doSearch(q);
    },

    doSearch: function (q) {
      $(this.el).find('input.search').val(q),
          self = this;

      this.showSpinner();
      this.$results.hide();
      this.$results.find('.datasets').empty();
      this.client.searchDatasets({
        query: {q:q},
        success: function (collection) {
          self.totalResults = collection.total;
          self.resultView.setCollection(collection);
          self.render();
        }
      });
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

}(CKAN.View, jQuery));

