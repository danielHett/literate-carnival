./clean.sh 

cd pages

cd search
npm i
npm run build
cd ..

cd ..
npm i
node app.js