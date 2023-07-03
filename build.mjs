
import { build } from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

build({
	entryPoints: ["index.ts"],
	bundle: true,
	platform: 'node',
	outfile: "bundle_node.js",
	sourcemap: 'inline',
	plugins: [
	],
});

build({
	entryPoints: ["index.ts"],
	bundle: true,
	platform: 'browser',
	outfile: "bundle_browser.js",
	sourcemap: 'inline',
	
	plugins: [
		polyfillNode({
			// Options (optional)
		})
	],
});
