var passwords = [
    'Password123',
    'dct@academy',
    'qwerty',
    'secret123',
    'gopro123',
    'harryp@tter'
  ];

function authenticate(passwords, pass) {
    var status;
    for(var i=0;i<passwords.length;i++) {
        if(passwords[i] == pass) {
            status = 'authenticated';
            break;
        }
        else
        {
            status = 'not authenticated';
        }
    };
    return status;
}

console.log(authenticate(passwords, 'Password123')); //authenticated
console.log(authenticate(passwords, 'Balrog'));  //not authenticated