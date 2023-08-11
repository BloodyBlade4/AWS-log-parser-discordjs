const WIDTH = 42; //desired width of code boxes in discord

//emoji table, based personalized discord settings.
const emoji = {
  //log channel emoji ids. 
  /*
  stability: "<:Stability:1082321187822116874>",
  might: "<:Might:1082384536484184105>",
  quickness: "<:Quickness:1082675248966676510>",
  alacrity: "<:Alacrity:1082675270324060262>",
  */
  
  //Deth channel emoji ids.
  stability: "<:Stability:1128826486841950218>", 
  might: "<:Might:1130551875796738069>",
  quickness: "<:Quickness:1130551894260076694>",
  alacrity: "<:Alacrity:1130551842447818894>",
  aegis: "<:Aegis:1130600993428619295>",
  protection: "<:Protection:1130600979448987719>",
  resistance: "<:Resistance:1130600950302781443>",
  resolution: "<:Resolution:1130600930472099891>",
};

//Field Generation: Given an object of arrays and the number of arrays
//generate a spaced text section for those arrays. 
const createSummaryByGroup = (async (objOfArrays, num) => {
  const spacing = '    '; //four, spacing between emoji
  const valueLength = 9; //including spacing
  const blanks = await new Array((5-num)*8).join(' '); //spacing after party #
  let result = '\` Party #  ' + blanks;
  let strings = ['', '', '', '', '', '', '', '', '', '','','','','','']; 

  //create title and push array values into an array of strings, constructing the order.
  for (const [key, value] of Object.entries(objOfArrays)) {
    if (emoji[key])
      result += `\`${emoji[key]}\`  ` + spacing;
    else 
      result += ` ${key.substr(0,3)} `+spacing;

    await Promise.all(value.map(async (value, i) => {
      if (value === null)
        return;
      strings[i] += await 
      ( await new Array(valueLength - (value.toString().length)).join(' ') + 
        value);
    }));
  }
  result += await ("\n\`\`\` " + new Array(WIDTH-1).join('-') + "\n");

  //add the array of strings to result, with proper spacing. 
  strings.forEach((element, i) => {
    if (element?.length > 0){
      if (i > 8) {//remove a space
        result += `${i+1} `+ blanks + element + "\n";
      }
      else 
        result += ` ${i+1} `+ blanks + element + "\n";
    }
  });
  result += "\`\`\`";

  return result;
});

//Field Generation: Create the spacing for a one variable section
const createOrderedString = ((array, variable) =>{
  let result = '';

  for (let i = 0; i < array.length; i++) {
    //array is already sorted. So, if it gets to zero stats, stop adding players.
    if (array[i][variable] === 0) 
      break;
    let string = ` ${i+1} ${array[i].name}`;
    if (i === 9)
      string = `${i+1} ${array[i].name}`;
    const s = WIDTH - string.length - array[i][variable].toString().length;
    const blanks = new Array(s + 1).join(' ');
    string = string + blanks + array[i][variable] + "\n";
    result += string;
  }
  return result;
});

//Field Generation: damage and DPS summary. Only section that has two variable. 
const createDPSSummary = ((array) => {
  let result = '';
  //const dmgLength = 7;
  const dpsLength = 6;
  for (let i = 0; i < array.length; i++) {
    const dps = array[i].dps;
    let string = ` ${i+1} ${array[i].name}`;
    if (i === 9)
      string = `${i+1} ${array[i].name}`;
    const s = WIDTH - string.length - array[i].damage.toString().length - dpsLength;
    string += 
      new Array(s + 1).join(' ') + 
      array[i].damage + 
      "  " +
      new Array(dpsLength - dps.toString().length).join(' ') + 
      dps + 
      "\n";
    result += string;
  }
  return result;
});

//generate a color based on K/D ratio. 
const colorGenerator =((deaths, kills) => {
  //error checks, No zero's.
  if (kills === 0 && deaths === 0)
    return 0xebdc34;

  if (kills === 0) {
    if (deaths > 1)
      return 0xeb4034;
    return 0xeb8334;
  }
  if (deaths === 0) {
    if (kills > 1)
      return 0x34eb3d;
    return 0xc9eb34;
  }

  let r = kills/deaths;

  if (r >= 2) //Green
    return 0x34eb3d;
  if (r >= 1.25) //lime
    return 0xc9eb34;

  if (r >.75 && r < 1.25) //yellow
    return 0xebdc34;

  if (r <= .75) //orange
    return 0xeb8334;
  if (r <= 0.5) //red
    return 0xeb4034;
  //error, blue
  return 0x4287f5;
});


export const getDiscordParams =(async(details) => {
  if (!details) {
    console.log("there are no details!");
    throw("There are no details to post to discord.");
  }

  const color = await colorGenerator(details.squadDeaths, details.enemyDeaths);
  var params = await {
      "username": "Log bot",
      "avatar_url": process.env.AVATAR_URL,
      "embeds": [
          {
              "title": details.name,
              "url": details.link,
              "color": color,
              "thumbnail": {
                  "url": process.env.THUMBNAIL,
              },
              "fields": [
                  {
                    "name": "",
                    "value": `Duration: ${details.duration}`,
                    "inline": false,
                  },
                  {
                      "name": "Squad summary:",
                      "value": `\`\`\`${
                        "#    DMG        DPS      Downs   Deaths \n------------- ---------- ----------------\n"
                        + `${details.squadCount}   ${details.squadDamage}     ${details.squadDPS}       ${details.squadDowns}      ${details.squadDeaths}`
                      }\`\`\``,
                      "inline": false,
                      
                  },
                  {
                      "name": "Enemy summary:",
                      "value": `\`\`\`${
                        "#    DMG        DPS      Downs   Deaths \n------------- ---------- ----------------\n"
                        + `${details.enemyCount}   ${details.enemyDamage}     ${details.enemyDPS}       ${details.enemyDowns}      ${details.enemyDeaths}`
                      }\`\`\``,
                      "inline": false,
                  },
                  {
                      "name": "Damage summary:",
                      "value": `\`\`\`${
                        " # Name                          DMG   DPS\n---------------------------- -------------\n"
                        + await createDPSSummary(details.damage)
                      }\`\`\``,
                      "inline": false,
                  },
                  {
                      "name": "Cleanses summary:",
                      "value": `\`\`\`${
                        " # Name                           Cleanses\n------------------------------------------\n" 
                        + await createOrderedString(details.cleanses, "cleanses")
                      }\`\`\``,
                      "inline": false,
                  },
                  {
                      "name": "Boon strips summary:",
                      "value": `\`\`\`${
                          " # Name                             Strips\n------------------------------------------\n"
                          + await createOrderedString(details.strips, "strips")
                        }\`\`\``,
                      "inline": false,
                  },
                  {
                      "name": `Avg. * per group over ${details.duration}:`,
                      "value": await createSummaryByGroup({
                              stability: details.stability, might: details.might,
                              alacrity: details.alacrity, quickness: details.quickness,
                            }, 4),
                      "inline": false,
                  },
                  {
                      "name": `Avg. * per group over ${details.duration}:`,
                      "value": await createSummaryByGroup({
                              protection: details.protection, aegis: details.aegis,
                              resolution: details.resolution, resistance: details.resistance,
                            }, 4),
                      "inline": false,
                  },
              ],
              "timestamp": new Date().toISOString(),
              "footer": {
                "text": `Recorded by ${details.uploadedBy}`,
                //icon_url: 'https://i.imgur.com/AfFp7pu.png',
              },
          },
      ],
  };
  return params;
})