import * as discord from 'discord.js';
import * as _ from 'lodash';

export const getVoiceChannel = function (
    interaction: discord.CommandInteraction
): discord.VoiceChannel | discord.StageChannel | undefined {
    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    if (_.isNil(guild)) return undefined;
    return guild.members.cache.get(interaction.member.user.id).voice.channel;
};
