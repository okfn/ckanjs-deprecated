var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.DatasetEditView = Backbone.View.extend({
    template: ' \
  <form class="dataset" action="" method="POST"> \
    <dl> \
      <dt> \
        <label class="field_opt" for="dataset--title"> \
          Title * \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--title" name="Dataset--title" type="text" value="{{dataset.title}}" placeholder="A title (not a description) ..."/> \
      </dd> \
 \
      <dt> \
        <label class="field_req" for="Dataset--name"> \
          Name * \
          <span class="hints"> \
            A short unique name for the dataset - used in urls and restricted to [a-z] -_ \
          </span> \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--name" maxlength="100" name="Dataset--name" type="text" value="{{dataset.name}}" placeholder="A shortish name usable in urls ..." /> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--license_id"> \
          Licence \
        </label> \
      </dt> \
      <dd> \
        <select id="Dataset--license_id" name="Dataset--license_id"> \
          <option selected="selected" value=""></option> \
          <option value="notspecified">Other::License Not Specified</option> \
        </select> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--notes"> \
          Description and Notes \
          <span class="hints"> \
            (You can use <a href="http://daringfireball.net/projects/markdown/syntax">Markdown formatting</a>) \
          </span> \
        </label> \
      </dt> \
      <dd> \
        <div class="previewable-textarea"> \
          <ul class="tabs"> \
            <li><a href="#" action="write" class="selected">Write</a></li> \
            <li><a href="#" action="preview">Preview</a></li> \
          </ul> \
          <textarea id="Dataset--notes" name="Dataset--notes" placeholder="Start with a summary sentence ...">{{dataset.notes}}</textarea> \
          <div id="Dataset--notes-preview" class="preview" style="display: none;"> \
          <div> \
        </div> \
      </dd> \
    </dl> \
 \
    <div class="submit"> \
      <input id="save" name="save" type="submit" value="Save" /> \
    </div> \
  </form> \
',
    initialize: function() {
      _.bindAll(this, 'saveData', 'render');
      this.model.bind('change', this.render);
    },

    render: function() {
      tmplData = {
        dataset: this.model.toTemplateJSON()
      }
      var tmpl = Mustache.render(this.template, tmplData);
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

