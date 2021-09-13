import { SlashCommandBuilder } from "@discordjs/builders";
import * as discord from "discord.js";
import * as voice from "@discordjs/voice";
import { Command } from "../../discord";
import { getVoiceChannel } from "../utils/interactionUtil";

const speakCommand: SlashCommandBuilder = new SlashCommandBuilder()
  .setName("speak")
  .setDescription("Testing!");

const execute = async function (
  interaction: discord.CommandInteraction
): Promise<void> {
  const voiceChannel = getVoiceChannel(interaction);
  const vcId = voiceChannel.id;
  const guildId = interaction.guildId;
  const adapterCreator = voiceChannel.guild.voiceAdapterCreator;
  voice.joinVoiceChannel({
    channelId: vcId,
    guildId: guildId,
    adapterCreator: adapterCreator,
  });
  interaction.reply("Joined voice channel!");
};

const command: Command = {
  data: speakCommand,
  execute: execute,
};
export = command;
