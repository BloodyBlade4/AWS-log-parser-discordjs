import fetch from 'node-fetch';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import {getDPSReport} from './dpsReport.mjs';
import {getDiscordParams} from './post.mjs';

const getDate = () => {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
}

//get all threads from discord channel, loop through them until you find a thread with the correct name. return id.
const getThreadID = async (rest, name) => {
  const existingThreads = await rest.get(Routes.guildActiveThreads(process.env.GUILD_ID));
  
  var res = await existingThreads.threads.find(entry => entry.name === name);
  if(res === null || res === undefined)
    return null;
  return res.id;
}


export const logPost = (async(link) => {
  try {
    const rest = new REST({ version: '10'}).setToken(process.env.DISCORD_TOKEN);
    //find the thread id
    let threadName = await (process.env.THREAD_NAME_START + getDate());
    let threadID = await getThreadID(rest, threadName);

    //if the thread id is null, then it doesn't exist yet. Create it, and do the thread id search again.
    if (threadID === null) {
      await rest.post(Routes.threads(process.env.CHANNEL_ID), {
        body: {
          name: threadName,
          type: 11, //this is a public thread.
          auto_archive_duration: 60,  
        },
      });
    }
    threadID = await getThreadID(rest, threadName);
    if (threadID == null)
      return "Cannot find a thread ID of a thread named " + threadName;

    //Get parameters for the discord post.
    const params = await getDiscordParams(await getDPSReport(link));

    //Call the discord thread with the generated log parameters.
    return await fetch(
      `https://discord.com/api/v10/channels/${threadID}/messages`,
      {
        method: "POST", 
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-type': 'application/json'
        }, 
        body: JSON.stringify(params),
      }
    ).then((response) => {
      if (response.ok)
        return 'The log has been sucessfully uploaded.'
      throw new Error(`there has been an error posting to the thread: ${threadName}. `)
    })
    .catch(err => {return err});

  } catch (error) {
    console.error('Error:', error);
    return 'An error occurred.' + error;
  }
})