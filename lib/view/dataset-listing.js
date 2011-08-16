this.CKAN || (this.CKAN = {});
this.CKAN.View || (this.CKAN.View = {});

(function (CKAN, $, _, Backbone, undefined) {
  CKAN.View.DatasetListing = Backbone.View.extend({
    tagName: 'ul',

    constructor: function DatasetListing() {
      Backbone.View.prototype.constructor.apply(this, arguments);

      _.bindAll(this, 'addItem', 'removeItem');

      this.el = $(this.el);
      this.setCollection(this.collection);
    },

    setCollection: function (collection) {
      if (this.collection) {
        this.collection.unbind('add', this.addItem);
        this.collection.unbind('remove', this.removeItem);
      }

      this.collection = collection;
      if (collection) {
        this.collection.bind('add', this.addItem);
        this.collection.bind('remove', this.removeItem);
      }
      return this.render();
    },

    addItem: function (model) {
      var view = new CKAN.View.DatasetListingItem({
        domian: this.options.domain,
        model: model
      });
      this.el.data(model.cid, view).append(view.render().el);
      return this;
    },

    removeItem: function (model) {
      var view = this.el.data(model.cid);
      if (view) {
        view.remove();
      }
      return this;
    },

    render: function () {
      this.el.empty();
      if (this.collection) {
        this.collection.each(this.addItem);
      }
      return this;
    },

    remove: function () {
      this.setCollection(null);
      return Backbone.View.prototype.remove.apply(this, arguments);
    }
  });
  
  CKAN.View.DatasetListingItem = Backbone.View.extend({
    tagName: 'li',

    className: 'dataset summary',

    options: {
      template: '\
        <div class="header"> \
          <span class="title" > \
            <a href="${urls.datasetView}" ckan-attrname="title" class="editable">${displaytitle}</a> \
          </span> \
          <div class="search_meta"> \
            {{if formats.length > 0}} \
            <ul class="dataset-formats"> \
              {{each formats}} \
                <li>${$value}</li> \
              {{/each}} \
            </ul> \
            {{/if}} \
          </div> \
        </div> \
        <div class="extract editable-area"> \
          {{html snippet}} \
        </div> \
        <div class="dataset-tags"> \
          {{if tags.length}} \
          <ul class="dataset-tags"> \
            {{each tags}} \
              <li>${$value}</li> \
            {{/each}} \
          </ul> \
          {{/if}} \
        </div> \
      '
    },

    constructor: function DatasetListingItem() {
      Backbone.View.prototype.constructor.apply(this, arguments);
      this.el = $(this.el);
    },

    render: function () {
      var dataset = this.model.toTemplateJSON();
      // if 'UI' mode ...
      var urls = {};
      if (CKAN.UI && CKAN.UI.workspace) {
        urls.datasetView = CKAN.UI.workspace.url('dataset', 'view', this.model.id);
      } else {
        urls.datasetView = dataset.ckan_url;
      }
      var data = _.extend(dataset, {
        dataset: dataset,
        formats: this._availableFormats(),
        urls: urls
      });
      this.el.html($.tmpl(this.options.template, data));
      return this;
    },

    _availableFormats: function () {
      var formats = this.model.get('resources').map(function (resource) {
        return resource.get('format');
      });
      return _.uniq(_.compact(formats));
    }
  });
})(CKAN, $, _, Backbone, undefined);
