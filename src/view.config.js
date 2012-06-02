var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

  my.ConfigView = Backbone.View.extend({
    initialize: function() {
      this.cfg = {};
      this.$ckanUrl = this.el.find('input[name=ckan-url]');
      this.$apikey = this.el.find('input[name=ckan-api-key]');

      var cfg = this.options.config;
      this.$ckanUrl.val(cfg.endpoint);
      this.$apikey.val(cfg.apiKey);
    },

    events: {
      'submit #config-form': 'updateConfig'
    },

    updateConfig: function(e) {
      e.preventDefault();
      this.saveConfig();
      CKAN.View.flash('Saved configuration');
    },

    saveConfig: function() {
      this.cfg = {
        'endpoint': this.$ckanUrl.val(),
        'apiKey': this.$apikey.val()
      };
      $.event.trigger('config:update', this.cfg);
    }
  });

}(CKAN.View, jQuery));

