import fetch from 'node-fetch';

export const fetchPromise = (async(link, params) => {
  return new Promise ((resolve, reject) => {
    fetch(link, params)
    .then(response => {
      if (!response.ok)
        reject(response);

      return response.json()
    })
    .then((response) => resolve(response))
    .catch(err => {
      console.log(`There has been an error fetching ${link}`, err)
      reject(err)
    });
  })
});