var numbers = [10,-10,20,-20,30,-30]; //[60,3]

function sumCount(numbers) {
    var sum = 0, count = 0;
    numbers.forEach(function(n) {
        if(n > 0) {
            sum+=n;
        }
        else {
            count++;
        }
    });
    return [sum,count];
}

console.log(sumCount(numbers));