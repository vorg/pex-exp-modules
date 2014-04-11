An attempt to break pex into loosely coupled node modules to be installed from npm.

# Building

    cd node_modules/pex-sys
    npm install
    cd ../..
    cd node_modules/pex-materials
    npm install
    cd ../..
    browserify --im true -o test.browser.js test.plask.js
