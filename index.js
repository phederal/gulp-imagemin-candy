import path from 'node:path';
import process from 'node:process';
import log from 'fancy-log';
import PluginError from 'plugin-error';
import through from 'through2-concurrent';
import prettyBytes from 'pretty-bytes';
import chalk from 'chalk';
import imagemin from 'imagemin';
import plur from 'plur';
const PLUGIN_NAME = 'gulp-imagemin-qork';
const defaultPlugins = ['gifsicle', 'mozjpeg', 'optipng', 'svgo'];
const LOAD_ICON = chalk.bold.magenta('↳');
const CHECK_ICON = chalk.bold.red('↳ ');
const CANCEL_ICON = chalk.bold.red('X');

const loadPlugin = (plugin, ...args) => {
	try {
		return require(`imagemin-${plugin}`)(...args);
	} catch {
		log(`${CANCEL_ICON} Couldn't load plugin "${plugin}"`);
	}
};

const exposePlugin = plugin => (...args) => loadPlugin(plugin, ...args);

const getDefaultPlugins = () => defaultPlugins.flatMap(plugin => loadPlugin(plugin));

export default function gulpImagemin(plugins, options) {

	if (typeof plugins === 'object' && !Array.isArray(plugins)) {
		options = plugins;
		plugins = undefined;
	}

	options = {
		// TODO: Remove this when Gulp gets a real logger with levels
		silent: process.argv.includes('--silent'),
		verbose: process.argv.includes('--verbose'),
		...options,
	};

	const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg']);

	let totalBytes = 0;
	let totalSavedBytes = 0;
	let totalFiles = 0;

	return through.obj({
		maxConcurrency: 8,
	}, (file, encoding, callback) => {
		if (file.isNull()) {
			callback(null, file);
			return;
		}

		if (file.isStream()) {
			callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		if (!validExtensions.has(path.extname(file.path).toLowerCase())) {
			if (options.verbose) {
				log(`unsupported ${chalk.blue(file.relative)}`);
			}

			callback(null, file);
			return;
		}

		const localPlugins = plugins || getDefaultPlugins();

		(async () => {
			try {
				const data = await imagemin.buffer(file.contents, {
					plugins: localPlugins,
				});
				const originalSize = file.contents.length;
				const optimizedSize = data.length;
				const saved = originalSize - optimizedSize;
				const percent = originalSize > 0 ? (saved / originalSize) * 100 : 0;
				const savedMessage = `saved ${prettyBytes(saved)} / ${percent.toFixed(1).replace(/\.0$/, '')}%`;
				const message = saved > 0 ? savedMessage : 'already optimized';

				if (saved > 0) {
					totalBytes += originalSize;
					totalSavedBytes += saved;
					totalFiles++;
				}

				if (options.verbose) {
					log(CHECK_ICON + file.relative + chalk.gray(` [${message}]`));
				}

				file.contents = data;
				callback(null, file);
			} catch (error) {
				callback(new PluginError(LOAD_ICON, error, { fileName: file.path }));
			}
		})();
	}, callback => {
		if (!options.silent) {
			const percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0;
			let message = `${LOAD_ICON} ${totalFiles} ${plur('image', totalFiles)}`;

			if (totalFiles > 0) {
				message += chalk.gray(` [saved ${prettyBytes(totalSavedBytes)} / ${percent.toFixed(1).replace(/\.0$/, '')}%]`);
			}

			log(message);
		}

		callback();
	});
}

export const gifsicle = exposePlugin('gifsicle');
export const mozjpeg = exposePlugin('mozjpeg');
export const optipng = exposePlugin('optipng');
export const svgo = exposePlugin('svgo');
