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
        // needed because we are posting to remote url 
        forceIframeTransport: true,
        replaceFileInput: false,
        autoUpload: false,
        fail: function(e, data) {
          alert('Upload failed');
        },
        add: function(e,data) {
          self.fileData = data;
          self.fileUploadData = data;
          self.key = self.makeUploadKey(data.files[0].name);
          self.updateFormData(self.key);
        },
        send: function(e, data) {
          self.setMessage('Uploading file ... <img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" class="spinner" />');
        },
        done: function(e, data) {
          self.onUploadComplete(self.key);
        }
      })
    },

    // Create an upload key/label for this file.
    // 
    // Form: {current-date}/file-name. Do not just use the file name as this
    // would lead to collisions.
    // (Could add userid/username and/or a small random string to reduce
    // collisions but chances seem very low already)
    makeUploadKey: function(fileName) {
      function ISODateString(d){
        function pad(n){return n<10 ? '0'+n : n}
        return d.getUTCFullYear()+'-'
           + pad(d.getUTCMonth()+1)+'-'
           + pad(d.getUTCDate())+'T'
           + pad(d.getUTCHours())+':'
           + pad(d.getUTCMinutes())+':'
           + pad(d.getUTCSeconds())+'Z'}
      var now = new Date();
      return ISODateString(now) + '/' + fileName;
    },

    updateFormData: function(key) {
      var self = this;
      self.setMessage('Checking upload permissions ... <img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" class="spinner" />');
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
          self.hideMessage();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // TODO: more graceful error handling (e.g. of 409)
          self.setMessage('Failed to get credentials for storage upload. Upload cannot proceed', 'error');
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

    onUploadComplete: function(key) {
      var self = this;
      self.client.apiCall({
        offset: '/storage/metadata/' + self.key,
        success: function(data) {
          var name = data._label;
          if (name && name.length > 0 && name[0] === '/') {
            name = name.slice(1);
          }
          self.model.set({
              url: data._location
              , name: name
              , size: data._content_length 
              , last_modified: data.last_modified
              , format: data._format
              , mimetype: data._format
              , type: 'file.upload'
              , owner: data['uploaded-by']
              , hash: data._checksum
            }
            , {
              error: function(model, error) {
                var msg = 'Filed uploaded OK but error adding resource: ' + error + '.';
                msg += 'You may need to create a resource directly. Uploaded file at: ' + data._location;
                CKAN.View.flash(msg, 'error');
              }
            }
          );
          self.setMessage('File uploaded OK and resource added', 'success');
          CKAN.View.flash('File uploaded OK and resource added');
        }
      });
    },

    setMessage: function(msg, category) {
      var category = category || 'notice';
      this.$messages.removeClass('notice success error');
      this.$messages.addClass(category);
      this.$messages.show();
      this.$messages.html(msg);
    },

    hideMessage: function() {
      this.$messages.hide('slow');
    }
  });

})(CKAN, $, _, Backbone, undefined);
