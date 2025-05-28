#!/bin/bash

# Fix imports in all TypeScript/JavaScript files
echo "Fixing imports..."

# Fix component imports
find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i \
  -e "s|'@/components/|'@/app/components/|g" \
  -e 's|"@/components/|"@/app/components/|g' \
  -e "s|'@/lib/|'@/app/lib/|g" \
  -e 's|"@/lib/|"@/app/lib/|g' \
  -e "s|'@/hooks/|'@/app/hooks/|g" \
  -e 's|"@/hooks/|"@/app/hooks/|g' \
  -e "s|'@/utils/|'@/app/utils/|g" \
  -e 's|"@/utils/|"@/app/utils/|g' \
  {} +

# Fix types imports (these should stay as @/types)
find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i \
  -e "s|'@/app/types/|'@/app/types/|g" \
  -e 's|"@/app/types/|"@/app/types/|g' \
  {} +

echo "Import fixes completed!"