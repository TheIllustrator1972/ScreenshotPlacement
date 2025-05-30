var doc = app.activeDocument;
var clippingGroupName = "IMAGE_MASK";
var placeholderName = "SCREENSHOT_PLACEHOLDER";
var imageFileName = "iPhone_16_Pro.png";

// Utility to find a page item by name recursively
function findPageItemByName(container, name) {
  for (var i = 0; i < container.pageItems.length; i++) {
    var item = container.pageItems[i];
    if (item.name === name) return item;
    if (item.typename === "GroupItem") {
      var found = findPageItemByName(item, name);
      if (found) return found;
    }
  }
  return null;
}

// Get script folder and image file
var scriptFile = new File($.fileName);
var scriptFolder = scriptFile.parent;
var newImageFile = new File(scriptFolder + "/" + imageFileName);
if (!newImageFile.exists) {
  alert("Image file not found: " + newImageFile.fsName);
  throw new Error("Missing image file.");
}

// Find the clipping mask group
var clippingGroup = findPageItemByName(doc, clippingGroupName);
if (
  !clippingGroup ||
  !clippingGroup.clipped ||
  clippingGroup.typename !== "GroupItem"
) {
  alert("Clipping group '" + clippingGroupName + "' not found or invalid.");
  throw new Error("Invalid clipping group.");
}

// Find the old placeholder image inside that group
var oldItem = findPageItemByName(clippingGroup, placeholderName);
if (!oldItem) {
  alert("Could not find placeholder: " + placeholderName);
  throw new Error("Missing placeholder inside clipping group.");
}

// Record bounds to match size and position
var gb = oldItem.geometricBounds;
var oldWidth = gb[2] - gb[0];
var oldHeight = gb[1] - gb[3];

// Remove the old placeholder
oldItem.remove();

// Add the new linked image
var newItem = doc.placedItems.add();
newItem.file = newImageFile;
newItem.name = placeholderName;

// Scale the image to match the old dimensions
var newWidth = newItem.width;
var newHeight = newItem.height;
var scaleX = (oldWidth / newWidth) * 100;
var scaleY = (oldHeight / newHeight) * 100;
newItem.resize(scaleX, scaleY);

// Move it into the clipping group
newItem.move(clippingGroup, ElementPlacement.PLACEATEND);

// Set position to match the old one
newItem.position = [gb[0], gb[1]];

$.writeln(
  "✅ Replaced image '" +
    placeholderName +
    "' inside '" +
    clippingGroupName +
    "'"
);

("✅ iPhone Screenshot placed successfully.");
