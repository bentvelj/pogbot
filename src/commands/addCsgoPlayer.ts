import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import * as mongoose from 'mongoose';
import { Command } from '../../discord';
import { connectDB } from '../db/mongoConnect';
import { playerSchema as Player } from '../models/playerSchema';
import { getHLTV } from '../util/csgoTeamMaking/getHLTV';

const discordIDOption: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('discord-id')
    .setDescription("The new player's Discord ID.")
    .setRequired(true);

const popFlashOption: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('popflash-url')
    .setDescription("A link to the new player's popflash profile.")
    .setRequired(true);

const addCsgoPlayerCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .addStringOption(discordIDOption)
    .addStringOption(popFlashOption)
    .setName('add-csgo-player')
    .setDescription('Add a CS:GO player to the team-making database');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const discID: string = interaction.options.data.find(
        (option) => option.name === discordIDOption.name
    ).value as string;

    const popFlashURL: string = interaction.options.data.find(
        (option) => option.name === popFlashOption.name
    ).value as string;

    const hltv = await getHLTV(popFlashURL);
    // Verification
    if (hltv === undefined) {
        interaction.reply(
            "There's something wrong with that popFlash URL, could not extract HLTV score."
        );
    } else {
        interaction.reply(
            `Sucessfully validated ${discID}'s popFlash: ${popFlashURL} (HLTV: ${hltv} - kinda ass ngl)`
        );
    }

    // Also check if it exists in DB?
    // return;
    // Send to DB
    let newPlayer = new Player({ discID, popFlashURL });

    newPlayer.save(function (err: any, book: any) {
        if (err) return console.error(err);
        console.log(newPlayer.discID + ' saved to bookstore collection.');
    });
};

const command: Command = {
    data: addCsgoPlayerCommand,
    execute: execute,
};

export = command;
