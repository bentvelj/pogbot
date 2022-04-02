import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import randomColour from 'randomcolor';
import {
    getFairTeamsAsMessage,
    validatePlayerList,
} from '../util/csgoTeamMaking/getFairTeams';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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
        return 'The lobby is currently **empty**!';
    } else if (playerList.length > 0 && playerList.length < 10) {
        return `Current players [ **${playerList.length}** ]: **${playerList
            .map((p) => p.substring(0, p.indexOf('#')))
            .toString()
            .replace('[]', '')
            .split(',')
            .join(', ')}**`;
    } else {
        return `Lobby is currently **full**!`;
    }
};

const getMissingPlayerListMessage = function (
    missingPlayers: string[]
): string {
    const listString = `**${missingPlayers
        .toString()
        .replace('[]', '')
        .split(',')
        .join(', ')}**`;
    return `The following users could not be found in the database: ${listString}\n\n Add them with the \`\\add-csgo-player\` command, then re-join the lobby.`;
};

// In seconds, currently at 1 hour.
const LOBBY_TIMEOUT = 60 * 60 * 1000;

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

    // These UUIDs are to prevent two lobbies from listening (and replying to) each others interactions (button presses)

    const joinButtonUUID = uuidv4();

    const leaveButtonUUID = uuidv4();

    // Create buttons
    const joinButton = new discord.MessageButton()
        .setCustomId(joinButtonUUID)
        .setLabel('🍆')
        .setStyle('SUCCESS');

    const leaveButton = new discord.MessageButton()
        .setCustomId(leaveButtonUUID)
        .setLabel('✌️')
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
            i.customId === joinButtonUUID,
    });

    joinCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            const user =
                i.member.user.username + '#' + i.member.user.discriminator;

            if (!playerList.includes(user) && playerList.length < 10) {
                playerList.push(user);

                // Leave button will always be enabled after a join
                row.components[1].setDisabled(false);

                // If full, disable join button
                if (playerList.length > 9) {
                    row.components[0].setDisabled(true);
                    // Check to ensure all players exist in DB
                    const notFoundList = await validatePlayerList(playerList);
                    if (_.isEmpty(notFoundList)) {
                        row.components[1].setDisabled(true);
                        await i.update({
                            content: 'Computing teams...',
                            components: [row],
                        });
                        const result = await getFairTeamsAsMessage(playerList);
                        row.components[1].setDisabled(false);
                        await i.editReply({
                            content: result,
                            components: [row],
                        });
                    } else {
                        await i.update({
                            content: getMissingPlayerListMessage(notFoundList),
                            components: [row],
                        });
                    }
                    return;
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
            i.customId == leaveButtonUUID,
    });

    leaveCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            const user =
                i.member.user.username + '#' + i.member.user.discriminator;
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
        content: 'Lobby is currently **empty**!',
        components: [row],
        embeds: [popFlashLinkEmbed],
    });

    await setTimeout(async () => {
        joinCollector.removeAllListeners();
        joinCollector.dispose(interaction);
        leaveCollector.removeAllListeners();
        leaveCollector.dispose(interaction);
        await interaction.deleteReply();
        console.log('Lobby timed out.');
    }, LOBBY_TIMEOUT);
};

const command: Command = {
    data: createTenMan,
    execute: execute,
};

export = command;
