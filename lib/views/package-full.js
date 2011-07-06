var PackageFullView = Backbone.View.extend({
  events: {
    'click .action-add-resource': 'showResourceAdd'
  },

  render: function() {
    var tmplData = {
      package: this.model.toTemplateJSON(),
    };
    return $.tmpl(CKAN.Templates.packageFull, tmplData);
  },

  showResourceAdd: function(e) {
    e.preventDefault();
    var $el = this.el.find('.add-resource-form');
    var newResource = new CKAN.Model.Package({});
    var self = this;
    function handleNewResourceSave(model) {
      var res = self.model.get('resources');
      res.push(model.toJSON());
      self.model.set({resources: res});
      $el.hide();
      self.render();
    }
    newResource.bind('change', handleNewResourceSave);
    var resourceView = new my.ResourceEditView({
      el: $el,
      model: newResource
    });
    resourceView.render();
  }
});
