const path = require("path");

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[name].js"
  },
  entry: path.join(__dirname, "src", "App.tsx"),
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "awesome-typescript-loader" }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "docs")
  }
};
