/* Write a function to move an array element from one position to another. 

Test Data :
1. move([10, 20, 30, 40, 50], 0, 2);
return [20, 30, 10, 40, 50]

2. move([10, 20, 30, 40, 50], 1, 2);
return [10, 30, 20, 40, 50]
*/

function move(arr, a, b) {
    var frstEle = arr[a];
    var lastEle = arr[b];
    arr.splice(a, 1);
    arr.splice(a, 0, lastEle);
    arr.splice(b, 1);
    arr.splice(b, 0, frstEle);
    return arr;
}

console.log(move([10, 20, 30, 40, 50], 2, 1)); 