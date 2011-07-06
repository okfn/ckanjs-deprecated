var PackageSummaryView = Backbone.View.extend({
  render: function() {
    var tmplData = {
      package: this.model.toTemplateJSON(),

      urls: {
        packageView: "#/package/view/"+ this.model.id,
        packageEdit: "#/package/edit/" + this.model.id
      }
    };

    this.el = jQuery.tmpl(Ckan.Templates.packageSummary, tmplData);
    // have to redelegate as element set up here ...
    this.delegateEvents();
    return this.el;
  }
});
