var cart = [
    {
        name: 'Air Max 2017',
        price: 3299,
        qty: 2
    },
    {
        name: 'Mac Book Pro',
        price: 50000,
        qty: 1
    }
];

function cartTotal() {
    var total = 0;
    cart.forEach(function(c) {
        total+= c.qty*c.price;
    });
    return total;
}

console.log(cartTotal(cart));