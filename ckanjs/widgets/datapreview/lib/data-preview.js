(function ($) {
  var dp = {};

  // Set up in DOM ready.
  dp.$dialog = null;
  dp.webstore = null;

  // Time to wait for a JSONP request to timeout.
  dp.timeout = 5000;

  // True when plugin dependancies have been loaded.
  dp.areDependanciesLoaded = false;

  // Key to use when saving the charts onto a resource.
  dp.resourceChartKey = 'datapreview-charts';

  // An array of stylsheets to be loaded into the head.
  dp.stylesheets = [
     'lib/jquery-ui/css/ckan/jquery-ui-1.8.14.custom.css',
     'lib/slickgrid/slick.grid.css',
     'lib/slickgrid/slick.columnpicker.css'
  ];

  // Scripts to be loaded when required namspaced by plugin.
  dp.scripts = {
    'jquery-ui': [
      'lib/jquery-ui/js/jquery-ui-1.8.14.custom.min.js',
      'lib/jquery-ui/js/jquery.event.drag-2.0.min.js'
    ],
    'slickgrid': [
      'lib/slickgrid/slick.grid.js',
      'lib/slickgrid/slick.columnpicker.js'
    ],
    'flot': [
      'lib/data-preview.ui.js',
      'lib/flot/jquery.flot.js'
    ]
  };

  // Template url. The html property is populated on load.
  dp.template = {
    html: '',
    src: 'lib/data-preview.html'
  };

  dp.normalizeFormat = function(format) {
    var out = format.toLowerCase();
    out = out.split('/');
    out = out[out.length-1];
    return out;
  };

  dp.normalizeUrl = function(url) {
    if (url.indexOf('https') === 0) {
      return 'http' + url.slice(5);
    } else {
      return url;
    }
  }

  // Public: Escapes HTML entities to prevent broken layout and XSS attacks
  // when inserting user generated or external content.
  //
  // string - A String of HTML.
  //
  // Returns a String with HTML special characters converted to entities.
  //
  dp.escapeHTML = function (string) {
    return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
                 .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#x27')
                 .replace(/\//g,'&#x2F;');
  };

  // Public: Loads the dependancies required by the plugin.
  //
  // This allows the page to load quicly with only a minimal bootstrap
  // to set up the UI. Then the rest of the script, stylesheets and templates
  // are loaded when the user intiates the plugin.
  //
  // callback - A callback to fire once all dependancies are ready.
  //
  // Returns nothing.
  //
  dp.loadDependancies = function (callback) {
    if (dp.areDependanciesLoaded) {
      return callback();
    }

    var uiVersion = ($.ui && $.ui.version || '').split('.'),
        scripts;

    // Don't load jQuery UI if it exists on the page.
    if (uiVersion[0] >= 1 && uiVersion[1] >= 8 && uiVersion[2] >= 14) {
      dp.scripts['jquery-ui'].shift();
    }

    // Build an array of promise objects for each script to load.
    scripts = $.map(dp.scripts['jquery-ui'], $.getScript);

    // When all promises have completed load the next set of libraries.
    $.when.apply($, scripts).then(function () {
      scripts = $.map(dp.scripts['slickgrid'], $.getScript);
      scripts = scripts.concat($.map(dp.scripts['flot'], $.getScript));

      // Load the template file from the server.
      scripts.push($.get(dp.template.src, function (html) {
        dp.template.html = html;
      }));

      $.when.apply($, scripts).then(function () {
        dp.areDependanciesLoaded = true;

        var dialog = dp.$dialog;
        dialog.dialog(dp.dialogOptions).dialog("widget").css('position', 'fixed');
        callback();
      });
    });

    // Prepend dependant stylesheets to the page (before the plugin stylesheet
    // so we can take advantage of the cascade).
    var pluginStylesheet = $('.ckanext-datapreview-stylesheet');
    $.each(dp.stylesheets, function () {
      pluginStylesheet.before($('<link />', {
        rel: 'stylesheet',
        href: this
      }));
    });
  };

  // Public: Requests the formatted resource data from the webstore and
  // passes the data into the callback provided.
  //
  // preview - A preview object containing resource metadata.
  // callback - A Function to call with the data when loaded.
  //
  // Returns nothing.
  //
  dp.getResourceDataDirect = function(preview, callback) {
    // $.ajax() does not call the "error" callback for JSONP requests so we
    // set a timeout to provide the callback with an error after x seconds.
    var timer = setTimeout(function error() {
      callback(preview, {
        error: {
          title: 'Request Error',
          message: 'Dataproxy server did not respond after ' + (dp.timeout / 1000) + ' seconds'
        }
      });
    }, dp.timeout);

    // have to set jsonp because webstore requires _callback but that breaks jsonpdataproxy
    var jsonp = '_callback';
    if (preview.url.indexOf('jsonpdataproxy') != -1) {
      jsonp = 'callback';
    }

    // We need to provide the `cache: true` parameter to prevent jQuery appending
    // a cache busting `={timestamp}` parameter to the query as the webstore
    // currently cannot handle custom parameters.
    $.ajax({
      url: preview.url,
      cache: true,
      dataType: 'jsonp',
      jsonp: jsonp,
      success: function(data) {
        clearTimeout(timer);
        callback(preview, data);
      }
    });
  };

  // Public: Searches a dataset object returned by the CKAN api for a specific
  // resource using the hash as identification.
  //
  // hash    - A hash String to search for.
  // dataset - A package dataset object.
  //
  // Returns the resource object or null if not found.
  //
  dp.getResourceFromDataset = function (hash, dataset) {
    var resources = dataset.resources, i = 0, count = resources.length, charts;
    for (; i < count; i += 1) {
      if (resources[i].hash === hash) {
        return resources[i];
      }
    }
    return null;
  };

  // Public: Requests a dataset from th CKAN api.
  //
  // This method returns a jQuery jqXHR object onto which other additonal
  // callbacks can be added to handle error requests etc.
  //
  // uri      - The uri of the package/dataset on the server.
  // callback - A Function to call with the dataset on completion.
  //
  // Examples
  //
  //   var uri = '/api/rest/package/uk-population-estimates-1520-to-1851';
  //   var request = dp.getResourceDataset(uri, function (dataset) {
  //     // Do something with the dataset.
  //   });
  //
  //   // Additional callbacks can be added to the returned jqXHR object.
  //   request.error(onError);
  //
  // Returns a jqXHR object for the request.
  //
  dp.getResourceDataset = function (uri, callback) {
    return $.getJSON(uri, function (dataset) {
      callback && callback(dataset);
    });
  };

  // Public: Updates a chart on a package resource using the CKAN API.
  //
  // Charts are currently stored on an object on the resource namespaced by
  // id key. This enables each resource to store multiple charts.
  //
  // This method returns the jqXHR object onto which additonal callbacks
  // can be bound.
  //
  // preview  - A preview object containing resource data.
  // chart    - The current chart object to save.
  // apiKey   - The current logged in users api key String.
  // callback - A callback Function to fire when the request succeeds.
  //
  // Examples
  //
  //   datapreview.editor.bind('save', function (chart) {
  //     var request = dp.updateResourceChart(preview, chart, 'Some-String');
  //     request.then(onSuccess, onError);
  //   });
  //
  // Returns a jqXHR object.
  //
  dp.updateResourceChart = function (preview, chart, apiKey, callback) {
    var resource = preview.resource,
        charts   = preview.charts || {},
        resourceData = {};

    function success() {
      callback && callback();
    }

    if (!resource) {
      return $.Deferred().done(success).resolve().promise();
    }

    charts[chart.id] = chart;

    resourceData.id  = resource.id;
    resourceData.url = resource.url;
    resourceData[dp.resourceChartKey] = JSON.stringify(charts);

    return $.ajax({
      url: preview['dataset-uri'],
      data: JSON.stringify({resources: [resourceData]}),
      type: 'PUT',
      dataType: 'json',
      processData: false,
      contentType: 'application/json',
      headers: {
        'X-CKAN-API-KEY': apiKey
      },
      success: success
    });
  };

  // Public: Loads the plugin UI into the dialog and sets up event listeners.
  //
  // preview - A preview object containing resource data.
  // columns - Column Array formatted for use in SlickGrid.
  // data    - A data Array for use in SlickGrid.
  //
  // Returns nothing.
  //
  dp.loadDataPreview = function (preview, columns, data) {
    var dialog = dp.$dialog;

    // Need to create the grid once the dialog is open for cells to render
    // correctly.
    dialog.dialog(dp.dialogOptions).one("dialogopen", function () {
      var element  = $(dp.template.html).appendTo(dialog);
      var viewer   = new dp.createDataPreview(element, columns, data);
      var apiKey   = $.cookie('ckan_apikey');

      // Load chart data from the webstore.
      viewer.editor.loading();
      preview.datasetRequest.success(function () {
        var charts = preview.charts;

        // Load the first chart in the object until the editor supports
        // loading multiple charts.
        for (var key in charts) {
          if (charts.hasOwnProperty(key)) {
            viewer.editor.load(charts[key]).el.submit();
            viewer.nav.toggle('chart');
            viewer.chart.redraw();
            break;
          }
        }

        viewer.editor.loading(false);
        if (!apiKey) {
          viewer.editor.disableSave();
        }
      }).error(function () {
        // Could not contact API, disable saving.
        viewer.editor.loading(false).disableSave();
      });

      // Save chart data to the webstore.
      viewer.editor.bind('save', function (chart) {
        viewer.editor.saving();
        dp.updateResourceChart(preview, chart, apiKey, function () {
          viewer.editor.saving(false);
        });
      });

      dialog.bind("dialogresizestop.data-preview", viewer.redraw);

      // Remove bindings when dialog is closed.
      dialog.bind("dialogbeforeclose", function () {
        dialog.unbind(".data-preview");
      });
    });
  };

  // Public: Sets up the dialog for displaying a full screen of data.
  //
  // preview - A preview object containing resource data.
  //
  // Returns nothing.
  //
  dp.setupFullscreenDialog = function (preview) {
    var dialog = dp.$dialog, $window = $(window), timer;

    dialog.empty().dialog('option', 'title', 'Preview: ' + preview.source);

    // Ensure the lightbox always fills the screen.
    $window.bind('resize.data-preview', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        dialog.dialog('option', {
          width:  $window.width()  - 20,
          height: $window.height() - 20
        });
        dialog.trigger('dialogresizestop');
      }, 100);
    });

    dialog.bind("dialogbeforeclose", function () {
      $window.unbind("resize.data-preview");
    });
  }

  // Public: Displays a smaller alert style dialog with an error message.
  //
  // error - An error object to display.
  //
  // Returns nothing.
  //
  dp.showError = function (error) {
    var _html = '<strong>' + $.trim(error.title) + '</strong><br />' + $.trim(error.message);
    dp.$dialog.html(_html).dialog(dp.errorDialogOptions);
  };

  // Public: Displays the datapreview UI in a fullscreen dialog.
  //
  // This method also parses the data returned by the webstore for use in
  // the data preview UI.
  //
  // preview - A preview object containing resource data.
  // data    - An object of parsed CSV data returned by the webstore.
  //
  // Returns nothing.
  //
  dp.showData = function(preview, data) {
    dp.setupFullscreenDialog(preview);

    if(data.error) {
      return dp.showError(data.error);
    }
    var tabular = dp.convertData(data);

    dp.loadDataPreview(preview, tabular.columns, tabular.data);
  };

  // **Public: parse data from webstore or other source into form for data
  // preview UI**
  //
  // :param data: An object of parsed CSV data returned by the webstore.
  //
  // :return: parsed data.
  //
  dp.convertData = function(data) {
    var tabular = {
      columns: [],
      data: []
    };
    isNumericRegex = (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/);

    // two types of data: that from webstore and that from jsonpdataproxy
    // if fields then from dataproxy
    if (data.fields) {
      tabular.columns = $.map(data.fields || [], function (column, i) {
        return {id: 'header-' + i, name: column, field: 'column-' + i, sortable: true};
      });

      tabular.data = $.map(data.data || [], function (row, id) {
        var cells = {id: id};
        for (var i = 0, c = row.length; i < c; i++) {
          var isNumeric = isNumericRegex.test(row[i]);
          cells['column-' + i] = isNumeric ? parseFloat(row[i]) : row[i];
        }
        return cells;
      });
    } else {
      if (data.length) {
        tabular.columns = $.map(data[0], function(val, key) {
          return {id: 'header-' + key, name: key, field: 'column-' + key, sortable: true};
        });
        tabular.data = $.map(data, function(row, id) {
          var cells = {id: id};
          for(i in tabular.columns) {
            var val = row[tabular.columns[i].name];
            var isNumeric = isNumericRegex.test(val);
            cells['column-' + tabular.columns[i].name] = isNumeric ? parseFloat(val) : val;
          }
          return cells;
        });
      }
    }
    return tabular;
  };

  // Public: Displays a String of data in a fullscreen dialog.
  //
  // preview - A preview object containing resource data.
  // data    - An object of parsed CSV data returned by the webstore.
  //
  // Returns nothing.
  //
  dp.showPlainTextData = function(preview, data) {
    dp.setupFullscreenDialog(preview);

    if(data.error) {
      dp.showError(data.error);
    } else {
      var content = $('<pre></pre>');
      for (var i=0; i<data.data.length; i++) {
        var row = data.data[i].join(',') + '\n';
        content.append(dp.escapeHTML(row));
      }
      dp.$dialog.dialog('option', dp.dialogOptions).append(content);
    }
  };

  // Public: Displays a fullscreen dialog with the url in an iframe.
  //
  // url - The URL to load into an iframe.
  //
  // Returns nothing.
  //
  dp.showHtml = function(url) {
    dp.$dialog.empty();
    dp.$dialog.dialog('option', 'title', 'Preview: ' + url);
    var el = $('<iframe></iframe>');
    el.attr('src', url);
    el.attr('width', '100%');
    el.attr('height', '100%');
    dp.$dialog.append(el).dialog('open');;
  };

  // Public: Loads a data preview dialog for a preview button.
  //
  // Fetches the preview data object from the link provided and loads the
  // parsed data from the webstore displaying it in the most appropriate
  // manner.
  //
  // link - An anchor Element.
  //
  // Returns nothing.
  //
  dp.loadPreviewDialog = function(link) {
    var preview  = $(link).data('preview');
    preview.url  = dp.normalizeUrl(link.href);
    preview.type = dp.normalizeFormat(preview.format);

    function callbackWrapper(callback) {
      return function () {
        var context = this, args = arguments;

        preview.datasetRequest.complete(function () {
          dp.loadDependancies(function () {
            $(link).removeClass('resource-preview-loading').text('Preview');
            callback.apply(context, args);
            dp.$dialog.dialog('open');
          });
        });
      };
    }

    $(link).addClass('resource-preview-loading').text('Loading');

    if (preview.type === '') {
      var tmp = preview.url.split('/');
      tmp = tmp[tmp.length - 1];
      tmp = tmp.split('?'); // query strings
      tmp = tmp[0];
      var ext = tmp.split('.');
      if (ext.length > 1) {
        preview.type = ext[ext.length-1];
      }
    }

    if (preview.type in {'csv': '', 'xls': ''}) {
      dp.getResourceDataDirect(preview, callbackWrapper(dp.showData));
    }
    else if (preview.type in {
        'rdf+xml': '',
        'owl+xml': '',
        'xml': '',
        'n3': '',
        'n-triples': '',
        'turtle': '',
        'plain': '',
        'atom': '',
        'tsv': '',
        'rss': '',
        'txt': ''
        }) {
      // treat as plain text
      dp.getResourceDataDirect(preview, callbackWrapper(dp.showPlainTextData));
    }
    else {
      // very hacky but should work
      callbackWrapper(dp.showHtml)(preview.url);
    }
  };

  // Public: Creates the base UI for the plugin.
  //
  // Adds an additonal preview column to the resources table in the CKAN
  // UI. Also requests the package from the api to see if there is any chart
  // data stored and updates the preview icons accordingly.
  //
  // resources - The resources table wrapped in jQuery.
  //
  // Returns nothing.
  //
  dp.createPreviewButtons = function(resources) {
    resources.find('tr:first th:first').before($('<th class="preview">Preview</th>'));
    // :param resources: resource section div or table.
    resources.find('tr td:first-child').each(function(idx, element) {
      var element = $(element);
      var _format = $.trim(element.next().text());

      var preview = $('<td class="preview"></td>').prependTo(element.parent());

      // do not create previews for some items
      var _tformat = _format.toLowerCase();
      if (
        _tformat.indexOf('zip') != -1
        ||
        _tformat.indexOf('tgz') != -1
        ||
        _tformat.indexOf('targz') != -1
        ||
        _tformat.indexOf('gzip') != -1
        ||
        _tformat.indexOf('gz:') != -1
        ||
        _tformat.indexOf('word') != -1
        ||
        _tformat.indexOf('pdf') != -1
        ||
        _tformat === 'other'
        )
      {
        return;
      }

      // can not preview if hash value doesn't exist
      var _hash = $.trim(element.siblings().last().text());
      if (_hash === '') {
          return;
      }

      // TODO: add ability to change the limit in this url
      var _url = dp.webstore + "/" + _hash + "/resource.jsonp?_limit=30";

      // The API enpoint for the current package.
      var _datasetUri = $('.api code:first a').attr('href');

      // An object that holds information about the currently previewed data.
      var _preview = {
        'source': element.find('a').attr('href'),
        'format': _format,
        'hash': _hash,
        'dataset-uri': _datasetUri
      };

      var _previewSpan = $('<a />', {
        text: 'Preview',
        href: _url,
        click: function(e) {
          e.preventDefault();
          dp.loadPreviewDialog(e.target);
        },
        'class': 'resource-preview-button'
      }).data('preview', _preview).appendTo(preview);

      // Request representation from the API.
      _preview.datasetRequest = dp.getResourceDataset(_datasetUri, function (dataset) {
        var resource = dp.getResourceFromDataset(_preview.hash, dataset),
            chartString, charts = {};

        if (resource) {
          chartString = resource[dp.resourceChartKey];
          if (chartString) {
            try {
              charts = $.parseJSON(chartString);

              // If parsing succeeds add a class to the preview button.
              _previewSpan.addClass('resource-preview-chart');
            } catch (e) {}
          }
        }

        _preview.dataset = dataset;
        _preview.resource = resource;
        _preview.charts = charts;
      });
    });
  };

  // Public: Kickstarts the plugin.
  //
  // webstoreUrl - URL string for the webstore to use.
  // dialogId    - The id of the dialog Element in the page.
  // options     - An object containing aditional options.
  //               timeout: Time in seconds to wait for a JSONP timeout.
  //
  // Examples
  //
  //   var url = 'http://test-webstore.ckan.net/okfn';
  //   dp.initialize(url, '#dialog', {timeout: 3000});
  //
  // Returns nothing.
  //
  dp.initialize = function(webstoreUrl, dialogId, options) {
    dp.$dialog = $('#' + dialogId);
    options = options || {};

    dp.timeout = options.timeout || dp.timeout;
    dp.webstore = webstoreUrl;

    var _height = Math.round($(window).height() * 0.6);

    // Large stylable dialog for displaying data.
    dp.dialogOptions = {
      autoOpen: false,
      // does not seem to work for width ...
      position: ['center', 'center'],
      buttons: [],
      width:  $(window).width()  - 20,
      height: $(window).height() - 20,
      resize: 'auto',
      modal: false,
      draggable: true,
      resizable: true
    };

    // Smaller alert style dialog for error messages.
    dp.errorDialogOptions = {
      title: 'Unable to Preview - Had an error from dataproxy',
      position: ['center', 'center'],
      buttons: [{
        text: "OK",
        click: function () { $(this).dialog("close"); }
      }],
      width: 360,
      height: 180,
      resizable: false,
      draggable: false,
      modal: true,
      position: 'fixed'
    };

    dp.createPreviewButtons($('.resources'));
  };

  // Export the CKANEXT object onto the window.
  $.extend(true, window, {CKANEXT: {}});
  CKANEXT.DATAPREVIEW = dp;

})(jQuery);
