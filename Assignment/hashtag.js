/* Input: hashTag('makeinindia')
   Output: #MakeInIndia
*/


function hashTag(tag) {
    var arr = tag.split(' ');
    var hash = '#';
    arr.forEach(function(a) {
        hash+= a.charAt(0).toUpperCase() + a.slice(1);
    })
    return hash;
}

console.log(hashTag('make in india'));