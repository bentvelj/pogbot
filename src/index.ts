import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Client, Command } from '../discord';

dotenv.config();

const token = process.env.TOKEN;

const client: Client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS],
});

// Load Commands

const commands = new discord.Collection();

const commandsDir = path.join(process.env.PWD, 'dist', 'src', 'commands');
const commandFiles = fs.readdirSync(commandsDir);

for (const file of commandFiles) {
    import(path.join(commandsDir, file))
        .then((command: Command) => {
            commands.set(command.data.name, command);
        })
        .catch((err) => console.log(err));
}

client.commands = commands;

client.once('ready', () => {
    console.log('Ready!');
});

// Listen for commands

client.on('interactionCreate', async (interaction: discord.Interaction) => {
    if (!interaction.isCommand()) return;

    const command: Command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

client.login(process.env.TOKEN);
