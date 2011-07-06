var Package = Backbone.Model.extend({

  initialize: function (attributes) {
    this.ckan = this.collection.ckan;
    Backbone.Model.prototype.initialize.apply(this, arguments);
  },

  url: function () {
    var base = this.ckan.apiRest +  '/package',
        url;

    if (this.isNew()) {
      return base;
    }
    url = base + (base.charAt(base.length - 1) == '/' ? '' : '/');

    if (this.get('name')) {
      url += this.get('name');
    } else {
      url += this.id;
    }
    return url;
  },

  toTemplateJSON: function() {
    var out = this.toJSON(),
        ckanEndpoint = this.ckan.getOptions("server").endpoint,
        showdown = this.ckan.showdown,
        title = this.get('title'),
        notes = this.get('notes');

    out.ckan_url = ckanEndpoint + '/package/' + this.get('name');
    out.displaytitle = title ? title : 'No title ...';
    out.notesHtml = showdown.makeHtml(notes ? notes : '');
    out.snippet = this.makeSnippet(out.notesHtml);
    return out;
  },


  //todo: move this into an utility
  makeSnippet: function (notesHtml) {
    var out = $(notesHtml).text();

    if (out.length > 190) {
      out = out.slice(0, 190) + ' ...';
    }
    return out;
  }
});
