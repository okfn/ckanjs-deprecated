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

  my.DatasetCreateView = Backbone.View.extend({
    render: function() {
      var tmpl = $.tmpl(CKAN.Templates.datasetForm, this.model.toJSON());
      $(this.el).html(tmpl);
      return this;
    },

    events: {
      'submit form.dataset': 'saveData',
      'click .previewable-textarea a': 'togglePreview'
    },

    saveData: function(e) {
      e.preventDefault();
      this.model.set(this.getData());
      this.model.save();
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

  my.DatasetSummaryView = Backbone.View.extend({

    render: function() {
      var tmplData = {
        domain: this.options.domain,
        dataset: this.model.toTemplateJSON(),
        urls: {
          datasetView: CKAN.UI.workspace.url('dataset', 'view', this.model.id),
          datasetEdit: CKAN.UI.workspace.url('dataset', 'edit', this.model.id)
        }
      };
      this.el = $.tmpl(CKAN.Templates.datasetSummary, tmplData);
      // have to redelegate as element set up here ...
      this.delegateEvents();
      return this;
    }
  });

  my.DatasetFullView = Backbone.View.extend({
    initialize: function() {
    },

    events: {
      'click .action-add-resource': 'showResourceAdd'
    },

    render: function() {
      var tmplData = {
        domain: this.options.domain,
        dataset: this.model.toTemplateJSON(),
      };
      return $.tmpl(CKAN.Templates.datasetFull, tmplData);
    },

    showResourceAdd: function(e) {
      e.preventDefault();
      var $el = this.el.find('.add-resource-form');
      var newResource = new CKAN.Model.Dataset({});
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

  my.DatasetSearchView = Backbone.View.extend({
    events: {
      'submit #search-form': 'doSearch'
    },
    // hash of DatasetSummaryView instances organised by cid
    datasetSummaryViews: {},

    initialize: function(options) {
      var view = this;

      // Temporarily provide the view with access to the client for searching.
      this.client = options.client;
      this.collection = new CKAN.Model.SearchCollection();
      this.$results = this.el.find('.results');
      this.$dialog = this.el.find('.dialog');

      _.bindAll(this, "onReset", "render", "addOne");
      this.collection.bind("reset", view.onReset);
      this.bind('searchComplete', view.render);
    },

    render: function() {
      this.$('.count').html(this.collection.total);
      this.hideSpinner();
      this.$results.show();
      return this;
    },

    onReset: function (collection) {
      var self = this;
      collection.each( function( ckanDataset) {
        self.addOne(ckanDataset);
      });
      this.trigger("searchComplete");
    },

    addOne: function(pkg) {
      var newView = new CKAN.View.DatasetSummaryView({model: pkg, domain: this.options.domain});
      //this.datasetSummaryViews[pkg.cid] = newView;
      this.$results.find('.datasets').append(newView.render().el);
      return this;
    },

    doSearch: function (event) {
      var q = $(this.el).find('input.search').val(),
          view = this;

      this.showSpinner();
      this.$results.hide();
      this.$results.find('.datasets').empty();
      this.client.searchDatasets({
        data: {q:q},
        success: function (collection) {
          view.collection.total = collection.total;
          view.collection.reset(collection.models);
        }
      });

      event.preventDefault();
    },

    showSpinner: function() {
      this.$dialog.empty();
      this.$dialog.html('<h2>Loading results...</h2><img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
      this.$dialog.show();
    },

    hideSpinner: function() {
      this.$dialog.empty().hide();
    },

    viewDataset: function (datasetId) {

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


  var Lightbox = Backbone.View.extend({

    className: 'lightbox',

    events: {
      'click .close': '_onClose'
    },

    classes: {
      hide: 'hide',
      loading: 'loading'
    },

    constructor: function Lightbox() {
      Backbone.View.prototype.constructor.apply(this, arguments);
    },

    show: function (options) {
      $(this.el).removeClass(this.classes.hide);
      return this._trigger(options, 'show', this);
    },

    hide: function (options) {
      $(this.el).addClass(this.classes.hide);
      return this._trigger(options, 'close', this);
    },

    showLoading: function () {
      $(this.el).addClass(this.classes.loading);
      return this;
    },

    hideLoading: function () {
      $(this.el).removeClass(this.classes.loading);
      return this;
    },

    title: function (title) {
      this.$('h1').html(title);
      return this;
    },

    content: function (content) {
      if (typeof content === 'string') {
        this._content.html(content);
      } else {
        this._content.empty().append(content);
      }

      return this;
    },

    setClass: function (className) {
      this.el.className = this.className + ' ' + className;
      return this;
    },

    isEmpty: function () {
      return !this._content.children().length;
    },

    isHidden: function () {
      return $(this.el).hasClass(this.classes.hide);
    },

    hasClass: function (className) {
      return $(this.el).hasClass(className);
    },

    render: function () {
      var template = $.tmpl(CKAN.Templates.lightbox);
      this._content = $(this.el).html(template).find('div');
      return this.el;
    },

    _trigger: function () {
      var options = arguments[0] || {},
          args = Array.prototype.slice.call(arguments, 1);

      if (!options.silent) {
        this.trigger.apply(this, args);
      }

      return this;
    },

    _onClose: function (event) {
      event.preventDefault();
      document.location.hash = "";
      this.hide();
    }
  });

  my.Lightbox = Lightbox;

  return my;
}(jQuery);
