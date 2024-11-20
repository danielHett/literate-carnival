const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use('/', express.static(path.join(__dirname, 'pages', 'search', 'dist')));

app.post('*', bodyParser.json());
app.post('/search-terms', async (req, res) => {
  let { body } = req;

  // TODO: Check body
  // if (!body.searchPrefix)

  let { searchPrefix } = req.body;

  let leoServerResponse = await fetch(
    `https://dict.leo.org/dictQuery/m-query/conf/ende/query.conf/strlist.json?q=${searchPrefix}&shortQuery&noDescription&sideInfo=on&where=both`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  let leoServerResponseBody = await leoServerResponse.json();

  let terms = leoServerResponseBody[1];
  let langauges = leoServerResponseBody[4];

  // Something is wrong with what we got back from Leo.
  if (terms.length !== langauges.length) {
    res.sendStatus(500);
    return;
  }

  let responseBody = [];
  for (let i = 0; i < terms.length; i++) {
    responseBody.push([terms[i], langauges[i] === 1 ? 'EN' : 'DE']);
  }

  res.json(responseBody);
});

app.listen(3000);
