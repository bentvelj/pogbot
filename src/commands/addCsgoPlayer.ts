import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from '@discordjs/builders';
import * as discord from 'discord.js';
import * as mongoose from 'mongoose';
import { Command } from '../../discord';
import { connectDB } from '../db/mongoConnect';
import { playerSchema as Player } from '../models/playerSchema';
import { getADR } from '../util/csgoTeamMaking/getADR';
import { getHLTV } from '../util/csgoTeamMaking/getHLTV';
import { getHSP } from '../util/csgoTeamMaking/getHSP';
import { getWR } from '../util/csgoTeamMaking/getWR';

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
    const adr = await getADR(popFlashURL);
    const hsp = await getHSP(popFlashURL);
    const wr = await getWR(popFlashURL);

    // Verification - Safe to assume if HLTV can be found the others can too.
    if (hltv === undefined) {
        interaction.reply(
            "There's something wrong with that popFlash URL, could not extract HLTV or ADR score."
        );
    } else {
        interaction.reply(
            `Sucessfully validated ${discID}'s popFlash: ${popFlashURL}. Here are their stats from the last 31 days:\n\`\`\`HLTV = ${hltv}\nADR = ${adr}\nHS% = ${hsp}\nWR% = ${wr}\`\`\`\n They should probably download aim trainer, yikes...`
        );
    }

    // Also check if it exists in DB?
    // Send to DB
    let newPlayer = new Player({ discID, popFlashURL });

    newPlayer.save(function (err: any, book: any) {
        if (err){
            return console.error(err);
        } 
        console.log(newPlayer.discID + ' saved to bookstore collection.');
    });
};

const command: Command = {
    data: addCsgoPlayerCommand,
    execute: execute,
};

export = command;
