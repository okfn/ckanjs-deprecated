CKAN.Templates.resourceUpload = ' \
<div class="fileupload"> \
  <form action="http://test-ckan-net-storage.commondatastorage.googleapis.com/" class="resource-upload" \
    enctype="multipart/form-data" \
    method="POST"> \
 \
    <div class="fileupload-buttonbar"> \
      <div class="hidden-inputs"></div> \
      <label class="fileinput-button"> \
        File \
      </label> \
      <input type="file" name="file" /> \
      <span class="fileinfo"></span> \
      <input type="submit" value="upload" /> \
    </div> \
  </form> \
  <div class="messages" style="display: none;"></div> \
</div> \
';

