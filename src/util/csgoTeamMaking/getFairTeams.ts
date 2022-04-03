import * as _ from 'lodash';
import { Player, TeamPair } from './types';
import { playerSchema } from '../../models/playerSchema';
import { generateCombinations } from '../math/combinations';
import { getPlayerStats } from './getPlayerStats';

/**
 * Checks a list of discord usernames against the database and returns a list of users NOT found in the database
 * @param usernames The list of usernames to validate
 * @returns A list of users NOT found in the database
 */

export const validatePlayerList = async function (
    usernames: string[]
): Promise<string[]> {
    const notFoundList: string[] = [];
    for (const discordID of usernames) {
        const result = await playerSchema.findOne({
            discID: discordID,
        });
        if (_.isNil(result)) {
            notFoundList.push(discordID);
        }
    }
    return notFoundList;
};

const resolvePlayer = async function (username: string): Promise<Player> {
    const playerObj = await playerSchema.findOne({
        discID: username,
    });
    if (_.isNil(playerObj)) {
        return Promise.reject(
            `Attempted to pull player info of ${username}, but they were not found in the database.`
        );
    }
    const stats = await getPlayerStats(playerObj.popFlashURL);
    return {
        discId: playerObj.discID,
        HLTV: stats.HLTV,
        ADR: stats.ADR,
        WR: stats.WR,
        HSP: stats.HSP,
    };
};

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
        avgHSPDiff: -1,
    };
};

export const getFairTeamsAsMessage = async function (
    usernames: string[]
): Promise<string> {
    // usernames = [
    //     'Bazzy#3374',
    //     //'Willium#1547',
    //     'Yelo#2654',
    //     'Boxerme#0774',
    //     //'Lambertkwp#7057',
    //     'Trevor#2842',
    //     //'flasdo#1417',
    //     'pip#9426',
    //     'LL#4852',
    //     //'Cornpops#0906',
    //     'MITTZ#4697',
    //     'Chappers#5233',
    //     'IamZyva#4533',
    //     'Ghostnod#3043',
    // ];
    const playerList = await Promise.all(
        usernames.map((username) => resolvePlayer(username))
    );
    const teamPair = getFairTeams(playerList);
    console.log(teamPair);
    let teamOneString = '**Team ONE:**```';
    for (const member of teamPair.teamOne) {
        teamOneString += member.discId.substring(0,member.discId.indexOf('#')) + '\n';
    }
    teamOneString += '```\n';

    let teamTwoString = '**Team TWO:**```';
    for (const member of teamPair.teamTwo) {
        teamTwoString += member.discId.substring(0,member.discId.indexOf('#')) + '\n';
    }
    teamTwoString += '```\n';
    return (
        teamOneString +
        teamTwoString +
        `Difference in average HLTV is: ${teamPair.avgHLTVDiff.toFixed(2)}\n`
    );
};
