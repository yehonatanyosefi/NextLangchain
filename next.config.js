/** @type {import('next').NextConfig} */
// https://js.langchain.com/docs/getting-started/install#vercel--nextjs
// To use LangChain with Next.js (either with app/ or pages/), add the following to your next.config.js to enable support for WebAssembly modules (which is required by the tokenizer library @dqbd/tiktoken):
const nextConfig = {
	// webpack(config) {
	// 	config.experiments = {
	// 		asyncWebAssembly: true,
	// 		layers: true,
	// 	}

	// 	return config
	// },
	webpack: (webpackConfig, { webpack }) => {
		webpackConfig.experiments = { ...webpackConfig.experiments, topLevelAwait: true }
		webpackConfig.externals['node:fs'] = 'commonjs node:fs'

		webpackConfig.plugins.push(
			// Remove node: from import specifiers, because Next.js does not yet support node: scheme
			// https://github.com/vercel/next.js/issues/28774
			new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
				resource.request = resource.request.replace(/^node:/, '')
			})
		)

		return webpackConfig
	},
	env: {
		OPEN_API_KEY: process.env.OPEN_API_KEY,
		SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
		PINECONE_INDEX: process.env.PINECONE_INDEX,
		PINECONE_API_KEY: process.env.PINECONE_API_KEY,
		PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
		GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
	},
}

module.exports = nextConfig
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   webpack: (webpackConfig, { webpack }) => {
//     webpackConfig.experiments = { ...webpackConfig.experiments, topLevelAwait: true };
//     webpackConfig.externals["node:fs"] = "commonjs node:fs";

//     webpackConfig.plugins.push(
//       // Remove node: from import specifiers, because Next.js does not yet support node: scheme
//       // https://github.com/vercel/next.js/issues/28774
//       new webpack.NormalModuleReplacementPlugin(
//         /^node:/,
//         (resource) => {
//           resource.request = resource.request.replace(/^node:/, '');
//         },
//       ),
//     );

//     return webpackConfig;
//   }
// }

// module.exports = nextConfig;
