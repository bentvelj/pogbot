import { SlashCommandBuilder } from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';

const slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('greet')
    .setDescription('Say hello!');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    // Obi-wan gif :)
    interaction.reply(
        'https://tenor.com/view/hello-there-hi-there-greetings-gif-9442662'
    );
};

const command: Command = {
    data: slashCommand,
    execute: execute,
};

export = command;
