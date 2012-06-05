var CKAN = CKAN || {};
CKAN.View = CKAN.View || {};

(function(my, $) {

my.GroupSummaryList = Backbone.View.extend({
  className: 'groups list',

  template: '\
    {{#groups}} \
    <div class="span4"> \
      <div class="well group summary"> \
        <h3> \
          {{title}} \
        </h3> \
        <p>{{snippet}}</p> \
        <span class="dataset-count">Datasets {{dataset_count}}</span> \
      </div> \
    </div> \
    {{/groups}} \
  ',

  initialize: function() {
    this.el = $(this.el);
    _.bindAll(this, 'render');
    this.collection.bind('change', this.render);
  },

  render: function() {
    var tmplData = {
      groups: this.collection.map(function(x) { return x.toTemplateJSON()})
    };
    var html = Mustache.render(this.template, tmplData);
    this.el.html(html);
  }
});

}(CKAN.View, jQuery));

