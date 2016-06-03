//<mvt:do file="" name="l.success" value="" />
fs = require('fs');
fs.readFile('mv-lsk.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data);
  data = JSON.parse(data);
  for (var i = 0; i < data.length; i++) {
  	for (var j = 0; j < data[i].functions.length; j++) {
  		console.log('<mvt:do file="'+data[i].distro_path + '" name="l.success value="' + data[i].functions[j].name + '(' + data[i].functions[j].parameters.join('   ') + ')" />');
  	}
  }
});