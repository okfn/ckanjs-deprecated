var CKAN = CKAN || {};

CKAN.Templates = {
  datasetSummary: '  \
  <li class="dataset summary" dataset-id="${dataset.id}"> \
    <div class="header"> \
      <span class="title" > \
        <a href="${dataset.ckan_url}" ckan-attrname="title" class="editable">${dataset.displaytitle}</a> \
      </span> \
      <div class="search_meta"> \
        {{if dataset.resources.length}} \
        <ul class="dataset-formats"> \
          {{each dataset.resources}} \
            <li>${$value.format}</li> \
          {{/each}} \
        </ul> \
        {{/if}} \
      </div> \
    </div> \
    <div class="extract editable-area"> \
      {{html dataset.snippet}} \
    </div> \
    <div class="dataset-tags"> \
      {{if dataset.tags.length}} \
      <ul class="dataset-tags"> \
        {{each dataset.tags}} \
          <li>${$value}</li> \
        {{/each}} \
      </ul> \
      {{/if}} \
    </div> \
    <ul class="actions"> \
      <li> \
        <a href="${urls.datasetView}" class="more"> \
          More &raquo;</a> \
      </li> \
      <li> \
        <a href="${urls.datasetEdit}">Edit &raquo;</a> \
      </li> \
    </ul> \
  </li> \
  ',

  minorNavigationDataset: ' \
    <ul class="tabbed"> \
      <li><a href="#dataset/${dataset.id}/view">View</a></li> \
      <li><a href="#dataset/${dataset.id}/edit">Edit</a></li> \
    </ul> \
    '
};
