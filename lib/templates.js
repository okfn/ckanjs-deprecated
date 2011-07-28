var CKAN = CKAN || {};

CKAN.Templates = {
  datasetSummary: '  \
  <li class="dataset summary" dataset-id="${dataset.id}"> \
    <div class="header"> \
      <span class="title" > \
        <a href="${domain}${dataset.ckan_url}" ckan-attrname="title" class="editable">${dataset.displaytitle}</a> \
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

  minorNavigationDataset: ' \
    <ul class="tabbed"> \
      <li><a href="#view">View</a></li> \
      <li><a href="#edit">Edit</a></li> \
      <li><a href="#history">History</a></li> \
      <li><a href="#subscribe">Subscribe</a></li> \
    </ul> \
    '
};
