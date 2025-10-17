# Resize Images Extension - Reconfigure Notes

Bucket name must be the GCS bucket name, not the public domain.

Current correct value
- IMG_BUCKET: fire-new-globul.appspot.com

How to reconfigure
1. Open Firebase Console > Extensions > storage-resize-images
2. Click "Manage" > "Reconfigure"
3. Set IMG_BUCKET to fire-new-globul.appspot.com
4. Review other params (sizes, paths) and save

Optional paths
- INCLUDE_PATH_LIST: cars/, users/
- RESIZED_IMAGES_PATH: thumbs/

Verification
- Upload an image to a matching path
- Confirm the resized images are created under the expected output path
