var num1 = [1,2,3,4,5]; //1
var num2 = [1,2,3,4,5,6,7]; //2

function minNumber(n) {
    var sum = 0;
    n.forEach(function(n) {
        sum+=n;
    });
    if(sum %2 === 0) {
        return 2;
    }
    return 1;
}

console.log(minNumber(num2));
