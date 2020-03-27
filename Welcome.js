const og = 'http://localhost:3000/'
document.getElementById('messaging').href = og+'messaging.html'
document.getElementById('login').href = og+'login.html'
document.getElementById('RegistrationPage').href = og+'RegistrationPage.html'

if(document.cookie != [] || ''){
    let user
    let x = JSON.stringify(document.cookie)
    x.split(';')
    if(typeof(x) == "string"){
        let y = x.split('=')
        y.forEach(element=>{
            if(element === '"username' || 'username'){
            $("#other").append(`<p>hello ${y.indexOf(element+1)}</p>`)
        }
    })
    }
}