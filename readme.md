# gulp-imagemin

> Minify PNG, JPEG, GIF and SVG images
> [`imagemin`](https://github.com/imagemin/imagemin) with custom logs for Gulp 4

*Issues with the output should be reported on the [`imagemin` issue tracker](https://github.com/imagemin/imagemin/issues).*

## Install

```
$ npm install --save-dev gulp-imagemin
```

## Usage

### Basic

```js
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';

export default () => (
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'))
);
```

### Custom plugin options

```js
// …
.pipe(imagemin([
	imagemin.gifsicle({interlaced: true}),
	imagemin.mozjpeg({quality: 75, progressive: true}),
	imagemin.optipng({optimizationLevel: 5}),
	imagemin.svgo({
		plugins: [
			{removeViewBox: true},
			{cleanupIDs: false}
		]
	})
]))
// …
```

### Custom plugin options and custom `gulp-imagemin` options

```js
// …
.pipe(imagemin([
	imagemin.svgo({
		plugins: [
			{
				removeViewBox: true
			}
		]
	})
], {
	verbose: true
}))
// …
```

## API

Comes bundled with the following optimizers:

- [gifsicle](https://github.com/imagemin/imagemin-gifsicle) — *Compress GIF images, lossless*
- [mozjpeg](https://github.com/imagemin/imagemin-mozjpeg) — *Compress JPEG images, lossy*
- [optipng](https://github.com/imagemin/imagemin-optipng) — *Compress PNG images, lossless*
- [svgo](https://github.com/imagemin/imagemin-svgo) — *Compress SVG images, lossless*

These are bundled for convenience and most users will not need anything else.

### imagemin(plugins?, options?)

Unsupported files are ignored.

#### plugins

Type: `Array`\
Default: `[imagemin.gifsicle(), imagemin.mozjpeg(), imagemin.optipng(), imagemin.svgo()]`

[Plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use. This will completely overwrite all the default plugins. So, if you want to use custom plugins and you need some of defaults too, then you should pass default plugins as well. Note that the default plugins come with good defaults and should be sufficient in most cases. See the individual plugins for supported options.

#### options

Type: `object`

##### verbose

Type: `boolean`\
Default: `false`

Enabling this will log info on every image passed to `gulp-imagemin`:

```
✔ image1.png [already optimized]
✔ image2.png [saved 91 B / 0.4%]
```

##### silent

Type: `boolean`\
Default: `false`

Don't log the number of images that have been minified.

You can also enable this from the command-line with the `--silent` flag if the option is not already specified.
