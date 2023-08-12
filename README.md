# GW2 Log Parser (Remote Server Ping)

# Summary 
This REST API integrates multiple services, allowing users to easily retrieve and parse log information in their desired format. The API enables communication between three services: Plenbot Uploader, dps.report, and Discord. Modification of shown stats has been simplified so users can quickly and easily share log information with their teams, analyze performance metrics, and make data-driven decisions.

## Future Improvements
- Clean up the text formatting section.
- Enhance JSON parsing to optimize resource utilization. Currently, the parser functions adequately with increased memory and is cost-free through AWS. However, resolving this issue could dramatically reduce memory usage –enabling hosting on other free platforms that limit available memory based on pricing plans.

# Output 
- Logs will be uploaded into a thread matching the current date under the chosed server channel. If the thread does not exist yet, it will be created. 
- Each log will be generated in the following format by default: 
![Example output of the rest api.](/details/logParsingExample.png)


# Setup
The current configuation is ready to be uploaded into an AWS lambda function with little setup. The files should be editable inside of lambda. However, the core of the functionallity will still work if you change the calls and hosting service appropriately. 

### Discord Bot
A discord bot with permissions to: view, create, and post to threads is required to be added to the desired server. One can be easily created through [Discords application development site](https://discord.com/developers/applications). _Note down the bot token_, as it will be needed.

### Lambda Function
- Create a nodejs Lambda function.
![Create Lambda function](/details/setUpLambda.png)

- Upload the zip file containing the .mjs files, package.json, and the node-modules folders to a Node.js Lambda function. Utilize the "Upload from" button at the top right in the "Code" tab. 
#### Lambda Config
- Two changes to the "General configuration" are needed: increasing Memory, and increasing the Time out. The lambda function must be able to recieve the large JSON files to gather data, and must have the time to do calculations and multiple server calls. 
![General configuration changes](/details/setUpLambdaGenConfig.png)
- Environmental variables are needed, that should not be shared with others.You must set the following environmental variables: 
	- AVATAR_URL: the avatar image for the “log-bot.”
	- DISCORD_TOKEN: The Discord bot token. 
	- GUILD_ID: Id of the desired Discord server.
	- CHANNEL_ID: Id of the desired Discord channel.
	- PASSWORD: A string  sent in PlenBot’s “Auth token” field for verificaiton of use.
	- THUMBNAIL: The image to be shown on the top right of the log.
![Env variables image](/details/setUpLambdaEnvVariables.png)


#### Lambda File Modification
- The files should be modifiable inside of Lambda. However, if there is an issue where you can't, then you can modify the code in any text editor or IDE, rezip the files, and upload to Lambda again.
- The emoji id used for boon averages is unique to each discord. Simply paste in your server's emoji id into the corresponding string in the "emoji" table, found at the top of post.mjs. Be sure to keep the quotation marks around the id. 
	- If you do not enter in your servers’ emoji id, then the string inside the “emoji” object will be displayed (e.g. <:Stability:1128826486841950218>).  Creating server emojis is fairly easy, guides can be found through google. Once you have your emoji, you can find the id by typing a backslash “\” before inserting an emoji in chat. 
- There are a few default layouts that should make it easy to change the data shown, look in the "Cusomization" section below for further info. 

#### Lambda Testing
- The lambda function should be able to successfully upload to the server when run with the test statement given in the lambdaTest.json file. The fields “permalink” and “password” must be set in the testing json to match your environmental variables, same as you would in PlenBot. 
- Alternatively, you can assign the "link" variable in the index.mjs file with a working dps.report link, commenting out the incoming request checks for testing. Hit the "Deploy" button so that the changes take effect.
![Lambda testing](/details/setUpLambdaTesting.png)

### API Gateway
- Finally, set up a REST, AWS API Gateway. At the time of writing, the option screen should be: 
	- Create API.
	- REST API -> Build. _(Not the "Private" option)_
	- Keep the default settings. Name it as you like.
- Create a "GET" method, utilizing your Lambda function, by going to "Actions", and using "Create Method." Choose "GET", and confirm.
	- Set up the GET method with Lambda_proxy integration, and select your lambda function. 
	![API Gateway GET](/details/setUpAPIGet.png)
	- Go to "Actions", and hit "Deploy API".

### PlenBot
- Now, you can grab your API URL and enter that into Plenbot's "Remote server pings". The url used to call your lambda function can then be found in the API Gateway inside of stages. _Note: The "Test ping" option is not set up to work right now. However, we already did all the lambda testing through lambda itself. If you're not recieving a return message from the lambda function, then there is an error in the API Gateway configuration/permissions._ 
![Plenbot remote server ping](/details/setUpPlenbot.png)


# Customization
Customizing the logs can require some knowledge of the json format of the logs. Elite Insight's JSON documents can be found [HERE](https://baaron4.github.io/GW2-Elite-Insights-Parser/Json/index.html). However, it can be easier to just look through a parsed json log --you can have one generated via [Elite Insights](https://github.com/baaron4/GW2-Elite-Insights-Parser/tree/master). 

There are only two places you need to modify to change or add information to your log posts. 
- dpsReport.mjs finds and stores the information that you're wanting to parse. To parse different information, you must retrieve the information from the json and store it in the "details" object, use the currently stored variables as reference.
- post.mjs formats the information into code blocks that suit Discord's posting style. There are multiple functions that have a default layout that can be applied to different uses. 
	- CreateSummaryByGroup: Used to link emoji's to a boon array object given.
	- create OrderedString: Creates a "Top 10" ranking given an array of objects ({name: playerName, statName: amount}).
	- be sure to add/remove/modify the "params" object accordily, this is the text sent to discord.



# Resources
## Resources used
Javascript, AWS (Lambda, API Gateway), Discord (Discord.js, bots, and webhooks).

## Endpoints:
- GET/: Receives log url from Plenbot Uploader and initializes the retrieval of log parsing.

## Community Thanks
Many thanks to the people that created the resources that make this API work! Guild Wars is an ever growing community that so many people have poured love into. It is a beautiful thing. (_While this project is drawn from and utilizes many of the resources listed here, the listed resources/creators do not have any association with this project and are not responsible for its functionallity nor use._)

- [Elite Insights](https://github.com/baaron4/GW2-Elite-Insights-Parser/tree/master)
	- [Elite Insight JSON documentation](https://baaron4.github.io/GW2-Elite-Insights-Parser/Json/index.html)
- [PlenBot](https://plenbot.net/uploader/)
- [dps.report](https://dps.report/)

