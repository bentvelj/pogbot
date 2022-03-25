import * as axios from 'axios';
import * as cheerio from 'cheerio';

export const getADR = async function (
    url: string
): Promise<number> | undefined {
    try {
        const response = await axios.default.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let result;

        $('div.stat-container').each((_idx, el) => {
            const title = $(el).text();
            if (title.includes('ADR')) {
                result = title.trim().split('\n')[1];
            }
        });

        return result;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
