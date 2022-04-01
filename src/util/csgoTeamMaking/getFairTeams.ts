import * as _ from 'lodash'
import { Player, TeamPair } from './types';
import { playerSchema } from '../../models/playerSchema';
import { generateCombinations } from '../math/combinations';
import { getHLTV } from './getHLTV';
import { getADR } from './getADR';
import { getWR } from './getWR';

/**
 * Checks a list of discord usernames against the database and returns a list of users NOT found in the database
 * @param usernames The list of usernames to validate
 * @returns A list of users NOT found in the database
 */

export const validatePlayerList = async function(usernames : string[]) : Promise<string[]>{
    const notFoundList : string[] = []
    for(const discordID of usernames){
        const result = await playerSchema.findOne({
            discID: discordID,
        });
        if(_.isNil(result)){
            notFoundList.push(discordID);
        }
    }
    return notFoundList;
}

const pullPlayerInfo = async function(usernames : string[]) : Promise<Player[]>{
    const playerList : Player[] = [];
    
    for (const discordID of usernames) {
        const playerObj = await playerSchema.findOne({
            discID: discordID,
        });

        if (_.isNil(playerObj)){
            throw `Attempted to pull player info of ${discordID}, but they were not found in the database.`;
        }

        // Possibly consolidate all of these gets into a single function?
        playerList.push({
            discId: playerObj.discID,
            HLTV: await getHLTV(playerObj.popFlashURL),
            ADR: await getADR(playerObj.popFlashURL),
            WR: await getWR(playerObj.popFlashURL),
        });
    }
    return playerList;
}

const getComplement = function (combination: Player[], playerList: Player[]) {
    let complement: Player[] = [];
    let combinationDiscIds: string[] = [];

    combination.forEach((player) => {
        combinationDiscIds.push(player.discId);
    });

    playerList.forEach((player) => {
        if (!combinationDiscIds.includes(player.discId)) {
            complement.push(player);
        }
    });
    return complement;
};

const getAvgHLTV = function (combination: Player[]) {
    // cum is short for cumulative you bastard
    return combination.reduce((cum, p) => {
        return cum + p.HLTV / combination.length;
    }, 0);
};

export const getFairTeams = function (playerList: Player[]): TeamPair {
    
    const combinations = generateCombinations(playerList, 5);

    let minAvgDiff = Infinity;
    let teamOne = undefined;
    let teamTwo = undefined;

    for (const combo of combinations) {
        const complement = getComplement(combo, playerList);
        let curAvgDiff = Math.abs(getAvgHLTV(combo) - getAvgHLTV(complement));
        if (curAvgDiff < minAvgDiff) {
            teamOne = combo;
            teamTwo = complement;
            minAvgDiff = curAvgDiff;
        }
    }
    return {
        teamOne,
        teamTwo,
        avgHLTVDiff: minAvgDiff,
        avgADRDiff: -1,
        avgWRDiff: -1,
    };
};

export const getFairTeamsAsMessage = async function (usernames: string[]): Promise<string> {
    const playerList = await pullPlayerInfo(usernames);
    const teamPair = getFairTeams(playerList);

    
    let teamOneString = '**Team ONE:**```';
    for (const member of teamPair.teamOne) {
        teamOneString += member.discId + '\n';
    }
    teamOneString += '```\n';

    let teamTwoString = '**Team TWO:**```';
    for (const member of teamPair.teamTwo) {
        teamTwoString += member.discId + '\n';
    }
    teamTwoString += '```\n';

    return teamOneString + teamTwoString + `Difference in average ADR is: ${teamPair.avgADRDiff}\n`;
};
