#!/bin/bash

# Configuration
HOSTING_USER="vaultgua"
HOSTING_SERVER="panel.freehosting.com"
HOSTING_IP="195.201.179.80"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting deployment package creation for vaultguard.io..."

# Create a temporary directory
echo "📁 Creating temporary directory..."
mkdir -p temp_deploy
cd temp_deploy

# Create the index.php file that will serve as the entry point
echo "📝 Creating PHP entry point..."
cat > index.php << 'EOF'
<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for security
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: no-referrer-when-downgrade");

// Serve the static files
$request_uri = $_SERVER['REQUEST_URI'];
$file_path = __DIR__ . $request_uri;

if (file_exists($file_path) && !is_dir($file_path)) {
    // Set appropriate content type
    $ext = pathinfo($file_path, PATHINFO_EXTENSION);
    switch ($ext) {
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
    }
    
    // Set caching headers for static files
    header('Cache-Control: public, max-age=31536000');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    
    readfile($file_path);
    exit;
}

// If no file is found, serve the index.html for SPA routing
if (!file_exists($file_path) || is_dir($file_path)) {
    include __DIR__ . '/index.html';
}
EOF

# Copy all frontend files
echo "📂 Preparing frontend files..."
cd ../frontend
npm run build || {
    echo -e "${RED}❌ Frontend build failed. Please fix the TypeScript errors first.${NC}"
    cd ..
    rm -rf temp_deploy
    exit 1
}

cp -r dist/* ../temp_deploy/

# Create .htaccess for URL rewriting
echo "📝 Creating .htaccess configuration..."
cd ../temp_deploy
cat > .htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle API requests
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^api/(.*) http://localhost:3001/api/$1 [P,L]

# Handle WebSocket requests
RewriteCond %{REQUEST_URI} ^/socket.io/ [NC]
RewriteRule ^socket.io/(.*) http://localhost:3001/socket.io/$1 [P,L]

# Don't rewrite files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rewrite everything else to index.html for SPA routing
RewriteRule ^ index.php [L]

# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "no-referrer-when-downgrade"

# Compress text files
AddOutputFilterByType DEFLATE text/plain
AddOutputFilterByType DEFLATE text/html
AddOutputFilterByType DEFLATE text/xml
AddOutputFilterByType DEFLATE text/css
AddOutputFilterByType DEFLATE application/xml
AddOutputFilterByType DEFLATE application/xhtml+xml
AddOutputFilterByType DEFLATE application/javascript
AddOutputFilterByType DEFLATE application/x-javascript
EOF

# Create the deployment archive
echo "📦 Creating deployment archive..."
cd ..
tar -czf vaultguard-deploy.tar.gz temp_deploy/*
rm -rf temp_deploy

echo -e "${GREEN}✅ Deployment package created successfully: vaultguard-deploy.tar.gz${NC}"
echo "
🔷 Next steps:
1. Log in to ${HOSTING_SERVER}:2222/evo/
2. Go to File Manager
3. Extract vaultguard-deploy.tar.gz locally
4. Upload all files from the extracted archive to public_html:
   - index.php
   - .htaccess
   - All static files (assets, js, css)

📝 Important notes:
- Make sure PHP is enabled in your hosting panel
- Check if mod_rewrite is enabled for .htaccess to work
- You might need to set file permissions to 644 for files and 755 for directories
- Test the website after deployment by visiting https://vaultguard.io

⚠️  For the backend:
1. Contact support to check if Node.js hosting is available
2. If not, you'll need to host the backend separately on a Node.js-compatible hosting service

Need help? Contact the hosting support for specific configuration requirements.
"