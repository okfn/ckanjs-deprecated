var CKAN = CKAN || {};

CKAN.Templates = {
  datasetSummary: '  \
  <li class="dataset" dataset-id="${dataset.id}"> \
    <div class="header"> \
      <span class="title" > \
        <a href="${domain}${dataset.ckan_url}" ckan-attrname="title" class="editable">${dataset.displaytitle}</a> \
      </span> \
      <div class="search_meta"> \
        {{if dataset.resources.length}} \
        <ul class="dataset_formats"> \
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

  datasetFull: ' \
  <div class="dataset" dataset-id="${dataset.id}"> \
    <div>Permalink: <a href="${domain}${dataset.ckan_url}">${domain}${dataset.ckan_url}</a></div> \
    <div class="extract editable-area"> \
      {{html dataset.notesHtml}} \
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
    <div class="resources subsection"> \
    {{if dataset.resources.length }} \
      <h3>Downloads &amp; Resources</h3> \
      <table> \
        <tr> \
          <th>Description</th> \
          <th>Format</th> \
          <th>Hash</th> \
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
  </div> \
  ',

  datasetForm: ' \
  <form class="dataset" action="" method="POST"> \
  <fieldset> \
    <legend> \
      <h3>Basics</h3> \
    </legend> \
    <dl> \
      <dt> \
        <label class="field_opt" for="dataset--title"> \
          Title * \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--title" name="Dataset--title" type="text" value="${title}" placeholder="A title (not a description) ..."/> \
      </dd> \
 \
      <dt> \
        <label class="field_req" for="Dataset--name"> \
          Slug * \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--name" maxlength="100" name="Dataset--name" type="text" value="${name}" placeholder="A shortish name usable in urls ..." /> \
        <img src="img/help.png" \
          class="help" \
          title="A unique lowercase name for the dataset for use in urls and therefore only containing alphanumeric characters plus - and _" \
          > \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--url"> \
          Home Page \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--url" name="Dataset--url" type="text" value="${url}" placeholder="http://mydataset.com/about/" /> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--license_id"> \
          Licence \
        </label> \
      </dt> \
      <dd> \
        <select id="Dataset--license_id" name="Dataset--license_id"> \
          <option selected="selected" value=""></option> \
          <option value="notspecified">Other::License Not Specified</option> \
        </select> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--notes"> \
          Description and Notes \
        </label> \
        You can use <a href="http://daringfireball.net/projects/markdown/syntax">Markdown formatting</a> \
      </dt> \
      <dd> \
        <div class="previewable-textarea"> \
          <ul class="tabs"> \
            <li><a href="#" action="write" class="selected">Write</a></li> \
            <li><a href="#" action="preview">Preview</a></li> \
          </ul> \
          <textarea id="Dataset--notes" name="Dataset--notes" placeholder="Start with a summary sentence ...">${notes}</textarea> \
          <div id="Dataset--notes-preview" class="preview" style="display: none;"> \
          <div> \
        </div> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Dataset--tags"> \
          Tags \
        </label> \
      </dt> \
      <dd> \
        <input class="tagComplete" data-tagcomplete-queryparam="incomplete" data-tagcomplete-url="/api/2/util/tag/autocomplete" id="Dataset--tags" name="Dataset--tags" type="text" value="${tags}" placeholder="e.g. pollution rivers water-quality" /> \
      </dd> \
    </dl> \
  </fieldset> \
 \
    <div class="submit"> \
      <input id="save" name="save" type="submit" value="Save" /> \
    </div> \
    <p class="hints"> \
    <strong>Important:</strong> By submitting content, you agree to release your contributions \
      under the open license specified on the <a href="http://ckan.net/license">license page</a>. Please <strong>refrain</strong> from editing if you are <strong>not</strong> happy to do this. \
    </p> \
  </form> \
  ',

  resourceForm: ' \
  <h2>Add a Resource (File, API, ...)</h2> \
  <form class="resource" action="" method="POST"> \
    <dl> \
      <dt> \
        <label class="field_opt" for="Resource--url"> \
          Resource URL \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--url" name="Resource--url" type="text" value="${url}" placeholder="http://mydataset.com/file.csv" /> \
      </dd> \
    </dl> \
 \
  <fieldset> \
    <legend> \
      <h3>A Bit More Info</h3> \
    </legend> \
    <dl> \
      <dt> \
        <label class="field_opt" for="Resource--description"> \
          Description \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--description" name="Resource--description" type="text" value="${description}" placeholder="A short description ..."/> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Resource--kind"> \
          Kind \
        </label> \
      </dt> \
      <dd> \
        <select id="Resource--license_id" name="Resource--license_id"> \
          <option selected="selected" value="file">File</option> \
          <option value="api">API</option> \
          <option value="index">Index</option> \
          <option value="example">Example</option> \
        </select> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Resource--format"> \
          Format \
        </label> \
      </dt> \
      <dd> \
        <input id="Resource--format" name="Resource--format" type="text" value="${format}" placeholder="e.g. csv, zip:csv (zipped csv), sparql"/> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Resource--license_id"> \
          Licence \
        </label> \
      </dt> \
      <dd> \
        <select id="Resource--license_id" name="Resource--license_id"> \
          <option selected="selected" value=""></option> \
          <option value="notspecified">Other::License Not Specified</option> \
        </select> \
      </dd> \
  </fieldset> \
 \
    <div class="submit"> \
      <input id="save" name="save" type="submit" value="Save" /> \
    </div> \
    <p class="hints"> \
    <strong>Important:</strong> By submitting content, you agree to release your contributions \
      under the open license specified on the <a href="http://ckan.net/license">license page</a>. Please <strong>refrain</strong> from editing if you are <strong>not</strong> happy to do this. \
    </p> \
  </form> \
  ',
  lightbox: '\
  <h1>Lightbox Content Title</h1>\
  <div class="container"></div> \
  <a class="close">Close</a> \
  '
};
