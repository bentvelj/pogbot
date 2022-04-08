import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Client, Command, Event } from '../discord';
import { connectDB } from './db/mongoConnect';

// Connect to MongoDB
connectDB();

dotenv.config();

const client: Client = new discord.Client({
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_VOICE_STATES,
        discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
});

// Load Commands

client.commands = new discord.Collection();

const commandsDir = path.join(process.env.PWD, 'dist', 'src', 'commands');
const commandFiles = fs.readdirSync(commandsDir);


client.guilds.fetch();

const guild = client.guilds.cache.get(process.env.GUILD_ID)

// This updates immediately
guild.commands.set([]);

for (const file of commandFiles) {
    import(path.join(commandsDir, file))
        .then((command: Command) => {
            client.commands.set(command.data.name, command);
        })
        .catch((err) => console.log(err));
}

// Load events

const eventsDir = path.join(process.env.PWD, 'dist', 'src', 'events');
const eventFiles = fs.readdirSync(eventsDir);

for (const file of eventFiles) {
    import(path.join(eventsDir, file)).then((event: Event) => {
        if (event.once) {
            client.once(event.name, (...args: any[]) => event.execute(...args));
        } else {
            client.on(event.name, (...args: any[]) => event.execute(...args));
        }
    });
}

// Listen for commands

client.on('interactionCreate', async (interaction: discord.Interaction) => {
    if (!interaction.isCommand()) return;

    const command: Command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error: any) {
        console.error(error);
        await interaction.reply({
            content: `The command failed! Here's discord's complaint:\n\`\`\`${error.toString()}\`\`\`Hopefully you understand that, and can do better next time.`,
            ephemeral: true,
        });
    }
});

client.login(process.env.TOKEN);
