/*Create a function that takes a number as an argument and returns an array. The first element of the array should be 0, and then each element should increase by 1 until it reaches the input number. Then, each element should count back down to 0.

Examples:

INPUT: countUpThenDown(2)
OUTPUT: [0, 1, 2, 1, 0]
INPUT: countUpThenDown(0)
OUTPUT: [0] */


function countUpThenDown(num) {
    var arr = [];
    for(var i = 0; i <= num; i++) {
        arr.push(i);
    }
    for(var j = (num-1); j >= 0; j--) {
        arr.push(j)
    }

    return arr;
}

console.log(countUpThenDown(2));
console.log(countUpThenDown(0));