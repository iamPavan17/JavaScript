// An array is an ordered, integer indexed, collection of values
// Array is Object type
// To check whether the vriable type is array - Array.isArray(<array_name>)

var arr = [];
console.log(typeof arr); //Object

var players = ['dhoni', 'virat'];

console.log(players[0]);    //dhoni - string
console.log(players[5]);    //undefined
players[5] = 'rama';
console.log(players);   //[ 'dhoni', 'virat', <3 empty items>, 'rama' ]

//Arrays can be created using constructor
var names = new Array(2);   //[ <2 empty items> ] - i.e, undefined 
console.log(names);

var names = new Array(2, 'anonymoues'); 
console.log(names);     //[ 2, 'anonymoues' ]

/* methods - 

push() - returns length
pop() - returns removed data
shift() - remove the first element - returns deleted elemene
unshift() - adds at first - returns new element
splice() - we can add and remove using splice - To add - splice(index, 0 , 'element'); To remove an element - splice(index, <number_of_elements>)

*/

