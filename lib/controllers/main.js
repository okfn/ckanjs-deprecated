var MainController = Backbone.Router.extend({
  initialize: function (options) {
    //TODO: honor user config here
    //this.lightbox = new Lightbox();
    //document.body.appendChild(this.lightbox.render());
    //this.lightbox.hide();
    var ckan = this.ckan = options.ckan;

    var searchView = this.searchView = new PackageSearchView(options);
    ckan.attach(searchView.render());

  }
});
