import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import * as dotenv from 'dotenv';
import * as discord from 'discord.js'


dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
];

(async () => {
    try {
        console.log('Started refreshing application slash commands.');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });
        console.log('Success!');
    } catch (err) {
        console.log(err);
    }
})();




// Create a new client instance
const client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
    }
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
