var CKAN = CKAN || {};

CKAN.View = function($) {
  var my = {};
  var showdown = new Showdown.converter();

  my.NotificationView = Backbone.View.extend({
    initialize: function() {
      $.template('notificationTemplate',
          '<div class="flash-banner ${type}">${message} <button>X</button></div>');

      var self = this;
      $(document).bind('notification', function(e, msg, type) {
        self.render(msg, type)
      });
    },

    events: {
      'click .flash-banner button': 'hide'
    },

    render: function(msg, type) {
      var _out = $.tmpl('notificationTemplate', {'message': msg, 'type': type})
      this.el.html(_out);
      this.el.slideDown(400);
    },

    hide: function() {
      this.el.slideUp(200);
    }
  });

  my.ConfigView = Backbone.View.extend({
    initialize: function() {
      this.cfg = {};
      this.$ckanUrl = this.el.find('input[name=ckan-url]');
      this.$apikey = this.el.find('input[name=ckan-api-key]');

      var cfg = this.options.config;
      this.$ckanUrl.val(cfg.endpoint);
      this.$apikey.val(cfg.api_key);
    },

    events: {
      'submit #config-form': 'updateConfig'      
    },

    updateConfig: function(e) {
      e.preventDefault();
      this.saveConfig();
      $.event.trigger('notification', ['Saved configuration', 'success']);
    },

    saveConfig: function() {
      this.cfg = {
        'endpoint': this.$ckanUrl.val(),
        'api_key': this.$apikey.val()
      };
      $.event.trigger('config:update', this.cfg);
    }
  });

  my.PackageCreateView = Backbone.View.extend({
    render: function() {
      var tmpl = $.tmpl(CKAN.Templates.packageForm, this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    },

    events: {
      'submit form.package': 'saveData',
      'click .previewable-textarea a': 'togglePreview'
    },

    saveData: function(e) {
      e.preventDefault();
      this.model.save(this.getData());
      return false;
    },

    getData: function() {
      var _data = $(this.el).find('form.package').serializeArray();
      modelData = {};
      $.each(_data, function(idx, value) {
        modelData[value.name.split('--')[1]] = value.value
      });
      return modelData;
    },

    togglePreview: function(e) {
      // set model data as we use it below for notesHtml
      this.model.set(this.getData());
      e.preventDefault();
      var el = $(e.target);
      var action = el.attr('action');
      var div = el.closest('.previewable-textarea');
      div.find('.tabs a').removeClass('selected');
      div.find('.tabs a[action='+action+']').addClass('selected');
      var textarea = div.find('textarea');
      var preview = div.find('.preview');
      if (action=='preview') {
        preview.html(this.model.notesHtml());
        textarea.hide();
        preview.show();
      } else {
        textarea.show();
        preview.hide();
      }
      return false;
    }

  });

  my.PackageSummaryView = Backbone.View.extend({
    initialize: function() {
    },

    render: function() {
      var tmplData = {
        package: this.model.toTemplateJSON(),
        urls: {
          packageView: CKAN.UI.workspace.url('package', 'view', this.model.id),
          packageEdit: CKAN.UI.workspace.url('package', 'edit', this.model.id)
        }
      }
      this.el = $.tmpl(CKAN.Templates.packageSummary, tmplData);
      // have to redelegate as element set up here ...
      this.delegateEvents();
      return this;
    }
  });

  my.PackageFullView = Backbone.View.extend({
    initialize: function() {
    },

    render: function() {
      var tmplData = {
        package: this.model.toJSON(),
      }
      this.el = $.tmpl(CKAN.Templates.packageFull, tmplData);
      // have to redelegate as element set up here ...
      this.delegateEvents();
      return this;
    }
  });

  my.PackageSearchView = Backbone.View.extend({
    initialize: function() {
      this.$results = this.el.find('.results');
      this.$dialog = this.el.find('.dialog');
      // TODO: must be a better way
      var self = this;
      _.bindAll(this, 'addOne', 'render');
      // listen for one add event to package list
      this.collection.bind('add', this.addOne);
      // bind to all events
      // this.collection.bind('all', this.render);
      $(document).bind('searchComplete', this.render);
    },

    render: function() {
      this.$results.find('.count').html(this.collection.count);
      this.hideSpinner();
      this.$results.show();
      return this;
    },

    addOne: function(pkg) {
      var newView = new CKAN.View.PackageSummaryView({model: pkg});
      this.$results.find('.packages').append(newView.render().el);
      return this;
    },

    // does not seem to work (perhaps because run before document is ready?
    events: {
      'submit #search-form': 'doSearch'
    },
    
    doSearch: function() {
      var q = $(this.el).find('input.search').val();
      this.showSpinner();
      this.$results.hide();
      this.$results.find('.packages').empty();

      var self = this;
      var handleSearchResults = function(data) {
        self.collection.count = data.count;

        $(data.results).each(function(idx, item) {
          var pkg = new CKAN.Model.Package(item);
          self.collection.add(pkg);
        });

        $.event.trigger('searchComplete');
      }

      CKAN.Model.search(q, handleSearchResults);
      return false;
    },

    showSpinner: function() {
      this.$dialog.empty();
      this.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
      this.$dialog.show();
    },

    hideSpinner: function() {
      this.$dialog.empty().hide()
    }

  });

  my.ResourceEditView = Backbone.View.extend({
    render: function() {
      var tmpl = $.tmpl(CKAN.Templates.resourceForm, this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    },

    events: {
      'submit form': 'saveData',
    },

    saveData: function() {
      this.model.save(this.getData(), {
        error: function(model, error) {
          var msg = 'Failed to save, possibly due to invalid data ';
          msg += JSON.stringify(error);
          alert(msg);
        }
      });
      return false;
    },

    getData: function() {
      var _data = $(this.el).find('form.resource').serializeArray();
      modelData = {};
      $.each(_data, function(idx, value) {
        modelData[value.name.split('--')[1]] = value.value
      });
      return modelData;
    },

  });

  return my;
}(jQuery);


