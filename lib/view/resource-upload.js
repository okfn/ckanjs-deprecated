this.CKAN || (this.CKAN = {});
this.CKAN.View || (this.CKAN.View = {});

(function (CKAN, $, _, Backbone, undefined) {
  CKAN.View.ResourceUpload = Backbone.View.extend({
    tagName: 'div',

    // expects a client arguments in its options
    initialize: function(options) {
      this.el = $(this.el);
      this.client = options.client;
      _.bindAll(this, 'render', 'updateFormData', 'setMessage', 'uploadFile');
    },

    events: {
      'click input[type="submit"]': 'uploadFile'
    },

    render: function () {
      this.el.empty();
      tmplData = {
      }
      var tmpl = $.tmpl(CKAN.Templates.resourceUpload, tmplData);
      this.el.html(tmpl);
      this.$messages = this.el.find('.messages');
      this.setupFileUpload();
      return this;
    },

    setupFileUpload: function() {
      var self = this;
      this.el.find('.fileupload').fileupload({
        // needed because we are posting to remove url 
        forceIframeTransport: true,
        replaceFileInput: false,
        autoUpload: false,
        fail: function(e, data) {
          alert('Upload failed');
        },
        add: function(e,data) {
          self.fileData = data;
          self.fileUploadData = data;
          // TODO: sanitize file name ...
          var key = data.files[0].name;
          self.updateFormData(key);
        },
        send: function(e, data) {
          self.setMessage('<h2>Uploading file ...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
        },
        done: function(e, data) {
          self.setMessage('Uploaded OK');
        }
      })
    },

    updateFormData: function(key) {
      var self = this;
      self.el.find('.fileinfo').text(key);
      self.setMessage('<h2>Checking upload permissions ...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
      self.client.getStorageAuthForm(key, {
        async: false,
        success: function(data) {
          self.el.find('form').attr('action', data.action);
          _tmpl = '<input type="hidden" name="${name}" value="${value}" />';
          var $hidden = $(self.el.find('form div.hidden-inputs')[0]);
          $.each(data.fields, function(idx, item) {
            $hidden.append($.tmpl(_tmpl, item));
          });
          self.hideMessage();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // TODO: more graceful error handling (e.g. of 409)
          self.setMessage('<h2>Failed to get credentials for storage upload. Upload cannot proceed</h2>');
        }
      });
    },

    uploadFile: function(e) {
      e.preventDefault();
      if (!this.fileData) {
        alert('No file selected');
        return;
      }
      var jqXHR = this.fileData.submit();
    },

    setMessage: function(msg) {
      this.$messages.show();
      this.$messages.html(msg);
    },

    hideMessage: function() {
      this.$messages.hide();
    }
  });

})(CKAN, $, _, Backbone, undefined);
