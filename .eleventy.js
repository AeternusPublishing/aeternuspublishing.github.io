module.exports = function(eleventyConfig){
    eleventyConfig.addFilter("bookUrl", cover => {
        const book = require("./src/_data/catalogue").books.find(b => b.cover === cover);
        return book ? book.url : "";
    });
    eleventyConfig.addPassthroughCopy('./src/css/style.css')
    eleventyConfig.addPassthroughCopy('./src/assets')

    // Minify HTML output (conservative: collapse indentation whitespace but keep
    // inline spacing, strip HTML comments; inline JS/CSS left untouched to be safe).
    eleventyConfig.addTransform("htmlmin", async function(content){
        if ((this.page.outputPath || "").endsWith(".html")) {
            try {
                const { minify } = await import("html-minifier-terser");
                return await minify(content, {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    removeComments: true,
                    keepClosingSlash: true,
                });
            } catch (e) {
                console.warn(`[htmlmin] skipped ${this.page.inputPath}: ${e.message}`);
                return content;
            }
        }
        return content;
    });

    return{
        dir:{
            input:"src",
            output:"public",
            includes: "_includes"
            
        }
    }
}
