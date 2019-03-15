function findNotBookedTables(arr) {
    var notBooked = [];
    arr.forEach(function(a, index) {
        if(a === 'not booked') {
            notBooked.push(index);
        }
    });
    return notBooked;
}

console.log(findNotBookedTables(["not booked", "booked", "booked", "not booked", "not booked"]));    //[0,3,4] 