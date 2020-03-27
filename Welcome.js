const og = 'http://localhost:3000/'
document.getElementById('messaging').href = og+'messaging.html'
document.getElementById('login').href = og+'login.html'
document.getElementById('RegistrationPage').href = og+'RegistrationPage.html'

if(document.cookie != []){
    let user
    let x = JSON.stringify(document.cookie.split(';'))
    x.split("=")
    console.log(typeof(x))
    // array.forEach(element => {
    //     if(element === 'username'){
    //         user = x.indexOf(element+1)
    //     }
    // });

    $("#other").append(`<p>hello ${user}</p>`)
}