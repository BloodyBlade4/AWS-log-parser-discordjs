# GW2 Log Parser (Remote Server Ping)

# Summary 
This REST API integrates multiple services, allowing users to easily retrieve and parse log information in their desired format. The API enables communication between three services: Plenbot Uploader, dps.report, and Discord. Modification of shown stats has been simplified so users can quickly and easily share log information with their teams, analyze performance metrics, and make data-driven decisions.

## Endpoints:
- GET/: Receives log url from Plenbot Uploader and initializes the retrieval of log parsing.
## Resources
Node.js, AWS (Lambda, API Gateway), Discord (Discord.js, bots, and webhooks). 

## Future Improvements
- Clean up the text formatting section.
- Enhance JSON parsing to optimize resource utilization. Currently, the parser functions adequately with increased memory and is cost-free through AWS. However, resolving this issue could dramatically reduce memory usage –enabling hosting on other free platforms that limit available memory based on pricing plans.

# Output 
- Logs will be uploaded into a thread matching the current date under the chosed server channel. If the thread does not exist yet, it will be created. 
- Each log will be generated in the following format by default: 
![Example output of the rest api.](/details/logParsingExample.png)


# Setup
- The current configuation is ready to be uploaded into an AWS lambda function with little setup. However, the core of the functionallity will still work if you change the calls and hosting service appropriately. 
- The emoji id used for boon averages is unique to each discord. If you do not enter in your servers’ emoji id, then the string inside the “emoji” object will be displayed (e.g. <:Stability:1128826486841950218>).  Creating server emojis is fairly easy, guides can be found through google. Once you have your emoji, you can find the id by typing a backslash “\” before inserting an emoji in chat.  
- A discord bot with permissions to: view, create, and post to threads is required to be added to the desired server. One can be easily created through [Discords application development site](https://discord.com/developers/applications). _Note down the bot token_, as it will be needed.
- Upload a zip file containing the .mjs files and the node-modules folders to a Node.js Lambda function. The following environmental variables are needed: 
	- AVATAR_URL: the avatar image for the “log-bot.”
	- DISCORD_TOKEN: The Discord bot token. 
	- GUILD_ID: Id of the desired Discord server.
	- CHANNEL_ID: Id of the desired Discord channel.
	- PASSWORD: A string  sent in PlenBot’s “Auth token” field for verificaiton of use.
	- THUMBNAIL: The image to be shown on the top right of the log. 
- The lambda function should be able to successfully upload to the server when run with the test statement given in the lambdaTest.json file. The fields “permalink” and “password” must be set to match your environmental variables, same as you would in PlenBot.
- Finally, set up a REST, AWS API Gateway, with Lambda_proxy integration requests. The url used to call your lambda function can be found in the API Gateway inside of stages, once deployed.


