import { SlashCommandBuilder } from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';

const slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('greet')
    .setDescription('greetings!');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    interaction.reply('Hello there.');
};

const command: Command = {
    data: slashCommand,
    execute: execute,
};

export = command;
