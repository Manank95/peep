function checkPasswdInput() {
    let passwd1 = document.querySelector('#passwd1');
    let passwd2 = document.querySelector('#passwd2');
    if (passwd1.value != passwd2.value) {
        event.preventDefault();
        alert('Two passwords do not match');
    }
}

function checkChange() {
    let passwd1 = document.querySelector('#passwd1');
    let passwd2 = document.querySelector('#passwd2');
    if (passwd1.value != passwd2.value) {
        event.preventDefault();
        alert('Two passwords do not match');
        return;
    }
    let f = confirm('Sure to submit change?');
    if(!f) event.preventDefault();
}