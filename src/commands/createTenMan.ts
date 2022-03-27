import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import randomColour from 'randomcolor';

const popFlashLinkOption: SlashCommandStringOption =
    new SlashCommandStringOption()
        .setName('popflash')
        .setDescription('The link to the popFlash lobby')
        .setRequired(true);

const messageOption: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('message')
    .setDescription('A custom message')
    .setRequired(true);

const createTenMan: SlashCommandBuilder = new SlashCommandBuilder()
    .addStringOption(popFlashLinkOption)
    .addStringOption(messageOption)
    .setName('create-ten-man')
    .setDescription('Create a ten man lobby!');

const getContent = function (playerList: string[]): string {
    if (playerList.length === 0) {
        return '**The lobby is currently empty!**';
    } else if (playerList.length > 0 && playerList.length < 10) {
        return `**Current players: ${playerList
            .toString()
            .replace('[]', '')}**`;
    } else {
        return `**Lobby is currently full!**`;
    }
};

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const message = interaction.options.data.find(
        (option) => option.name === messageOption.name
    ).value as string;

    const popFlashLink = interaction.options.data.find(
        (option) => option.name === popFlashLinkOption.name
    ).value as string;

    //Create embed
    const popFlashLinkEmbed = new discord.MessageEmbed()
        .setColor(randomColour() as discord.ColorResolvable)
        .setTitle(message)
        .setDescription('This is a popFlash link, obviously.')
        .setURL(popFlashLink);

    // Create buttons
    const joinButton = new discord.MessageButton()
        .setCustomId('join')
        .setLabel('🍆')
        .setStyle('SUCCESS');

    const leaveButton = new discord.MessageButton()
        .setCustomId('leave')
        .setLabel('💨')
        .setStyle('DANGER');

    // Add them to the message
    const row = new discord.MessageActionRow().addComponents(
        joinButton,
        leaveButton
    );

    let playerList: string[] = [];

    const joinCollector = interaction.channel.createMessageComponentCollector({
        filter: (i: discord.MessageComponentInteraction) =>
            i.customId === 'join',
    });

    joinCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            const user = i.member.user.username;
            if (playerList.length == 10) {
                await interaction.followUp({
                    content:
                        'Lobby is unfortunately full, maybe convince someone to leave?',
                    ephemeral: true,
                });
            } else if (!playerList.includes(user)) {
                playerList.push(user);
                await i.update({
                    content: getContent(playerList),
                });
            } else {
                await interaction.followUp({
                    content: "You can't join a lobby you're already in.",
                    ephemeral: true,
                });
            }
        }
    );

    const leaveCollector = interaction.channel.createMessageComponentCollector({
        filter: (i: discord.MessageComponentInteraction) =>
            i.customId == 'leave',
    });

    leaveCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            const user = i.member.user.username;
            if (playerList.includes(user)) {
                playerList = playerList.filter((u) => u !== user);
                await i.update({
                    content: getContent(playerList),
                });
            } else {
                await interaction.followUp({
                    content: "You can't leave a lobby you never joined.",
                    ephemeral: true,
                });
            }
        }
    );

    await interaction.reply({
        content: '**Lobby is currently empty!**',
        components: [row],
        embeds: [popFlashLinkEmbed],
    });
};

const command: Command = {
    data: createTenMan,
    execute: execute,
};

export = command;
