import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { Command, SlashCommandBuilderJSON } from '../discord';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.CLIENT_ID;

// Used only for guild-specific deployment
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commandsDir = path.join(process.env.PWD, 'dist', 'src', 'commands');

async function compileCommandList(
    commandsDir: string
): Promise<SlashCommandBuilderJSON[]> {
    const commandFiles = fs.readdirSync(commandsDir);
    const commandList: SlashCommandBuilderJSON[] = [];
    console.log('Compiling commands...');
    for (const file of commandFiles) {
        await import(path.join(commandsDir, file)).then((command: Command) => {
            commandList.push(command.data.toJSON());
        });
    }
    console.log('Success!');
    return commandList;
}

async function refreshCommands(commandList: SlashCommandBuilderJSON[]) {
    
    try {
        console.log('Started refreshing application slash commands...');
        await rest.put(Routes.applicationCommands(clientId), {
            body: commandList,
        });
        // Temporary to clear server commands and avoid duplicates
        await rest.put(Routes.applicationGuildCommands(clientId,guildId),{
            body: []
        })
        console.log('Success!');
    } catch (err) {
        console.log(err);
    }
}

compileCommandList(commandsDir).then((commandList: SlashCommandBuilderJSON[]) =>
    refreshCommands(commandList)
);
