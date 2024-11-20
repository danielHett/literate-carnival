const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const { findTerms } = require('./src/findTerms');

const app = express();

app.use('/', express.static(path.join(__dirname, 'pages', 'search', 'dist')));

app.post('*', bodyParser.json());
app.post('/search-terms', async (req, res) => {
  console.log(`Starting /search-terms with the input: ${JSON.stringify(req.body)}`);

  try {
    var termsAndLang = await findTerms(req.body.searchPrefix);
    console.log(termsAndLang);
  } catch (err) {
    console.error(JSON.stringify(err));
    res.status(500);
    res.render('There was a problem. Oops.');
  }

  res.json(termsAndLang);
});

app.listen(3000);
