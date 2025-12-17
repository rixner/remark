const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const less = require('less');

const outDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// Plugin to compile LESS in-memory
const lessLoader = {
  name: 'less-loader',
  setup(build) {
    // Intercept require paths ending in .less
    build.onLoad({ filter: /\.less$/ }, async (args) => {
      const content = await fs.promises.readFile(args.path, 'utf8');
      try {
        const result = await less.render(content, {
          filename: args.path,
          compress: true
        });
        return {
          contents: result.css,
          loader: 'text'
        };
      } catch (e) {
        return { errors: [{ text: e.message }] };
      }
    });
  }
};

async function build() {
  console.log('Bundling with esbuild...');

  const commonOptions = {
    entryPoints: [path.join(__dirname, '../src/remark.js')],
    bundle: true,
    loader: {
      '.html': 'text',
      // No need for .css loader generally if we handle .less via plugin,
      // but keeping it for completeness if other css usage appears.
      '.css': 'text'
    },
    plugins: [lessLoader],
    sourcemap: true,
    target: ['es2015']
  };

  // Build unminified
  await esbuild.build({
    ...commonOptions,
    outfile: path.join(outDir, 'remark.js')
  });

  // Build minified
  await esbuild.build({
    ...commonOptions,
    outfile: path.join(outDir, 'remark.min.js'),
    minify: true
  });

  console.log('Build complete.');
}

build().catch(() => process.exit(1));
