import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { Command, SlashCommandBuilderJSON } from '../discord';
import { Permissions } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commandsDir = path.join(process.env.PWD, 'dist', 'src', 'commands');

async function compileCommandList(
    commandsDir: string
): Promise<SlashCommandBuilderJSON[]> {
    const commandFiles = fs.readdirSync(commandsDir);
    const commandList: SlashCommandBuilderJSON[] = [];

    for (const file of commandFiles) {
        await import(path.join(commandsDir, file)).then((command: Command) => {
            commandList.push(command.data.toJSON());
        });
    }
    return commandList;
}

async function refreshCommands(commandList: SlashCommandBuilderJSON[]) {
    try {
        console.log('Started refreshing application slash commands...');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commandList,
        });
        console.log('Success!');
    } catch (err) {
        console.log(err);
    }
}

compileCommandList(commandsDir).then((commandList: SlashCommandBuilderJSON[]) =>
    refreshCommands(commandList)
);
