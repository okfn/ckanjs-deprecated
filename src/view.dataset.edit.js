var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

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
        },
        error: function(model, error) {
          CKAN.View.flash('Error saving dataset ' + error.responseText, 'error');
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

}(CKAN.View, jQuery));

