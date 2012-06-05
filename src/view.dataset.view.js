var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

// http://stackoverflow.com/questions/8961939
// TODO: Move this somewhere more central if reused?
Handlebars.registerHelper('eachkeys', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  var empty = true;
  var value;

  for (key in context) { empty = false; break; }

  if (!empty) {
    for (key in context) {
      value = context[key];
      // Make links clickable.
      if (value.match(/^http/)) {
        value = new Handlebars.SafeString("<a href='" + value + "'>" + value + "</a>");
      }
      ret = ret + fn({ 'key': key, 'value': value});
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

(function(my, $) {

  my.DatasetFullView = Backbone.View.extend({
    template: ' \
  <div class="dataset view" dataset-id="{{dataset.id}}"> \
    <div class="page-header"> \
      <h1>{{dataset.title}}</h1> \
    </div> \
    <div class="row"> \
      <div class="span8"> \
        <div class="extract subsection"> \
          <h3>Description</h3> \
          {{dataset.snippet}} \
        </div> \
        {{#if dataset.resources}} \
        <div class="resources subsection"> \
          <h3>Resources</h3> \
          <table class="table"> \
            <tr> \
              <th>Description</th> \
              <th>Format</th> \
              <th>Actions</th> \
            </tr> \
            {{#dataset.resources}} \
            <tr> \
              <td> \
                <a href="#dataset/{{dataset.id}}/resource/{{id}}"> \
                {{name}} \
                {{^name}} \
                {{id}} \
                {{/name}} \
                </a> \
                {{#if description}} \
                - {{description}} \
                {{/if}} \
              </td> \
              <td>{{format}}</td> \
              <td><a href="{{url}}" target="_blank" class="resource-download">Download</a> \
            </tr> \
            {{/dataset.resources}} \
          </table> \
        </div> \
        {{/if}} \
        <div class="details subsection"> \
          <h3>Additional Information</h3> \
          <table class="table"> \
            <thead> \
              <tr> \
                <th>Field</th> \
                <th>Value</th> \
              </tr> \
            </thead> \
            <tbody> \
              <tr> \
                <td>Source</td> \
                <td><a href="{{dataset.url}}">{{dataset.url}}</a></td> \
              </tr> \
              <tr> \
                <td>Creator</td> \
                <td>{{dataset.author}}</td> \
              </tr> \
              <tr> \
                <td>Maintainer</td> \
                <td>{{dataset.maintainer}}</td> \
              </tr> \
              {{#eachkeys dataset.extras}} \
              <tr> \
                <td class="package-label" property="rdfs:label">{{this.key}}</td> \
                <td class="package-details" property="rdf:value">{{this.value}}</td> \
              </tr> \
              {{/eachkeys}} \
            </tbody> \
          </table> \
        </div> \
      </div> \
      <div class="span4"> \
        <div class="license subsection"> \
          <h3>License</h3> \
          <a href="{{dataset.license_url}}">{{dataset.license_title}}</a> \
          {{#if dataset.isopen}} \
          <a href="http://opendefinition.org/okd/" title="This dataset satisfies the Open Definition."> \
              <img class="open-data" src="http://assets.okfn.org/images/ok_buttons/od_80x15_blue.png" alt="[Open Data]"> \
            </a> \
          {{else}} \
          <span class="closed"> \
            <img src="http://datahub.io/images/icons/lock.png" height="16px" width="16px" alt="None" class="inline-icon ">  Not openly licensed. \
              </span> \
          {{/if}} \
        </div> \
        {{#if dataset.tags}} \
        <h3>Tags</h3> \
        <div class="tags"> \
        <ul class="tags"> \
          {{#dataset.tags}} \
            <li>{{.}}</li> \
          {{/dataset.tags}} \
        </ul> \
        </div> \
        {{/if}} \
      </div> \
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
      var template = Handlebars.compile(this.template);
      t = template;
      $('.page-heading').html(tmplData.dataset.displaytitle);
      $('#sidebar .widget-list').html(Mustache.render(this.templateSidebar, tmplData));
      this.el.html(template(tmplData));
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

