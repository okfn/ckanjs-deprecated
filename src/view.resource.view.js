var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.ResourceView = Backbone.View.extend({
    template: ' \
  <div class="resource view" resource-id="{{resource.id}}"> \
    <h3> \
      <a href="{{resource.url}}" class="url">{{resource.url}}</a> [{{resource.format}}] \
    </h3> \
    <div class="description"> \
      {{resource.description}} \
    </div> \
    \
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
          {{#resourceDetails}} \
          <tr> \
            <td class="label">{{.}}</td> \
            <td class="value">{{.}}</td> \
          </tr> \
          {{/resourceDetails}} \
        </tbody> \
      </table> \
    </div> \
  </div> \
',
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
        resource: resourceData,
        resourceDetails: resourceDetails
      };
      // HACK - for tests ...
      if (this.model.get('dataset')) {
        tmplData.dataset = this.model.get('dataset').toTemplateJSON();
      } else {
        tmplData.dataset = {
          name: 'unknown'
        }
      }
      $('.page-heading').html(tmplData.dataset.name + ' / ' + tmplData.resource.displaytitle);
      var tmpl = Mustache.render(this.template, tmplData);
      $(this.el).html(tmpl);
      return this;
    },

    events: {
    }
  });

}(CKAN.View, jQuery));

