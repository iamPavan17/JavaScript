var person = {
    fname: 'Rama',
    lname: 'Sita',
    details: function() {
        return `FirstName - ${this.fname}, LastName - ${this.lname}`
    }
}

console.log(person.details());