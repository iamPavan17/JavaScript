/*Write a function, petNameGenerator that takes a string name as an argument and returns the first 3 or 4 letters as that person's pet name! If the 3rd letter is a vowel, return the first 4 letters.

Examples:

INPUT: petNameGenerator('Sachin')
OUTPUT: 'Sac'
INPUT: petNameGenerator('Elon')
OUTPUT: 'Elon' */

function petNameGenerator(name) {
    if(name.charAt(2) == 'a' || name.charAt(2) == 'e' || name.charAt(2) == 'i' || name.charAt(2) == 'o' || name.charAt(2) == 'u' ) {
        return name.slice(0,4);
    }
    return name.slice(0,3);
}

console.log(petNameGenerator('Sachin'));
console.log(petNameGenerator('Elon'));