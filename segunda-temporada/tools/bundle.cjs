// Junta index.html + style.css + js/*.js en un solo HTML (para publicar o compartir).
// Uso: node tools/bundle.cjs <salida.html> [--fragment]
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const out = process.argv[2], fragment = process.argv.includes('--fragment');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="style.css" \/>/, () => '<style>\n' + css + '</style>');
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => '<script>\n' + fs.readFileSync(path.join(root, f), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>');
if (fragment) {
  const title = /<title>[\s\S]*?<\/title>/.exec(html)[0];
  const style = /<style>[\s\S]*?<\/style>/.exec(html)[0].replace('html, body {', 'html, body { height: 100%;');
  const body = /<body>([\s\S]*)<\/body>/.exec(html)[1];
  html = title.replace(/>.*</, '>Criaturas del Reino: Segunda Temporada<') + '\n' + style + '\n' + body;
}
fs.writeFileSync(out, html);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
