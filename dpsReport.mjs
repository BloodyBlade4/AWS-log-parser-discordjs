import {fetchPromise} from './utilities.mjs';

//given an object of arrays containing players boons, return the uptime corresponding to the given boon id.
const findBoonUptime = (async (array, id) => {
  for await (const obj of array) {
    if (obj.id === id){
      return obj.buffData[0].uptime;
    }
  }
  return 0;
});

//reduce a given array into it's average and return that number to 2 decimal. 
//If "percent", then return the number with as a percentage. 
const createAvg = (async (array, percent) => {
	return await Promise.all(
	    array.map(async(array) => {
	    	if (array.length === 0)
	    		return null;
	    	if (percent)
	    		return await (array.reduce((a,b) => a+b) /array.length).toFixed(2) + "%";
	      	return await (array.reduce((a,b) => a+b) /array.length).toFixed(2);
	    })
  	);
});

//get and return info in a usable format from dps.report
export const getDPSReport = (async(link) => {
  let report;
  //get the parsed json from dps.report
  try{
    report = await fetchPromise(`https://dps.report/getJson?permalink=${link}`, {});
  }
  catch (error) {
    console.log("FAILED to get report.");
    throw(error);
  }

  //the output object, passed on to post.mjs, that holds all the desired log details.
  let details = {
    link: link,
    name: report.fightName,
    duration: report.duration,
    uploadedBy: report.recordedBy,
    cleanses: [],
    strips: [],
    damage: [],
    stability: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    might: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    alacrity: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    quickness: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    
    protection: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    resolution: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    resistance: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    aegis: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],

    squadCount: report.players.length,
    squadDeaths: 0,
    squadDowns: 0,
    squadDamage: 0,
    squadDPS: 0,

    enemyCount: report.targets.length,
    enemyDeaths: 0,
    enemyDowns: 0,
    enemyDamage: 0,
    enemyDPS: 0, 
  };
  
  //get player/squad info:
  for await (const player of report.players) {
  	if (player.notInSquad || player.friendlyNPC)
  		break;
    //Player information
    const name = player.name + ` (${player.profession.substr(0,3)})`; 
    const group = player.group;
    let damage = 0;
    let dps = 0; 

    details.squadDeaths += player.defenses[0].deadCount;
    details.squadDowns += player.defenses[0].downCount;

    for await (const stat of player.dpsTargets) {
    	details.squadDamage += stat[0].damage;
    	details.squadDPS += stat[0].dps;
    	damage += stat[0].damage;
    	dps += stat[0].dps;
    }

    for await (const stat of player.statsTargets) {
    	details.enemyDeaths += stat[0].killed;
    	details.enemyDowns += stat[0].downed;
    }
    //push these details as an object into their respective array. 
    details.cleanses.push({name: name, cleanses: (player.support[0].condiCleanse + player.support[0].condiCleanseSelf)});
    details.strips.push({name: name, strips: player.support[0].boonStrips});
    details.damage.push({name: name, damage: damage, dps: dps});

    //push the boon active uptime into their repective array, in an index corresponding to the player's group. 
    details.stability[group-1].push(await findBoonUptime(player.buffUptimesActive, 1122));
    details.might[group-1].push(await findBoonUptime(player.buffUptimesActive, 740));
    details.alacrity[group-1].push(await findBoonUptime(player.buffUptimesActive, 30328));
    details.quickness[group-1].push(await findBoonUptime(player.buffUptimesActive, 1187));
    
    details.protection[group-1].push(await findBoonUptime(player.buffUptimesActive, 717));
    details.resolution[group-1].push(await findBoonUptime(player.buffUptimesActive, 873));
    details.resistance[group-1].push(await findBoonUptime(player.buffUptimesActive, 26980));
    details.aegis[group-1].push(await findBoonUptime(player.buffUptimesActive, 743));
  }

  //sort largest to smallest, then cut down to ten results max. Post will handle filtering 0's.:
  details.damage.sort((a,b) => b.damage - a.damage);
  details.damage = details.damage.slice(0,10);
  details.cleanses.sort((a,b) => b.cleanses - a.cleanses);
  details.cleanses = details.cleanses.slice(0,10);
  details.strips.sort((a,b) => b.strips - a.strips);
  details.strips = details.strips.slice(0,10);

  //average: createAvg( listOfIntegers, isPercentage)
  details.stability = await createAvg(details.stability, false); 
  details.might = await createAvg(details.might, false);
  details.alacrity = await createAvg(details.alacrity, true);
  details.quickness = await createAvg(details.quickness, true);

  details.protection = await createAvg(details.protection, true);
  details.resolution = await createAvg(details.resolution, true);
  details.resistance = await createAvg(details.resistance, true);
  details.aegis = await createAvg(details.aegis, true);

  //get enemy player/squad info: 
  for await (const enemy of report.targets) {
    details.enemyDamage += enemy.dpsAll[0].damage;
    details.enemyDPS += enemy.dpsAll[0].dps;
  }

  return details;
})