import * as discord from 'discord.js';
import _ = require('lodash');

export const getMemberNames = function (
    voiceChannel: discord.VoiceChannel | discord.StageChannel
): string[] {
    if (_.isNil(voiceChannel)) return undefined;
    return Array.from(voiceChannel.members.keys()).map(
        (id) => voiceChannel.members.get(id).displayName
    );
};
