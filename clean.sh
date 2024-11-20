rm -rf node_modules

cd pages

# Clean up the search directory. 
cd search
rm -rf dist
rm -rf node_modules
cd ..

# Done. Go back. 
cd ..