const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/extension/script.ts", // Or your actual entry point
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "extension/scripts"),
    library: {
      type: "window"
    },
    iife: true
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules|test/,
      },
    ],
  },
  // If you import Node-only modules in code needed by the extension, exclude them:
  externals: {
    "node:assert": "null"
  }
};
