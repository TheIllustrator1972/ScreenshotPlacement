var doc = app.activeDocument;

// CONFIG
var layerName = "ACTIVE";
var groupName = "CONTAINER";
var placeholderName = "SCREENSHOT_PLACEHOLDER"; // Change this if your placeholder is named differently
var newImageFilename = "iPad_Pro_11-inch__M4_.png";

// Utility: Find a page item by name recursively
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

// Locate the script directory and file
var scriptFile = new File($.fileName);
var scriptFolder = scriptFile.parent;
var newImageFile = new File(scriptFolder + "/" + newImageFilename);

// Validate image file
if (!newImageFile.exists) {
  alert("Image file not found:\n" + newImageFile.fsName);
  throw new Error("Missing replacement image.");
}

// Find layer and group
var activeLayer = doc.layers.getByName(layerName);
var containerGroup = findPageItemByName(activeLayer, groupName);
if (!containerGroup || containerGroup.typename !== "GroupItem") {
  alert("Group 'CONTAINER' not found inside 'ACTIVE' layer.");
  throw new Error("Missing container group.");
}

// Find the old image placeholder
var oldItem = findPageItemByName(containerGroup, placeholderName);
if (!oldItem) {
  alert("Could not find placeholder: " + placeholderName);
  throw new Error("Placeholder not found.");
}

// Record size and position
var gb = oldItem.geometricBounds;
var oldWidth = gb[2] - gb[0];
var oldHeight = gb[1] - gb[3];

// Remove old image
oldItem.remove();

// Add new image (linked)
var newItem = doc.placedItems.add();
newItem.file = newImageFile;
newItem.name = placeholderName;

// Scale to match size
var newWidth = newItem.width;
var newHeight = newItem.height;
var scaleX = (oldWidth / newWidth) * 100;
var scaleY = (oldHeight / newHeight) * 100;
newItem.resize(scaleX, scaleY);

// Position to match
newItem.position = [gb[0], gb[1]];

// Move new item into the container group
newItem.move(containerGroup, ElementPlacement.PLACEATEND);

$.writeln(
  "✅ Replaced '" +
    placeholderName +
    "' inside 'CONTAINER' group in 'ACTIVE' layer."
);

("✅ iPad Screenshot placed successfully.");
