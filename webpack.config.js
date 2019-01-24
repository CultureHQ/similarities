const path = require("path");

module.exports = {
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[name].js"
  },
  entry: path.join(__dirname, "src", "App.js"),
  module: {
    rules: [
      { test: /\.js$/, use: "babel-loader", exclude: /node_modules/ }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "docs")
  }
};
