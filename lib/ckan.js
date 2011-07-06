//use mustache like syntax for variable interpolation in templates
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

function Ckan (options) {
  options = options || {};
  this.showdown = new Showdown.converter();
  this._options = _.defaults(options, this._defaults);
  this._validateOptions();
  this._appendStylesheets();

  this._mainController = new MainController({ckan: this});
}


Ckan.prototype = {

  //default values for the options object
  _defaults: {
    query: {
      tags: 'art'
    },
    selector: null,
    server: {
      endpoint: "http://ckan.net",
      apiKey: null
    },
    widget: {
      showSearchBox: false,
      showDescription: true,
      showResourceFormats: true,
      showDetailsInLightbox: true
    }
  },

  element: null,

  _validateOptions: function () {
    this._validateSelector();
  },

  _validateSelector : function () {
    var selector = this.getOptions('selector');
    if (!selector) {
      throw new Error("Missing 'selector' value in the options object");
    }

    else {
      this.element = jQuery(selector);

      if (!this.element.length) {
        throw new Error("Cannot find a DOM element for selector: " + selector);
      }
    }
  },


  /*
  * Appends cleanslate.css and Ckanjs.css to the host document
  *
  * Returns nothing.
  *
  */

  _appendStylesheets: function () {
    //TODO: replace the latter with an absolute url
    _.each([
      "../css/cleanslate.css",
      "../css/widget.css"
    ], function (src) {
      jQuery(document.head).append('<link rel="stylesheet" href="' + src + '" type="text/css" />');
    });
  },


  /*
  * Public:
  * Appends a DOM element to the selector specified in the constructor's options object.
  *
  * html - a html string or a DOM element.
  *
  */

  attach: function (html) {
    this.element.append(html);
  },

  /*
  * Public:
  * Wrapper method for rendering templates
  *
  * template     - An existing key in the Ckan.Templates object.
  * templateVars - A set of key value pairs.
  *
  * returns The interpolated template.
  */

  renderTemplate: function (template, templateVars) {
    return jQuery.tmpl(Ckan.Templates[template], templateVars);
  },

  // getters

  getOptions: function (key) {
    if (key) {
      return this._options[key];
    }
    else {
      return this._options;
    }
  },

  apiUrl: function () {
    return this.options.server.endpoint + '/api/2';
  },
  apiSearchUrl: function () {
    return this.api() + '/search';
  },
  apiRestUrl: function () {
    return this.api + '/rest';
  }
};
