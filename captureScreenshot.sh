#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to get the name of the currently booted simulator
get_simulator_name() {
    xcrun simctl list devices --json | jq -r '.devices | .[] | .[] | select(.state == "Booted") | .name'
}

# Get the simulator name
SIMULATOR_NAME=$(get_simulator_name)

# Check if a simulator is booted
if [ -z "$SIMULATOR_NAME" ]; then
    echo "Error: No simulator is currently booted."
    exit 1
fi

# Define the output directory as the current directory
OUTPUT_DIR="."

# Sanitize the simulator name for a valid filename (replace spaces and special chars)
# This converts "iPhone 15 Pro Max" to "iPhone_15_Pro_Max"
SANITIZED_SIMULATOR_NAME=$(echo "$SIMULATOR_NAME" | sed 's/[^a-zA-Z0-9._-]/_/g')

# Define the full path for the screenshot file
SCREENSHOT_PATH="${OUTPUT_DIR}/${SANITIZED_SIMULATOR_NAME}.png"

echo "Capturing screenshot of: $SIMULATOR_NAME"
echo "Saving to: $SCREENSHOT_PATH"

# Capture the screenshot
if xcrun simctl io booted screenshot "$SCREENSHOT_PATH"; then
    echo "Screenshot captured successfully!"
else
    echo "Error: Failed to capture screenshot. Make sure the simulator is visible and active."
    exit 1
fi

if [[ "$SIMULATOR_NAME" == *"iPhone"* ]]; then
    AI_SCRIPT="$SCRIPT_DIR/screenshotToIllustratoriPhone.js"
else
    AI_SCRIPT="$SCRIPT_DIR/screenshotToIllustratorIPad.js"
fi

echo "🎨 Running Illustrator script: $(basename "$AI_SCRIPT")"
osascript -e "tell application \"Adobe Illustrator\" to do javascript POSIX file \"$AI_SCRIPT\""