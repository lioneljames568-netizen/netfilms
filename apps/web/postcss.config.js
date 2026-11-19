const videoJsLayerCompatibility = {
  postcssPlugin: "netfilms-videojs-layer-compatibility",
  Once(root) {
    const filename = root.source?.input.file || "";
    if (!filename.includes("@videojs/react")) return;

    // Video.js ships its skin in a named CSS layer called "base".
    // Tailwind 3 reserves that name for its own @tailwind base directive,
    // so isolate the vendor layer to keep both stylesheets compatible.
    root.walkAtRules("layer", (rule) => {
      if (rule.params.trim() === "base") {
        rule.params = "netfilms-videojs-base";
      }
    });
  },
};

module.exports = {
  plugins: [
    videoJsLayerCompatibility,
    require("tailwindcss"),
    require("autoprefixer"),
  ],
};
