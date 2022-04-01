import { SlashCommandBuilder } from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';

const checkMemoryCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('check-memory')
    .setDescription('Check the memory currently being used by pogbot');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const used = process.memoryUsage();
    let outputString = '```';
    for (let key in used) {
        outputString += `${key} ${
            //@ts-ignore
            Math.round((used[key] / 1024 / 1024) * 100) / 100
        } MB\n`;
    }
    outputString += '```';
    interaction.reply(outputString);
};

const command: Command = {
    data: checkMemoryCommand,
    execute: execute,
};

export = command;
