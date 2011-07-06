var Resource = Backbone.Model.extend({
 /*
  * Sets the resource urls.
  *
  * returns a url string.
  *
  */
  url: function() {
    var base = CKAN.apiRest +  '/resource';

    if (this.isNew()) {
      return base;
    }
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  },


 /*
  * Validates the resource's values before creating a new record.
  *
  * attrs - a set of key value pairs.
  *
  * Returns nothing.
  *
  */
  validate: function(attrs) {
    if (!attrs.url) {
      //TODO: make sure this is an actual url
      return {
        'url': 'URL must be set'
      };
    }
  }
});
