var CKAN = CKAN || {};

CKAN.View = function($) {
  var my = {};

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

      // initialize from file config
      this.$ckanUrl.val(CKAN.Config.url);
      this.$apikey.val(CKAN.Config.apikey ? CKAN.Config.apikey : '');
      // propagate changes
      this.saveConfig();
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
        'ckan_url': this.$ckanUrl.val(),
        'api_key': this.$apikey.val()
      };
      $.event.trigger('config:update', this.cfg);
    }
  });

  my.PackageCreateView = Backbone.View.extend({
    render: function() {
      var tmpl = $('#tmpl-package-form').tmpl(this.model.toJSON());
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
      this.el = $('#tmpl-package-summary').tmpl(this.model.toJSON());
      // want this.el.find(...) but this does not work as not in dom yet
      $('.actions a').live('click', this.handleAction);
      return this;
    },

    handleAction: function(e) {
      e.preventDefault();
      var action = $(e.target).attr('href').slice(1);
      if (action=='edit') {
        $.event.trigger('package-edit', this.model);
      }
    }
  });

  my.PackageSearchView = Backbone.View.extend({
    initialize: function() {
      this.el = $('#search-page');
      this.$results = this.el.find('.results');
      this.$dialog = this.el.find('.dialog');
      // TODO: must be a better way
      var self = this;
      this.el.find('#search-form').submit(
        function(e) {
          e.preventDefault();
          self.doSearch.apply(self, arguments);
      });
      _.bindAll(this, 'addOne', 'render');
      this.collection = CKAN.Model.PackageSearchResults;
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
      CKAN.Model.search(q);
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

  return my;
}(jQuery);


