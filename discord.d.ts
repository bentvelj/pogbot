import * as discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface Client extends discord.Client {
    commands?: discord.Collection<unknown, any>;
}

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: discord.Interaction) => Promise<void>;
}
