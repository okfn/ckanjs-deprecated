var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.DatasetFullView = Backbone.View.extend({
    template: ' \
  <div class="dataset view" dataset-id="{{dataset.id}}"> \
    <div class="page-header"> \
      <h1>{{dataset.title}}</h1> \
    </div \
    <div class="extract"> \
      {{dataset.snippet}} \
    </div> \
    <div class="tags"> \
      {{#dataset.tags.length}} \
      <ul class="tags"> \
        {{#dataset.tags}} \
          <li>{{.}}</li> \
        {{/dataset.tags}} \
      </ul> \
      {{/dataset.tags.length}} \
    </div> \
    <div class="resources subsection"> \
      <h3>Resources</h3> \
      <table> \
        <tr> \
          <th>Description</th> \
          <th>Format</th> \
          <th>Actions</th> \
        </tr> \
        {{#dataset.resources}} \
        <tr> \
          <td> \
            <a href="#dataset/{{dataset.id}}/resource/{{id}}"> \
            {{description}} \
            {{^description.length}} \
            (No description) \
            {{/description.length}} \
            </a> \
          </td> \
          <td>{{format}}</td> \
          <td><a href="{{url}}" target="_blank" class="resource-download">Download</a> \
        </tr> \
        {{/dataset.resources}} \
        {{^dataset.resources}} \
        <tr><td>No resources.</td><td></td></tr> \
        {{/dataset.resources}} \
      </table> \
    </div> \
    <div class="notes subsection"> \
      <h3 id="anchor-notes">Notes</h3> \
      <div class="notes-body editable-area" backbone-attribute="notes"> \
        {{html dataset.notesHtml}} \
        {{^dataset.notes}} \
        <em>No notes yet. Click to add some ...</em> \
        {{/dataset.notes}} \
      </div> \
    </div> \
    <div class="details subsection"> \
      <h3>Additional Information</h3> \
      <table> \
        <thead> \
          <tr> \
            <th>Field</th> \
            <th>Value</th> \
          </tr> \
        </thead> \
        <tbody> \
          <tr> \
            <td>Creator</td> \
            <td>{{dataset.author}}</td> \
          </tr> \
          <tr> \
            <td>Maintainer</td> \
            <td>{{dataset.maintainer}}</td> \
          </tr> \
          {{#dataset.extras}} \
          <tr> \
            <td class="package-label" property="rdfs:label">{{.}}</td> \
            <td class="package-details" property="rdf:value">{{.}}</td> \
          </tr> \
          {{/dataset.extras}} \
        </tbody> \
      </table> \
    </div> \
  </div> \
',

    templateSidebar: ' \
    <li class="widget-container widget_text"> \
      <h3>Connections</h3> \
      <ul> \
        {{#dataset.relationships}} \
        <li> \
          {{type}} dataset \
          <a href="#dataset/{{object}}/view">{{object}}</a> \
          {{#comment}} \
          <span class="relationship_comment"> \
            ({{comment}}) \
          </span> \
          {{/comment}} \
        </li> \
        {{/dataset.relationships}} \
      </ul> \
      {{^dataset.relationships}} \
      No connections to other datasets. \
      {{/dataset.relationships}} \
    </li> \
',
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);

      // slightly painful but we have to set this up here so
      // it has access to self because when called this will
      // be overridden and refer to the element in dom that
      // was being saved
      var self = this;
      this.saveFromEditable = function(value, settings) {
        var _attribute = $(this).attr('backbone-attribute');
        var _data = {};
        _data[_attribute] = value;
        self.model.set(_data);
        self.model.save({}, {
          success: function(model) {
            CKAN.View.flash('Saved updated notes');
          },
          error: function(model, error) {
            CKAN.View.flash('Error saving notes ' + error.responseText, 'error');
          }
        });
        // do not worry too much about what we return here
        // because update of model will automatically lead to
        // re-render
        return value;
      };
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
      $('#sidebar .widget-list').html(Mustache.render(this.templateSidebar, tmplData));
      this.el.html(Mustache.render(this.template, tmplData));
      this.setupEditable();
      return this;
    },

    setupEditable: function() {
      var self = this;
      this.el.find('.editable-area').editable(
        self.saveFromEditable, {
          type      : 'textarea',
          cancel    : 'Cancel',
          submit    : 'OK',
          tooltip   : 'Click to edit...',
          onblur    : 'ignore',
          data      : function(value, settings) {
            var _attribute = $(this).attr('backbone-attribute');
            return self.model.get(_attribute);
          }
        }
      );
    },

    showResourceAdd: function(e) {
      var self = this;
      e.preventDefault();
      var $el = $('<div />').addClass('resource-add-dialog');
      $('body').append($el);
      var resource = new CKAN.Model.Resource({
          'dataset': self.model
          });
      function handleNewResourceSave(model) {
        var res = self.model.get('resources');
        res.add(model);
        $el.dialog('close');
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
        autoOpen: false,
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
      $el.dialog('open');
      $el.bind("dialogbeforeclose", function () {
        self.el.find('.resource-add-dialog').remove();
      });
    }
  });

}(CKAN.View, jQuery));

