import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
} from '@discordjs/builders';
import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import { getVoiceChannel } from '../util/voiceChannel/getVoiceChannel';
import _ = require('lodash');
import { getMemberNames } from '../util/voiceChannel/getMemberNames';

dotenv.config();

const numberOfTeamsOption: SlashCommandIntegerOption =
    new SlashCommandIntegerOption()
        .setName('count')
        .setDescription('The number of teams to make (default is 2).')
        .setRequired(false);

const teamsCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .addIntegerOption(numberOfTeamsOption)
    .setName('teams')
    .setDescription('Make some random teams!');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const voiceChannel = getVoiceChannel(interaction);
    if (_.isNil(voiceChannel)) {
        interaction.reply('You are not in a voice channel...');
        return;
    }

    const countOption = interaction.options.data.find(
        (option) => option.name === numberOfTeamsOption.name
    );

    // numberOfTeamsOption value will always be integer
    const numberOfTeams = countOption ? (countOption.value as number) : 2;

    if (numberOfTeams < 2) {
        interaction.reply('You must specify at least 2 teams.');
        return;
    }

    const members = voiceChannel.members;

    if (members.size < numberOfTeams) {
        interaction.reply(
            `There are not enough members in the voice channel to make ${numberOfTeams} teams.`
        );
        return;
    }

    const membersPerTeam = members.size / numberOfTeams;
    const membersList = getMemberNames(voiceChannel);
    const teams: string[][] = [];

    // Initialize an empty array for each team.
    for (let i = 0; i < numberOfTeams; i++) {
        teams.push([]);
    }

    for (let teamNumber = 0; teamNumber < numberOfTeams; teamNumber++) {
        for (
            let memberNumber = 0;
            memberNumber < membersPerTeam;
            memberNumber++
        ) {
            const index = Math.floor(Math.random() * membersList.length);
            const pickedMember = membersList[index];
            teams[teamNumber].push(pickedMember);
            membersList.splice(index, 1);
        }
    }

    // Remainders members will always be less than the number of teams (at most N - 1)
    if (membersList.length > 0) {
        for (
            let memberNumber = 0, teamNumber = 0;
            memberNumber < membersList.length;
            memberNumber++, teamNumber++
        ) {
            teams[teamNumber].push(membersList[memberNumber]);
        }
    }

    let outputString = '';

    for (let team = 0; team < teams.length; team++) {
        let teamString = teams[team].toString().replace(',', ', ').trim();
        if (teamString.endsWith(',')) {
            teamString = teamString.substr(0, teamString.length - 1);
        }
        outputString += `**Team ${team + 1} **: \`\`\`${teamString}\`\`\`\n`;
    }

    interaction.reply(outputString);
};

const command: Command = {
    data: teamsCommand,
    execute: execute,
};
export = command;
