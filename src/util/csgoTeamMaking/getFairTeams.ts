import { Player, TeamPair } from './types';
import { generateCombinations } from '../math/combinations';

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
    return { teamOne, teamTwo, avgHLTVDiff: minAvgDiff };
};
