// var __MVLSK__ = ;


var all_functions = [];
__MVLSK__.forEach(function(file, index) {

	file.functions.forEach(function(fn, index) {

		all_functions.push(fn.name);

	});

});

var set = {};
var unique_functions = [];
for (var i = 0; i < all_functions.length; i++) {
	set[all_functions[i]] = true;
}
for (var item in set) {
	unique_functions.push(item);
}

// console.log('removed ' + (all_functions.length - unique_functions.length) + ' duplicate functions');

console.log( unique_functions.join('|') )