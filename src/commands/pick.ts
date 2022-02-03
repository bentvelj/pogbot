import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import _ = require('lodash');
import { Command } from '../../discord';
import { getVoiceChannel } from '../util/voiceChannel/getVoiceChannel';
import { getMemberNames } from '../util/voiceChannel/getMemberNames';

const numPicksOption: SlashCommandIntegerOption =
    new SlashCommandIntegerOption()
        .setName('count')
        .setDescription('The number of users to pick (default is one).')
        .setRequired(false);

const slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .addIntegerOption(numPicksOption)
    .setName('pick')
    .setDescription('Pick a random user (or users) from the current voice channel!');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const voiceChannel = getVoiceChannel(interaction);
    if (_.isNil(voiceChannel)) {
        interaction.reply('You are not in a voice channel...');
        return;
    }

    const countOption = interaction.options.data.find(
        (option) => option.name === numPicksOption.name
    );

    const numPicks = countOption ? (countOption.value as number) : 1;

    const membersList = getMemberNames(voiceChannel);

    if (numPicks > membersList.length) {
        interaction.reply(
            `There aren\'t ${numPicks} people in the voice channel right now :(`
        );
        return;
    }

    const picks: string[] = [];
    for (let i = 0; i < numPicks; i++) {
        const index = Math.floor(Math.random() * membersList.length);
        const pickedMember = membersList[index];
        picks.push(pickedMember);
        membersList.splice(index, 1);
    }

    const outputString = `** My pick${
        picks.length > 1 ? 's' : ''
    }: **  \`\`\`${picks.toString().replace(',', ', ').trim()}\`\`\``;
    interaction.reply(outputString);
};

const command: Command = {
    data: slashCommand,
    execute: execute,
};

export = command;
