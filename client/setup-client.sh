#!/bin/bash

echo "📦 Installing client dependencies..."

# Core React dependencies
npm install react@^18.2.0 react-dom@^18.2.0 react-scripts@5.0.1

# Routing and HTTP
npm install react-router-dom@^6.20.1 axios@^1.6.2

# UI Components
npm install react-hot-toast@^2.4.1 react-icons@^4.12.0 @headlessui/react@^1.7.17

# Date and Charts
npm install date-fns@^2.30.0 recharts@^2.10.3

# Maps
npm install leaflet@^1.9.4 react-leaflet@^4.2.1

# Forms
npm install formik@^2.4.5 yup@^1.3.3

# Dev dependencies (Tailwind)
npm install -D tailwindcss@^3.3.6 postcss@^8.4.32 autoprefixer@^10.4.16

# Initialize Tailwind
npx tailwindcss init -p

echo "✅ Client setup complete!"
echo "⚠️  Don't forget to configure tailwind.config.js and create src/index.css"