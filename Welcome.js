const og = 'http://localhost:3000/'
document.getElementById('messaging').href = og+'messaging.html'
document.getElementById('login').href = og+'login.html'
document.getElementById('RegistrationPage').href = og+'RegistrationPage.html'

if(document.cookie != []){
    $("#other").append(`<p>hello ${document.cookie}</p>`)
}