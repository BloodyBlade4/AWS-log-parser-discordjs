import {logPost} from './logPost.mjs';

/*TODO:
  combine/reorder the string formatting functions inside of ./post.js to be compatible with multiple desired outputs. 
  implement a error catch method that will return a detailed error string to plenbot.
  Remove player listings from a category if their stats are 0. right now it'll always show 10 players, even if it should be zero.
    This could also mean there'll be problems if you try to upload a log with less than 10 people.
*/
const getResp = ((text) => {
  const b = {'msg': text};
  return({
    statusCode: 200,
    body: JSON.stringify(b)
  });
});

export const handler = async (req, res) => {
  console.log("Handler called.");
  if (req.httpMethod !== 'GET') {
    return getResp("Error, you must use GET with this service.");
  }
  const query = req.queryStringParameters;
  
  if (!query || !query.password) {
    return getResp("Error, there is an error in your query. Check password field.");
  }
  else if (query.password !== process.env.PASSWORD) {
    return getResp("Error: authorization field is not formatted correctly.");
  }
  else {
    let results = await logPost(query.permalink)
    return await getResp(results);
  }
};