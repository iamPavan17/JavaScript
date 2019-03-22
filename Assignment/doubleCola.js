var names = ['Sheldon', 'Leonard', 'Penny', 'Rajesh', 'Howard'];

function doubleCola(names, n) {

    for(var i = 0; i < n; i++) {
        let ele = names.shift();
        names.push(ele, ele);
    }
    return names[0];
}

console.log(doubleCola(names, 6));