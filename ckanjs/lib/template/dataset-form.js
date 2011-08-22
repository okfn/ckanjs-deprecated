CKAN.Templates.datasetForm = ' \
  <form class="dataset" action="" method="POST"> \
    <dl> \
      <dt> \
        <label class="field_opt" for="dataset--title"> \
          Title * \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--title" name="Dataset--title" type="text" value="${dataset.title}" placeholder="A title (not a description) ..."/> \
      </dd> \
 \
      <dt> \
        <label class="field_req" for="Dataset--name"> \
          Name * \
          <span class="hints"> \
            A short unique name for the dataset - used in urls and restricted to [a-z] -_ \
          </span> \
        </label> \
      </dt> \
      <dd> \
        <input id="Dataset--name" maxlength="100" name="Dataset--name" type="text" value="${dataset.name}" placeholder="A shortish name usable in urls ..." /> \
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
          <span class="hints"> \
            (You can use <a href="http://daringfireball.net/projects/markdown/syntax">Markdown formatting</a>) \
          </span> \
        </label> \
      </dt> \
      <dd> \
        <div class="previewable-textarea"> \
          <ul class="tabs"> \
            <li><a href="#" action="write" class="selected">Write</a></li> \
            <li><a href="#" action="preview">Preview</a></li> \
          </ul> \
          <textarea id="Dataset--notes" name="Dataset--notes" placeholder="Start with a summary sentence ...">${dataset.notes}</textarea> \
          <div id="Dataset--notes-preview" class="preview" style="display: none;"> \
          <div> \
        </div> \
      </dd> \
    </dl> \
 \
    <div class="submit"> \
      <input id="save" name="save" type="submit" value="Save" /> \
    </div> \
  </form> \
';

CKAN.Templates.datasetFormSidebar = ' \
  <div class="dataset-form-navigation"> \
    <ul> \
      <li> \
        <a href="#basics" class="selected">Basics</a> \
      </li> \
      <li> \
        <a href="#data">The Data</a> \
      </li> \
      <li> \
        <a href="#additional"> \
          Additional Information \
        </a> \
      </li> \
    </ul> \
  </div> \
';
