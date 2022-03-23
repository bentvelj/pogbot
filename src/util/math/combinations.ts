/**
 * Generates all combinations of items choose r
 */
export const generateCombinations = function (
    items: any[],
    r: number
): any[][] {
    // If items is not defined, set it to empty array, else clone it
    items = items.slice();

    // Impossible cases
    if (items.length == 0 || r == 0 || r > items.length) return [[]];
    // If r == item length, don't decompose, only one way to do it
    if (r === items.length) return [items];
    // Combinations of the items choose 1 is just each element on it's own
    // [1,2,3] choose 1 = [[1], [2], [3]]
    if (r === 1) {
        return items.reduce((x, el) => {
            x.push([el]);
            return x;
        }, []);
    }
    // Pop off and store first element
    let head = items.shift();

    let result = generateCombinations(items, r - 1).map((x) => {
        x.unshift(head);
        return x;
    });

    return result.concat(generateCombinations(items, r));
};
