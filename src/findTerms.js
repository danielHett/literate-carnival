const CORRECT_RESPONSE_CODE = 200;

const findTerms = async (prefix) => {
  let url = `https://dict.leo.org/dictQuery/m-query/conf/ende/query.conf/strlist.json?q=${prefix}&shortQuery&noDescription&sideInfo=on&where=both`;

  console.log(`Starting call to ${url}`);
  let leoServerResponse = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(`Successfully called ${url}. The response is: \n\n${JSON.stringify(leoServerResponse)}`);

  if (leoServerResponse.status !== 200)
    throw new Error(
      `Recieved the wrong response code (${leoServerResponse.status}) from LEO. Looking for a ${CORRECT_RESPONSE_CODE}.`
    );

  let leoServerResponseBody = await leoServerResponse.json();
  console.log(`The result of parsing the body is: \n\n${JSON.stringify(leoServerResponseBody)}`);

  // LEO returns the results in a weird format. It's an array with at least five elements. Elements
  // one and four should be arrays of the same size.
  if (!(leoServerResponseBody instanceof Array) || leoServerResponseBody.length < 5)
    throw new Error('There was something wrong with the response from LEO.');

  let terms = leoServerResponseBody[1];
  let langauges = leoServerResponseBody[4];

  if (terms.length !== langauges.length) {
    throw new Error(
      `The length of the list of terms (${terms.length}) did not match the length of the parallel array (${
        langauges.length
      }) used to label each term's language.\nThe terms: ${terms.join(', ')}\nThe lanuages: ${langauges.join(', ')}`
    );
  }

  // Now we transform the response into something cleaner for the UI.
  let termsAndLang = [];
  for (let i = 0; i < terms.length; i++) {
    termsAndLang.push([terms[i], langauges[i] === 1 ? 'EN' : 'DE']);
  }

  return termsAndLang;
};

module.exports = { findTerms };
