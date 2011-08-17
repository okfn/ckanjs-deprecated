var CKAN = CKAN || {};

CKAN.View = function($) {
  var my = {};
  var showdown = new Showdown.converter();

  // Flash a notification message
  // 
  // Parameters: msg, type. type is set as class on notification and should be one of success, error.
  // If type not defined defaults to success
  my.flash = function(msg, type) {
    if (type === undefined) {
      var type = 'success'
    }
    $.event.trigger('notification', [msg, type]);
  };

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
      this.$apikey.val(cfg.apiKey);
    },

    events: {
      'submit #config-form': 'updateConfig'
    },

    updateConfig: function(e) {
      e.preventDefault();
      this.saveConfig();
      CKAN.View.flash('Saved configuration');
    },

    saveConfig: function() {
      this.cfg = {
        'endpoint': this.$ckanUrl.val(),
        'apiKey': this.$apikey.val()
      };
      $.event.trigger('config:update', this.cfg);
    }
  });

  my.DatasetEditView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'saveData', 'render');
      this.model.bind('change', this.render);
    },

    render: function() {
      tmplData = {
        dataset: this.model.toTemplateJSON()
      }
      var tmpl = $.tmpl(CKAN.Templates.datasetForm, tmplData);
      $(this.el).html(tmpl);
      if (tmplData.dataset.id) { // edit not add
        $('#minornavigation').html($.tmpl(CKAN.Templates.minorNavigationDataset, tmplData));
      }
      return this;
    },

    events: {
      'submit form.dataset': 'saveData',
      'click .previewable-textarea a': 'togglePreview',
      'click .dataset-form-navigation a': 'showFormPart'
    },

    showFormPart: function(e) {
      e.preventDefault();
      var action = $(e.target)[0].href.split('#')[1];
      $('.dataset-form-navigation a').removeClass('selected');
      $('.dataset-form-navigation a[href=#' + action + ']').addClass('selected');
    },

    saveData: function(e) {
      e.preventDefault();
      this.model.set(this.getData());
      this.model.save({}, {
        success: function(model) {
          CKAN.View.flash('Saved dataset');
          window.location.hash = '#dataset/' + model.id + '/view';
        }
      });
    },

    getData: function() {
      var _data = $(this.el).find('form.dataset').serializeArray();
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
        preview.html(this.model.toTemplateJSON().notesHtml);
        textarea.hide();
        preview.show();
      } else {
        textarea.show();
        preview.hide();
      }
      return false;
    }

  });

  my.DatasetFullView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
    },

    events: {
      'click .action-add-resource': 'showResourceAdd'
    },

    render: function() {
      var tmplData = {
        domain: this.options.domain,
        dataset: this.model.toTemplateJSON(),
      };
      $('.page-heading').html(tmplData.dataset.displaytitle);
      $('#minornavigation').html($.tmpl(CKAN.Templates.minorNavigationDataset, tmplData));
      $('#sidebar .widget-list').html($.tmpl(CKAN.Templates.sidebarDatasetView, tmplData));
      this.el.html($.tmpl(CKAN.Templates.datasetView, tmplData));
      return this;
    },

    showResourceAdd: function(e) {
      var self = this;
      e.preventDefault();
      var $el = $('<div />').addClass('resource-add-dialog'); //
      $('body').append($el);
      var resource = new CKAN.Model.Resource({
          'dataset': self.model
          });
      function handleNewResourceSave(model) {
        var res = self.model.get('resources');
        res.add(model);
        $el.remove()
        self.model.save({}, {
          success: function(model) {
            CKAN.View.flash('Saved dataset');
            // TODO: no need to re-render (should happen automatically)
            self.render();
          }
          , error: function(model, error) {
            CKAN.View.flash('Failed to save: ' + error, 'error');
          }
        });
      }
      resource.bind('change', handleNewResourceSave);
      var resourceView = new CKAN.View.ResourceCreate({
        el: $el,
        model: resource
      });
      resourceView.render();
      dialogOptions = {
        // does not seem to work for width ...
        position: ['center', 'center'],
        buttons: [],
        width:  660,
        resize: 'auto',
        modal: false,
        draggable: true,
        resizable: true
      };
      dialogOptions.title = 'Add Data (File, API, ...)';
      $el.dialog(dialogOptions);
    }
  });

  my.DatasetSearchView = Backbone.View.extend({
    events: {
      'submit #search-form': 'onSearch'
    },

    initialize: function(options) {
      var view = this;

      // Temporarily provide the view with access to the client for searching.
      this.client = options.client;
      this.$results = this.el.find('.results');
      this.$datasetList = this.$results.find('.datasets');
      this.$dialog = this.el.find('.dialog');

      this.resultView = new CKAN.View.DatasetListing({
        collection: new Backbone.Collection(),
        el: this.$datasetList
      });

      _.bindAll(this, "render");
    },

    render: function() {
      this.$('.count').html(this.totalResults);
      this.hideSpinner();
      this.$results.show();
      return this;
    },

    onSearch: function (event) {
      event.preventDefault();
      var q = $(this.el).find('input.search').val();
      this.doSearch(q);
    },

    doSearch: function (q) {
      $(this.el).find('input.search').val(q),
          self = this;

      this.showSpinner();
      this.$results.hide();
      this.$results.find('.datasets').empty();
      this.client.searchDatasets({
        query: {q:q},
        success: function (collection) {
          self.totalResults = collection.total;
          self.resultView.setCollection(collection);
          self.render();
        }
      });
    },

    showSpinner: function() {
      this.$dialog.empty();
      this.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
      this.$dialog.show();
    },

    hideSpinner: function() {
      this.$dialog.empty().hide();
    }
  });

  my.ResourceView = Backbone.View.extend({
    render: function() {
      var resourceData = this.model.toTemplateJSON();
      var resourceDetails = {};
      var exclude = [ 'resource_group_id',
        'description',
        'url',
        'position',
        'id',
        'webstore',
        'qa',
        'dataset',
        'displaytitle'
        ];
      $.each(resourceData, function(key, value) {
        if (! _.contains(exclude, key)) {
          resourceDetails[key] = value;
        }
      });
      tmplData = {
        dataset: this.model.get('dataset').toTemplateJSON(),
        resource: resourceData,
        resourceDetails: resourceDetails
      };
      $('.page-heading').html(tmplData.dataset.name + ' / ' + tmplData.resource.displaytitle);
      var tmpl = $.tmpl(CKAN.Templates.resourceView, tmplData);
      $(this.el).html(tmpl);
      return this;
    },

    events: {
    }
  });

  my.ResourceEditView = Backbone.View.extend({
    render: function() {
      var tmpl = $.tmpl(CKAN.Templates.resourceForm, this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    },

    events: {
      'submit form': 'saveData'
    },

    saveData: function() {
      // only set rather than save as can only save resources as part of a dataset atm
      this.model.set(this.getData(), {
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
    }

  });

  return my;
}(jQuery);
