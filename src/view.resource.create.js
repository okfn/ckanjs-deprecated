var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function (CKAN, $, _, Backbone, undefined) {
  CKAN.View.ResourceCreate = Backbone.View.extend({
    initialize: function() {
      this.el = $(this.el);
      _.bindAll(this, 'renderMain');
      this.renderMain();
      this.$edit = $(this.el.find('.edit')[0]);
      this.$upload = $(this.el.find('.upload')[0]);
      this.editView = new CKAN.View.ResourceEditView({
        model: this.model,
        el: this.$edit
      });
      this.uploadView = new CKAN.View.ResourceUpload({
        el: this.$upload,
        model: this.model,
        // TODO: horrible reverse depedency ...
        client: CKAN.UI.workspace.client
      });
    },

    renderMain: function () {
      this.el.empty();
      tmplData = {
      };
      var tmpl = $.tmpl(CKAN.Templates.resourceCreate, tmplData);
      this.el.html(tmpl);
      return this;
    },

    render: function () {
      this.editView.render();
      this.uploadView.render();
    }
  });

})(CKAN, $, _, Backbone, undefined);

