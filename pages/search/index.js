import { cache } from './cache.js';

// Some constants.
const SEARCH_BOX_ID = 'term-search-box';
const LIST_NODE_ID = 'term-list';

// Some state-related variables.
let currentSearchPrefix = null;
let controller = new AbortController();

export const updateSearchResults = (searchPrefix) => {
  // The first thing we want to do is to update the global state. That way any other microtasks can recognize if there is a more recent search, and therefore
  // don't update the list with old results.
  currentSearchPrefix = searchPrefix;

  // If the last network request sent is still in-flight, this will end it.
  controller.abort();

  // Now we create a new controller.
  controller = new AbortController();

  // Start the cascade of events to update the DOM.
  startUpdate(searchPrefix, controller);
};

const startUpdate = (searchPrefix, controller) => {
  // Cache hit? Then don't bother making the network request.
  if (cache.has(searchPrefix)) {
    updateTermList(cache.get(searchPrefix));
    return;
  }

  // We didn't have anything cached. Make the request.
  fetch(`http://localhost:3000/search-terms`, {
    method: 'post',
    body: JSON.stringify({ searchPrefix }),
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then((res) => {
      if (searchPrefix !== currentSearchPrefix) return null;
      return res.json();
    })
    .then((body) => {
      // Either (1) we found that there was a new search request in the previous task or (2) we found out there was a new search in this task.
      if (body === null || searchPrefix !== currentSearchPrefix) return null;

      // This search is still valid. Update the DOM!
      updateTermList(body);

      // Don't forget to cache what we learned for later.
      cache.set(searchPrefix, body);
    })
    .catch((err) => {
      if (err.name === 'AbortError') console.log(`Network request for the prefix '${searchPrefix}' was cancelled.`);
      else console.error(`Something went wrong while fetching with the prefix: ${err}`);
    });
};

const updateTermList = (terms) => {
  // This search is still valid. Update the DOM!
  parent = document.getElementById(LIST_NODE_ID);
  parent.innerText = '';
  for (let [term, langauge] of terms) {
    let child = document.createElement('li');
    child.textContent = `${term} - ${langauge}`;
    parent.appendChild(child);
  }
};

document.getElementById(SEARCH_BOX_ID).addEventListener('input', (event) => updateSearchResults(event.target.value));
