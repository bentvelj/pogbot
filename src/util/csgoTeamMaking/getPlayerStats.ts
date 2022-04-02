import * as axios from 'axios';
import * as cheerio from 'cheerio';
import { PlayerStats } from './types';

export const getPlayerStats = async function (
    url: string
): Promise<PlayerStats> | undefined {
    try {
        const response = await axios.default.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let HLTV, ADR, WR, HSP;

        $('div.stat-container').each((_idx, el) => {
            const title = $(el).text();
            if (title.includes('HLTV')) {
                HLTV = title.trim().split('\n')[1];
            } else if (title.includes('ADR')) {
                ADR = title.trim().split('\n')[1];
            } else if (title.includes('WR')) {
                WR = title.trim().split('\n')[1];
            } else if (title.includes('HS')) {
                HSP = title.trim().split('\n')[1];
            }
        });

        return { HLTV, ADR, WR, HSP };
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
