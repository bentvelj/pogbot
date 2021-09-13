import { SlashCommandBuilder } from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';

const flipCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('coinFlip')
    .setDescription('Flip a coin.');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    interaction.reply(`${Math.random() > 0.5 ? 'Heads!' : 'Tails!'}`)
};

const command: Command = {
    data: flipCommand,
    execute: execute,
};

export = command;
