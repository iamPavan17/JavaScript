function sumPosArr(nums) {
    var sum = 0;
    if(nums.length === 0) {
        return 0;
    }
    else {
        nums.forEach(function(n) {
            if(n > 0) {
                sum+=n;
            }
        })
        return sum;
    }
}

var nums = [10, 20, -45, 20];
var nums2 = [];
console.log(sumPosArr(nums2));