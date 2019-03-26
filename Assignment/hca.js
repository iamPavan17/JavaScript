var hca = [
    {
        doctor: 'Rama',
        expertise : 'asthma eczema food allergies',
        specialty: 'Allergists',
        count: 0
    },
    {
        doctor: 'Sita',
        expertise : 'heart failure heart attack high blood pressure',
        specialty: 'Cardiologists',
        count: 0
    },
    {
        doctor: 'Laxman',
        expertise: 'diabetes thyroid problems infertility calcium bone disorders',
        specialty: 'Endocrinologists'
    }
];

var b = 'i have heart failure';
var c = b.split(' ');
// console.log(c);
var count = 0;
hca.forEach((a) => {
    let exp = a.expertise.split(' ');
    exp.forEach((e) => {
        c.forEach((e2) => {
            if(e == e2) {
                count++;
                a.count = count;
            }
        });
    });
});

const max = hca.reduce(function(prev, current) {
    return (prev.count > current.count) ? prev : current
});

console.log(max);
// console.log(hca);


