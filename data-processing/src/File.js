//const fs = require('fs').promises;
import * as fs from 'fs';
const fsp = fs.promises;
export async function save(data, path) {
    try {
        await fsp.writeFile(path, data);
        console.log(`Data written successfully to ${path}`);
    }
    catch (error) {
        console.error('Error writing file:', error);
    }
}
/** Converts into a TypeScript file that can be linked to
 *  in front end.
 */
export async function saveMovieLens(data, path) {
    let str = "export const movieLens=`";
    str += JSON.stringify(data) + "`";
    await save(str, path);
}
