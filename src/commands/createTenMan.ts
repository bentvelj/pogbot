import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import randomColour from 'randomcolor';
import { getFairTeamsAsMessage } from '../util/csgoTeamMaking/getFairTeams';

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
        return `Current players: **${playerList
            .toString()
            .replace('[]', '')
            .split(',')
            .join(', ')}**`;
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
        .setStyle('DANGER')
        .setDisabled(true);

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
            if (!playerList.includes(user) && playerList.length < 10) {
                playerList.push(user);

                // Leave button will always be enabled after a join
                row.components[1].setDisabled(false);

                // If full, disable join button
                if (playerList.length > 9) {
                    row.components[0].setDisabled(true);
                    await i.update({
                        content: await getFairTeamsAsMessage(playerList),
                        components: [row],
                    });
                }
            }
            await i.update({
                content: getContent(playerList),
                components: [row],
            });
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

                // Join button will always be enabled after a leave
                row.components[0].setDisabled(false);

                // If empty, disable leave button
                if (playerList.length == 0) {
                    row.components[1].setDisabled(true);
                }
            }
            await i.update({
                content: getContent(playerList),
                components: [row],
            });
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
