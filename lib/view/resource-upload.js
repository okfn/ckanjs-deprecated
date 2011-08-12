this.CKAN || (this.CKAN = {});
this.CKAN.View || (this.CKAN.View = {});

(function (CKAN, $, _, Backbone, undefined) {
  CKAN.View.ResourceUpload = Backbone.View.extend({
    tagName: 'div',

    // expects a client arguments in its options
    initialize: function(options) {
      this.el = $(this.el);
      this.client = options.client;
      _.bindAll(this, 'render', 'updateFormData');
    },

    render: function () {
      this.el.empty();
      tmplData = {
      }
      var tmpl = $.tmpl(CKAN.Templates.resourceUpload, tmplData);
      this.el.html(tmpl);
      this.setupFileUpload();
      return this;
    },

    setupFileUpload: function() {
      var self = this;
      this.el.find('.fileupload').fileupload({
        // needed because we are posting to remove url 
        forceIframeTransport: true,
        autoUpload: false,
        fail: function(e, data) {
          alert('Failed');
          alert(e);
        },
        add: function(e,data) {
          self.fileUploadData = data;
          // TODO: sanitize file name ...
          var key = data.files[0].name;
          var _ok = self.updateFormData(key);
          if (!_ok) {
            return null;
          }
          var jqXHR = data.submit()
            .success(function (result, textStatus, jqXHR) {
              alert('file uploaded ok')
            })
            .error(function (jqXHR, textStatus, errorThrown) {
              alert('error')
            })
            .complete(function (result, textStatus, jqXHR) {
            });
        }
      })
    },

    updateFormData: function(key) {
      var self = this;
      self.el.find('.fileinfo').text(key);
      self.client.getStorageAuthForm(key, {
        async: false,
        success: function(data) {
          self.el.find('form').attr('action', data.action);
          _tmpl = '<input type="hidden" name="${name}" value="${value}" />';
          var $hidden = $(self.el.find('form div.hidden-inputs')[0]);
          $.each(data.fields, function(idx, item) {
            $hidden.append($.tmpl(_tmpl, item));
          });
          return true;
        },
        error: function(e) {
          alert('Failed to get credentials for storage upload. Upload cannot proceed');
          return false;
        }
      });
    }
  });

})(CKAN, $, _, Backbone, undefined);
