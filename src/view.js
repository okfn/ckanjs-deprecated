var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {
  // Flash a notification message
  // 
  // Parameters: msg, type. type is set as class on notification and should be one of success, error.
  // If type not defined defaults to success
  my.flash = function(msg, type) {
    if (type === undefined) {
      var type = 'success'
    }
    $.event.trigger('notification', [msg, type]);
  };

  my.NotificationView = Backbone.View.extend({
    template: '<div class="flash-banner {{type}}">{{message}} <button>X</button></div>',
    initialize: function() {
      var self = this;
      $(document).bind('notification', function(e, msg, type) {
        self.render(msg, type)
      });
    },

    events: {
      'click .flash-banner button': 'hide'
    },

    render: function(msg, type) {
      var _out = Mustache.render(this.template, {'message': msg, 'type': type})
      this.el.html(_out);
      this.el.slideDown(400);
    },

    hide: function() {
      this.el.slideUp(200);
    }
  });

  return my;
}(CKAN.View, jQuery));

