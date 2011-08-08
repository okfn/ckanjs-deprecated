this.CKAN || (this.CKAN = {});
this.CKAN.View || (this.CKAN.View = {});

(function (CKAN, $, _, Backbone, undefined) {
  CKAN.View.ResourceUpload = Backbone.View.extend({
    tagName: 'div',

    // expects a client arguments in its options
    initialize: function(options) {
      this.el = $(this.el);
      this.client = options.client;
      _.bindAll(this, 'update', 'render');
    },

    render: function () {
      this.el.empty();
      tmplData = {
      }
      var tmpl = $.tmpl(CKAN.Templates.resourceUpload, tmplData);
      this.el.html(tmpl);
      return this;
    },

    // update with data from backend storage
    update: function() {
      var self = this;
      var key = 'xyz/abc';
      this.client.getStorageAuthForm(key, {
        success: function(data) {
          _tmpl = '<input type="hidden" name="${name}" value="${value}" />';
          self.el.find('form').attr('action', data.action);
          var $hidden = $(self.el.find('form div.hidden-inputs')[0]);
          $.each(data.fields, function(idx, item) {
            $hidden.append($.tmpl(_tmpl, item));
          });
        }
      });
    }
  });

})(CKAN, $, _, Backbone, undefined);
