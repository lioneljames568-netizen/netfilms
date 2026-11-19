function videoJsLayerCompatibility() {
  return {
    postcssPlugin: "netfilms-videojs-layer-compatibility",
    Once(root) {
      const filename = root.source?.input.file || "";
      if (!filename.includes("@videojs/react")) return;

      // Tailwind 3 reserves the "base" layer name for its own @tailwind base
      // directive. Rename only Video.js's vendor layer to avoid that collision.
      root.walkAtRules("layer", (rule) => {
        if (rule.params.trim() === "base") {
          rule.params = "netfilms-videojs-base";
        }
      });
    },
  };
}
videoJsLayerCompatibility.postcss = true;

module.exports = {
  plugins: [
    videoJsLayerCompatibility,
    require("tailwindcss"),
    require("autoprefixer"),
  ],
};
