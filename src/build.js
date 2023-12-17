/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { tsc } from "./tsc.js";
import { rimraf } from "rimraf";
import { copyfiles } from "./copyfiles.js";
import { META_FILES, TS_CONFIG_PATH, BUILD_FOLDER_NAME } from "./constants.js";

/**
 * Delete old `BUILD_FOLDER_NAME` folder.
 */
await rimraf(BUILD_FOLDER_NAME);

/**
 * Compile the application using tsc.
 */
await tsc(TS_CONFIG_PATH);

/**
 * Copy `META_FILES` to `BUILD_FOLDER_NAME` folder.
 */
await copyfiles(META_FILES, BUILD_FOLDER_NAME);
