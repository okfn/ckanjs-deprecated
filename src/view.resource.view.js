var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

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
      var tmpl = $.tmpl(CKAN.Templates.resourceView, tmplData);
      $(this.el).html(tmpl);
      return this;
    },

    events: {
    }
  });

}(CKAN.View, jQuery));

