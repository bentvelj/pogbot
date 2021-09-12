import * as discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIApplicationCommandOption } from 'discord-api-types';

export interface Client extends discord.Client {
    commands?: discord.Collection<unknown, any>;
}

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: discord.CommandInteraction) => Promise<void>;
}

export interface SlashCommandBuilderJSON {
    name: string;
    description: string;
    options: APIApplicationCommandOption[];
    default_permission: boolean;
}

export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void>;
}
