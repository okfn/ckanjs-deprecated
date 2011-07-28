CKAN.Templates.datasetFull = ' \
  <div class="dataset view" dataset-id="${dataset.id}"> \
    <div class="extract"> \
      {{html dataset.snippet}} \
      <a href="#anchor-notes">Read more</a> \
    </div> \
    <div class="tags"> \
      {{if dataset.tags.length}} \
      <ul class="dataset-tags"> \
        {{each dataset.tags}} \
          <li>${$value}</li> \
        {{/each}} \
      </ul> \
      {{/if}} \
    </div> \
    <div class="resources subsection"> \
    {{if dataset.resources.length }} \
      <h3>Resources</h3> \
      <table> \
        <tr> \
          <th>Description</th> \
          <th>Format</th> \
        </tr> \
        {{each dataset.resources}} \
        <tr> \
          <td> \
            {{if $value.description}} \
            <a href="${$value.url}" target="_blank">${$value.description}</a> \
            {{else}} \
            <a href="${$value.url}" target="_blank">Download (no description)</a> \
            {{/if}} \
          </td> \
          <td>${$value.format}</td> \
        </tr> \
        {{/each}} \
      </table> \
    {{/if}} \
      <div class="add-resource"> \
        <a href="#" class="action-add-resource">Add a resource</a> \
        <div class="add-resource-form"></div> \
      </div> \
    </div> \
    <div class="notes subsection"> \
      <h3 id="anchor-notes">Notes</h3> \
      {{html dataset.notesHtml}} \
    </div> \
    <div class="details subsection"> \
      <h3>Additional Information</h3> \
      <table> \
        <thead> \
          <tr> \
            <th>Field</th> \
            <th>Value</th> \
          </tr> \
        </thead> \
        <tbody> \
          <tr> \
            <td>Creator</td> \
            <td>${dataset.author}</td> \
          </tr> \
          <tr> \
            <td>Maintainer</td> \
            <td>${dataset.maintainer}</td> \
          </tr> \
          {{each dataset.extras}} \
          <tr> \
            <td class="package-label" property="rdfs:label">${$index}</td> \
            <td class="package-details" property="rdf:value">${$value}</td> \
          </tr> \
          {{/each}} \
        </tbody> \
      </table> \
    </div> \
  </div> \
';

CKAN.Templates.sidebarDatasetView = ' \
    <li class="widget-container widget_text"> \
      <h3>Connections</h3> \
      <ul> \
        {{each dataset.relationships}} \
        <li> \
          <a href="...">${$value.package}</a> \
          {{if $value.comment}} \
          <span class="relationship_comment"> \
            (${$value.comment}) \
          </span> \
          {{/if}} \
        </li> \
        {{/each}} \
      </ul> \
      {{if dataset.relationships.length == 0}} \
      No connections to other datasets. \
      {{/if}} \
    </li> \
';
