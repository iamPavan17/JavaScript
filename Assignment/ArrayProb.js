function ArrayProb(arr, k) {
    let ans = 0;
    for(var i = 0; i < k; i++) {
        let maxValue = Math.max.apply(Math, arr);
        ans = ans + maxValue;
        let indexValue = arr.indexOf(maxValue);
        arr.splice(indexValue, 1);
        let divi = Math.floor(maxValue) / 2;
        arr.splice(indexValue, 0, divi);
    }
    return ans;
}

var arr = [24,89];
var k = 2;
console.log(ArrayProb(arr, k));