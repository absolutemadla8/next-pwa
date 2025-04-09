#!/bin/bash

# Function to capitalize first letter
capitalize() {
  echo "$(tr '[:lower:]' '[:upper:]' <<< ${1:0:1})${1:1}"
}

# Input validation
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <sheet-name> [layout-file]"
  echo "Example: $0 mySheet /Users/mukulsharma/often-travel/next-pwa/app/trippy/layout.tsx"
  exit 1
fi

# Get the sheet name and layout file
SHEET_NAME=$1
SHEET_ID=$(echo "$SHEET_NAME" | tr '[:upper:]' '[:lower:]')
SHEET_NAME_CAPITALIZED=$(capitalize "$SHEET_NAME")
LAYOUT_FILE=${2:-"/Users/mukulsharma/often-travel/next-pwa/app/trippy/layout.tsx"}

echo "Creating bottom sheet: $SHEET_NAME_CAPITALIZED with ID: $SHEET_ID"

# Update bottom sheet store
STORE_FILE="/Users/mukulsharma/often-travel/next-pwa/app/store/bottomSheetStore.tsx"
echo "Updating store file: $STORE_FILE"

# Add the new sheet ID to the BottomSheetId type
sed -i '' "s/type BottomSheetId = 'dateRange' | 'search' | 'roomConfig' | 'error' | 'passportExpiry' | 'amenities' | 'policies' | 'filter'/type BottomSheetId = 'dateRange' | 'search' | 'roomConfig' | 'error' | 'passportExpiry' | 'amenities' | 'policies' | 'filter' | '$SHEET_ID'/g" "$STORE_FILE"

# Create the new bottom sheet component
COMPONENT_DIR="/Users/mukulsharma/often-travel/next-pwa/app/components/$SHEET_NAME"
COMPONENT_FILE="$COMPONENT_DIR/${SHEET_NAME_CAPITALIZED}BottomSheet.tsx"

# Create the directory if it doesn't exist
mkdir -p "$COMPONENT_DIR"

echo "Creating component file: $COMPONENT_FILE"

# Create the new component file
cat > "$COMPONENT_FILE" << EOF
'use client';

import React from 'react';

interface ${SHEET_NAME_CAPITALIZED}BottomSheetProps {
  // Add your props here
}

const ${SHEET_NAME_CAPITALIZED}BottomSheet: React.FC<${SHEET_NAME_CAPITALIZED}BottomSheetProps> = ({
  // Destructure your props here
}) => {
  return (
    <div className="px-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        ${SHEET_NAME_CAPITALIZED} Content
      </h3>
      
      {/* Add your content here */}
      <div className="py-4">
        <p className="text-gray-600">
          This is the ${SHEET_NAME_CAPITALIZED} bottom sheet content.
        </p>
      </div>
    </div>
  );
};

export default ${SHEET_NAME_CAPITALIZED}BottomSheet;
EOF

# Update the layout file to import and use the new component
echo "Updating layout file: $LAYOUT_FILE"

# Add the import
sed -i '' "/import useBottomSheetStore from/a\\
import ${SHEET_NAME_CAPITALIZED}BottomSheet from '../components/${SHEET_NAME}/${SHEET_NAME_CAPITALIZED}BottomSheet';" "$LAYOUT_FILE"

# Add the component at the end of the bottom sheets section
cat >> "$LAYOUT_FILE" << EOF

      {/* ${SHEET_NAME_CAPITALIZED} Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === '${SHEET_ID}'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <${SHEET_NAME_CAPITALIZED}BottomSheet />
      </BottomSheet>
EOF

# Make the script executable
chmod +x create-bottom-sheet.sh

echo "✅ Bottom sheet '${SHEET_NAME_CAPITALIZED}' created successfully!"
echo ""
echo "To use the bottom sheet, call:"
echo "useBottomSheetStore().openSheet('${SHEET_ID}', { title: '${SHEET_NAME_CAPITALIZED}', minHeight: '50vh', maxHeight: '90vh' });"
echo ""
echo "Or from non-React context:"
echo "bottomSheetStore.openSheet('${SHEET_ID}', { title: '${SHEET_NAME_CAPITALIZED}', minHeight: '50vh', maxHeight: '90vh' });"