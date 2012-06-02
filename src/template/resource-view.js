CKAN.Templates.resourceView = ' \
  <div class="resource view" resource-id="${resource.id}"> \
    <h3> \
      <a href="${resource.url}" class="url">${resource.url}</a> [${resource.format}] \
    </h3> \
    <div class="description"> \
      ${resource.description} \
    </div> \
    \
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
          {{each resourceDetails}} \
          <tr> \
            <td class="label">${$index}</td> \
            <td class="value">${$value}</td> \
          </tr> \
          {{/each}} \
        </tbody> \
      </table> \
    </div> \
  </div> \
';
