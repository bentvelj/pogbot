import * as discord from 'discord.js';
import * as _ from 'lodash'
import * as axios from 'axios'
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../discord';
import { getVoiceChannel } from '../util/voiceChannel/getVoiceChannel';
import { getMemberNames } from '../util/voiceChannel/getMemberNames';

//const popflashUrls = require('../../data/poplashURLs.json');


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

    const membersList = getMemberNames(voiceChannel);

    //const profileUrls = membersList.map(member => popflashUrls[member]);
    axios.default.get('https://popflash.site/user/42073').then(res =>{
        interaction.reply(res.data);
    }
        
    )
    
};

const command: Command = {
    data: csgoTeamsCommand,
    execute: execute,
};

export = command;
