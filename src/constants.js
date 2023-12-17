/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 *
 * Files that will be copied to the `BUILD_FOLDER_NAME` folder.
 */
export const META_FILES = [
  "templates/**/*",
  "configurer/**/*",
  "resources/**/*",
  "package.json",
  "package-lock.json",
  "LICENSE.md",
  "README.md",
];

/**
 * Path to tsconfig file that will be used by `tsc` compiler.
 */
export const TS_CONFIG_PATH =
  "node_modules/@athenna/tsconfig/tsconfig.lib-build.json";

/**
 * Build folder name that files will be copied to.
 */
export const BUILD_FOLDER_NAME = "build";
