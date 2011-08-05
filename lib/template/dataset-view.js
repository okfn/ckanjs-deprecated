CKAN.Templates.datasetView = ' \
  <div class="dataset view" dataset-id="${dataset.id}"> \
    <div class="extract"> \
      ${dataset.snippet} \
      {{if dataset.snippet.length > 50}} \
      <a href="#anchor-notes">Read more</a> \
      {{/if}} \
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
      <h3>Resources</h3> \
      <table> \
        <tr> \
          <th>Description</th> \
          <th>Format</th> \
          <th>Actions</th> \
        </tr> \
        {{each dataset.resources}} \
        <tr> \
          <td> \
            <a href="#dataset/${dataset.id}/resource/${$value.id}"> \
            {{if $value.description}} \
            ${$value.description} \
            {{else}} \
            (No description) \
            {{/if}} \
            </a> \
          </td> \
          <td>${$value.format}</td> \
          <td><a href="${$value.url}" target="_blank" class="resource-download">Download</a> \
        </tr> \
        {{/each}} \
        {{if !dataset.resources.length }} \
        <tr><td>No resources.</td><td></td></tr> \
        {{/if}} \
      </table> \
      <div class="add-resource"> \
        <a href="#" class="action-add-resource">Add a resource</a> \
        <div class="add-resource-form"></div> \
      </div> \
    </div> \
    <div class="notes subsection"> \
      <h3 id="anchor-notes">Notes</h3> \
      <div class="notes-body"> \
        {{html dataset.notesHtml}} \
        {{if !dataset.notes || dataset.notes.length === 0}} \
        <em>No notes yet. Click to add some ...</em> \
        {{/if}} \
      </div> \
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
          ${$value.type} dataset \
          <a href="#dataset/${$value.object}/view">${$value.object}</a> \
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
