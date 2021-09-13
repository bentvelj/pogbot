import * as discord from 'discord.js';

export function getVoiceChannel(interaction: discord.CommandInteraction) {
    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    const member = guild.members.cache.get(interaction.member.user.id);
    return member.voice.channel;
}
