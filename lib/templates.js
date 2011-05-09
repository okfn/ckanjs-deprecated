var CKAN = CKAN || {};

CKAN.Templates = {
  packageSummary: '  \
  <li class="package" package-id="${package.id}"> \
    <div class="header"> \
      <span class="title" > \
        <a href="${package.ckan_url()}" ckan-attrname="title" class="editable">${package.displaytitle()}</a> \
      </span> \
      <div class="search_meta"> \
        {{if package.resources.length}} \
        <ul class="package_formats"> \
          {{each package.resources}} \
            <li>${$value.format}</li> \
          {{/each}} \
        </ul> \
        {{/if}} \
      </div> \
    </div> \
    <div class="extract editable-area"> \
      {{html package.snippet()}} \
    </div> \
    <div class="package-tags"> \
      {{if package.tags.length}} \
      <ul class="package-tags"> \
        {{each package.tags}} \
          <li>${$value}</li> \
        {{/each}} \
      </ul> \
      {{/if}} \
    </div> \
    <ul class="actions"> \
      <li> \
        <a href="${urls.packageView}"> \
          More &raquo;</a> \
      </li> \
      <li> \
        <a href="${urls.packageEdit}">Edit &raquo;</a> \
      </li> \
    </ul> \
  </li> \
  ',

  packageFull: ' \
  <div class="package" package-id="${package.id}"> \
    <h2 class="title" > \
      <a href="${package.ckan_url}" ckan-attrname="title" class="editable">${package.displaytitle}</a> \
    </h2> \
    <div class="extract editable-area"> \
      {{html package.notesHtml}} \
    </div> \
    <div class="package-tags"> \
      {{if package.tags.length}} \
      <ul class="package-tags"> \
        {{each package.tags}} \
          <li>${$value}</li> \
        {{/each}} \
      </ul> \
      {{/if}} \
    </div> \
  </div> \
  ',

  packageForm: ' \
  <form class="package" action="" method="POST"> \
  <fieldset> \
    <legend> \
      <h3>Basics</h3> \
    </legend> \
    <dl> \
      <dt> \
        <label class="field_opt" for="Package--title"> \
          Title \
        </label> \
      </dt> \
      <dd> \
        <input id="Package--title" name="Package--title" type="text" value="${title}" placeholder="A title (not a description) .."/> \
      </dd> \
 \
      <dt> \
        <label class="field_req" for="Package--name"> \
          Slug \
        </label> \
      </dt> \
      <dd> \
        <input id="Package--name" maxlength="100" name="Package--name" type="text" value="${name}" placeholder="A shortish name usable in urls ..." /> \
        <img src="img/help.png" \
          class="help" \
          title="A unique lowercase name for the package for use in urls and thefore only containing alphanumeric characters plus - and _" \
          > \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Package--url"> \
          Data Home Page \
        </label> \
      </dt> \
      <dd> \
        <input id="Package--url" name="Package--url" type="text" value="${url}" placeholder="http://mydataset.com/about/" /> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Package--license_id"> \
          Licence \
        </label> \
      </dt> \
      <dd> \
        <select id="Package--license_id" name="Package--license_id"> \
          <option selected="selected" value=""></option> \
          <option value="notspecified">Other::License Not Specified</option> \
        </select> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Package--notes"> \
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
          <textarea id="Package--notes" name="Package--notes" placeholder="Start with a summary sentence ...">${notes}</textarea> \
          <div id="Package--notes-preview" class="preview" style="display: none;"> \
          <div> \
        </div> \
      </dd> \
 \
      <dt> \
        <label class="field_opt" for="Package--tags"> \
          Tags \
        </label> \
      </dt> \
      <dd> \
        <input class="tagComplete" data-tagcomplete-queryparam="incomplete" data-tagcomplete-url="/api/2/util/tag/autocomplete" id="Package--tags" name="Package--tags" type="text" value="${tags}" placeholder="e.g. pollution rivers water-quality" /> \
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
          <option value="index">Index (or Listing)</option> \
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
  '
};
