/*const textToImage = require('text-to-image');
textToImage.generate('Lorem ipsum dolor sit amet', {
  debug: true,
  maxWidth: 1200,
  fontSize: 85,
  fontFamily: 'Arial',
  lineHeight: 80,
  margin: 5,
  bgColor: "transparent",
  textColor: "white",
  textAlign: 'center'
}).then(function (dataUri) {
  console.log(dataUri);
});
*/


var text2png = require('text2png')


var options = {
    font: '100px Spicyrice',
    localFontPath: './SpicyRice.otf',
    localFontName: 'Spicyrice',
    strokeColor: 'black',
    strokeWidth: 1,
    paddingRight: 50,
    paddingBottom: 50,
    paddingLeft: 50,
    paddingTop: 50
//    textAlign: 'center'
}

data = text2png('test\ntest\nanjay testing nih\ntest', { textAlign: 'center', color: 'white', lineSpacing: 20, ...options })

require('fs').writeFileSync('test.png', data)
