var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.ResourceEditView = Backbone.View.extend({
    template: ' \
  <form class="resource" action="" method="POST"> \
    <dl> \
      <dt> \
        <label class="field_opt" for="Resource--url"> \
          Link \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--url" name="Resource--url" type="text" value="${url}" placeholder="http://mydataset.com/file.csv" /> \
      </dd> \
      <dt> \
        <label class="field_opt" for="Resource--type"> \
          Kind \
        </label> \
      </dt> \
      <dd> \
        <select id="Resource--type" name="Resource--type"> \
          <option selected="selected" value="file">File</option> \
          <option value="api">API</option> \
          <option value="listing">Listing</option> \
          <option value="example">Example</option> \
        </select> \
      </dd> \
    </dl> \
 \
  <fieldset> \
    <legend> \
      <h3>Optional Info</h3> \
    </legend> \
    <dl> \
      <dt> \
        <label class="field_opt" for="Resource--description"> \
          Description \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--description" name="Resource--description" type="text" value="${description}" placeholder="A short description ..."/> \
      </dd> \
 \
 \
      <dt> \
        <label class="field_opt" for="Resource--format"> \
          Format \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--format" name="Resource--format" type="text" value="${format}" placeholder="e.g. csv, zip:csv (zipped csv), sparql"/> \
      </dd> \
    </fieldset> \
 \
    <div class="submit"> \
      <input id="save" name="save" type="submit" value="Save" /> \
    </div> \
  </form> \
',
    render: function() {
      var tmpl = $.tmpl(this.template, this.model.toJSON());
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

}(CKAN.View, jQuery));

