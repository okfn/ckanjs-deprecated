CKAN.Templates.datasetForm = ' \
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
';


