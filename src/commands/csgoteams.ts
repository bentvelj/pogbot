import * as discord from 'discord.js';
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../discord';
import { getVoiceChannel } from '../util/voiceChannel/getVoiceChannel';
import { getMemberNames } from '../util/voiceChannel/getMemberNames';
import { connectDB } from '../db/mongoConnect';
import { playerSchema } from '../models/playerSchema';
import { generateCombinations } from '../util/math/combinations';
import { getHLTV } from '../util/csgoTeamMaking/getHLTV';
import { Player } from '../util/csgoTeamMaking/types';
import { getFairTeams } from '../util/csgoTeamMaking/getFairTeams';
import { getADR } from '../util/csgoTeamMaking/getADR';
import { getWR } from '../util/csgoTeamMaking/getWR';

const csgoTeamsCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('csgoteams')
    .setDescription('Create balanced CS:GO teams');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const voiceChannel = getVoiceChannel(interaction);
    if (_.isNil(voiceChannel)) {
        interaction.reply('You are not in a voice channel...');
        return;
    }
    // const membersList = getMemberNames(voiceChannel);
    const membersList = [
        'Bazzy#3374',
        'Willium#1547',
        'Yelo#2654',
        'Boxerme#0774',
        'Lambertkwp#7057',
        'Trevor#2842',
        'flasdo#1417',
        'pip#9426',
        'LL#4852',
        'Cornpops#0906',
        // 'MITTZ#4697',
        // 'Chappers#5233',
        // 'IamZyva#4533',
        // 'Ghostnod#3043',
    ];
    const activePlayers: Player[] = [];
    // Grab each member's popflash info
    // console.log(playerSchema.find({ discID: 'Bazzy#3374' }));

    for (const discordId of membersList) {
        const playerObj = await playerSchema.findOne({
            discID: discordId,
        });
        if (_.isNil(playerObj)) continue;

        // Possibly consolidate all of these gets into a single function?
        activePlayers.push({
            discId: playerObj.discID,
            HLTV: await getHLTV(playerObj.popFlashURL),
            ADR: await getADR(playerObj.popFlashURL),
            WR: await getWR(playerObj.popFlashURL),
        });
    }

    if (activePlayers.length > 10) {
        interaction.reply(
            'Error: Over 10 users in the voice channel are registered.'
        );
        return;
    } else if (activePlayers.length < 10) {
        console.log(activePlayers.length);
        activePlayers.forEach((element) => {
            console.log(element.discId + element.HLTV);
        });
        interaction.reply(
            'Error: Less than 10 users in the voice channel are registered.'
        );
        return;
    }

    // const temp = {
    //     'Bazzy#3374': 'https://popflash.site/user/1785369',
    //     'Willium#1547': 'https://popflash.site/user/1799141',
    //     'Yelo#2654': 'https://popflash.site/user/42472',
    //     // 'Boxerme#0774': 'https://popflash.site/user/1785368',
    //     'Lambertkwp#7057': 'https://popflash.site/user/1785776',
    //     'Trevor#2842': 'https://popflash.site/user/225528',
    //     // 'flasdo#1417': 'https://popflash.site/user/1039865',
    //     // 'pip#9426': 'https://popflash.site/user/160570',
    //     'LL#4852': 'https://popflash.site/user/481517',
    //     'Cornpops#0906': 'https://popflash.site/user/359749',
    //     'MITTZ#4697': 'https://popflash.site/user/561147',
    //     'Chappers#5233': 'https://popflash.site/user/1785367',
    //     // "IamZyva#4533": "https://popflash.site/user/42073",
    //     'Ghostnod#3043': 'https://popflash.site/user/14727',
    // };

    const teamPair = getFairTeams(activePlayers);

    let teamOneString = '**Team ONE:**```';
    for (const member of teamPair.teamOne) {
        teamOneString += member.discId + '\n';
    }
    teamOneString += '```\n';

    let teamTwoString = '**Team TWO:**```';
    for (const member of teamPair.teamTwo) {
        teamTwoString += member.discId + '\n';
    }
    teamTwoString += '```';

    interaction.reply(
        teamOneString +
            teamTwoString +
            `\nThe difference in average HLTV is **${teamPair.avgHLTVDiff.toFixed(
                3
            )}!**`
    );
    // list of players playing in game with their HTLV score and discID
    // const playerList: Player[] = [];
    // for (const member of membersList) {
    //     playerList.push({
    //         discId: member,
    //         HLTV: await getHLTV('https://popflash.site/user/42472'),
    //     });
    // }
};

const command: Command = {
    data: csgoTeamsCommand,
    execute: execute,
};

export = command;
