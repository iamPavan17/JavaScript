function isDivisible(n, a, b) {
    if(n%a === 0 && n%b === 0) {
        return true;
    }
    return false;
}

console.log(isDivisible(3,1,3)); //true
console.log(isDivisible(12,2,6)); //true
console.log(isDivisible(100,5,3)); //false