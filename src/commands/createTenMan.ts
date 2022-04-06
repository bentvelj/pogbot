import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import randomColour from 'randomcolor';
import {
    getFairTeamsListAsMessage,
    validatePlayerList,
} from '../util/csgoTeamMaking/getFairTeams';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { e } from 'mathjs';

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

    const prevTeamButtonUUID = uuidv4();

    const nextTeamButtonUUID = uuidv4();

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

    const prevTeamButton = new discord.MessageButton()
        .setCustomId(prevTeamButtonUUID)
        .setLabel('⬅️')
        .setStyle('SECONDARY');

    const nextTeamButton = new discord.MessageButton()
        .setCustomId(nextTeamButtonUUID)
        .setLabel('➡️')
        .setStyle('PRIMARY');

    // Player list : who is currently in the lobby : )
    let playerList: string[] = [];

    // Current set of possible teams generated from (the last full) lobby members. : )
    let currentTeamsList: string[];

    //current team being displayed in the lobby
    let currentTeamsIndex = 0;

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
                leaveButton.setDisabled(false);

                if (playerList.length > 9) {
                    // If full, disable join button
                    joinButton.setDisabled(true);
                    // Check to ensure all players exist in DB
                    const notFoundList = await validatePlayerList(playerList);
                    if (_.isEmpty(notFoundList)) {
                        // While computing 💻 teams, disable the leave button so people dont leave mid computation 💻
                        leaveButton.setDisabled(true);
                        await i.update({
                            content: 'Computing teams...',
                            components: [
                                new discord.MessageActionRow().addComponents(
                                    joinButton,
                                    leaveButton
                                ),
                            ],
                        });
                        currentTeamsList = await getFairTeamsListAsMessage(
                            playerList
                        );
                        // Computation 💻 done, teams are displayed, people are free to leave.
                        leaveButton.setDisabled(false);
                        await i.editReply({
                            content: currentTeamsList[0],
                            // Include the cycle 🌀 buttons while displaying teams
                            components: [
                                new discord.MessageActionRow().addComponents(
                                    joinButton,
                                    leaveButton,
                                    prevTeamButton,
                                    nextTeamButton
                                ),
                            ],
                        });
                    } else {
                        await i.update({
                            content: getMissingPlayerListMessage(notFoundList),
                            components: [
                                new discord.MessageActionRow().addComponents(
                                    joinButton,
                                    leaveButton
                                ),
                            ],
                        });
                    }
                } else {
                    // Player successfully joined lobby, but it's still not full 🌗
                    await i.update({
                        content: getContent(playerList),
                        components: [
                            new discord.MessageActionRow().addComponents(
                                joinButton,
                                leaveButton
                            ),
                        ],
                    });
                }
            } else {
                // In the case 💼 of trying to join a full lobby, or a lobby you're already in - do nothing
                await i.deferUpdate();
            }
        }
    );

    const leaveCollector = interaction.channel.createMessageComponentCollector({
        filter: (i: discord.MessageComponentInteraction) =>
            i.customId === leaveButtonUUID,
    });

    leaveCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            const user =
                i.member.user.username + '#' + i.member.user.discriminator;
            if (playerList.includes(user)) {
                playerList = playerList.filter((u) => u !== user);

                // Join button will always be enabled after a leave
                joinButton.setDisabled(false);

                // Reset the current team index, so that next time the lobby is full, it shows the top team pair first 💯
                currentTeamsIndex = 0;

                // If empty, disable leave button ❌
                if (playerList.length == 0) {
                    leaveButton.setDisabled(true);
                }
                // Player who actually was in the lobby leaves
                await i.update({
                    content: getContent(playerList),
                    components: [
                        new discord.MessageActionRow().addComponents(
                            joinButton,
                            leaveButton
                        ),
                    ],
                });
            } else {
                // If someone tries to leave a lobby they're not in, do nothing
                await i.deferUpdate();
            }
        }
    );

    const cycleCollector = interaction.channel.createMessageComponentCollector({
        filter: (i: discord.MessageComponentInteraction) =>
            i.customId === prevTeamButtonUUID ||
            i.customId === nextTeamButtonUUID,
    });

    cycleCollector.on(
        'collect',
        async (i: discord.MessageComponentInteraction) => {
            let result: string;
            if (i.customId === prevTeamButtonUUID) {
                // Cycle backwards ⬅️
                result =
                    currentTeamsList[
                        currentTeamsList.length -
                            Math.abs(
                                currentTeamsIndex-- % currentTeamsList.length
                            ) -
                            1
                    ];
            } else if (i.customId === nextTeamButtonUUID) {
                // Cycle forwards ➡️
                result =
                    currentTeamsList[
                        ++currentTeamsIndex % currentTeamsList.length
                    ];
            }
            await i.update({
                content: result,
                components: [
                    new discord.MessageActionRow().addComponents(
                        joinButton,
                        leaveButton,
                        prevTeamButton,
                        nextTeamButton
                    ),
                ],
            });
        }
    );

    await interaction.reply({
        content: 'Lobby is currently **empty**!',
        components: [
            new discord.MessageActionRow().addComponents(
                joinButton,
                leaveButton
            ),
        ],
        embeds: [popFlashLinkEmbed],
    });

    setTimeout(async () => {
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
