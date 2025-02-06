function sendMail() {
    const successMessage = document.getElementById('successMessage');
    
    successMessage.style.display = 'block';

    setTimeout(() => {
        window.location.href = 'index.html'; 
    }, 1000); 
}
