var CKAN = CKAN || {};

CKAN.UI = function($) {
  var my = {};

  var Workspace = Backbone.Controller.extend({
    routes: {
      "": "index",
      "search": "search",
      "search/:query": "search",
      "search/:query/p:page": "search",
      "add": "add",
      "config": "config"
    },

    initialize: function(options) {
      var newPkg = new CKAN.Model.Package();
      var newCreateView = new CKAN.View.PackageCreateView({model: newPkg, el: $('#add-page')});
      newCreateView.render();
      var searchView = new CKAN.View.PackageSearchView();

      function switchView(view) {
        this.switchView(view);
      }

      $(document).bind('package-edit', function(e, pkg) {
        var newCreateView = new CKAN.View.PackageCreateView({model: pkg});
        $('#edit-page').html(newCreateView.render().el);
        switchView('edit');
      });
    },

    switchView: function(view) {
      $('.page-view').hide();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
      this.search();
    },

    search: function(query, page) {
      this.switchView('search');
    },

    add: function() {
      this.switchView('add');
    },

    edit: function(pkg) {
    },

    config: function() {
      this.switchView('config');
    }
  });
  
  my.initialize = function() {
    var workspace = new Workspace();
    Backbone.history.start()

    my.$ckanUrl = $('#config-form input[name=ckan-url]');
    my.$apikey = $('#config-form input[name=ckan-api-key]');
    my.$notificationDiv = $('.flash-banner-box');

    $(document).bind('notification', my.showNotification);

    // initialize from file config
    my.$ckanUrl.val(CKAN.Config.url);
    my.$apikey.val(CKAN.Config.apikey ? CKAN.Config.apikey : '');
    my.configureModel();

    $('#config-form').submit(function(e) {
      e.preventDefault();
      my.$ckanUrl.val(my.$ckanUrl.val());
      my.$apikey.val(my.$apikey.val());
      my.configureModel();
      my.showNotification(null, 'Saved configuration', 'success');
    });

    // load templates
    // TODO: is there a problem that this is async (e.g. we complete an
    // action that requires templates before they are loaded?)
    // $.get('templates/_ckan.tmpl.html', function(templates) {
    //  // Inject all those templates at the end of the document.
    //  $('body').append(templates);
    // });
  };

  my.configureModel = function() {
    CKAN.Model.configure(my.$ckanUrl.val(), my.$apikey.val());
  };

  // TODO: should this be in initialize or even in a separate view?
  $.template('notificationTemplate',
      '<div class="flash-banner ${type}">${message} <button>X</button></div>');
  $('.flash-banner button').live('click', function(e) {
    e.preventDefault() 
    my.$notificationDiv.slideUp(200);
  });
  my.showNotification = function(e, msg, type) {
    var _out = $.tmpl('notificationTemplate', {'message': msg, 'type': type})
    my.$notificationDiv.html(_out);
    my.$notificationDiv.slideDown(400);
  }

  return my;
}(jQuery);

