document.addEventListener('DOMContentLoaded', function() {
    // Check if the page was reached via browser navigation (back/forward)
    if (performance.navigation.type === 1 || !sessionStorage.getItem('splashShown')) {
        // Create and show splash screen on refresh or first visit
        const splashScreen = document.createElement('div');
        splashScreen.className = 'splash-screen';
        
        // Create logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        
        // Create logo image
        const logo = document.createElement('img');
        logo.src = 'images/logo.png';  // Make sure to add your logo image to this path
        logo.alt = 'App Logo';
        logoContainer.appendChild(logo);
        
        // Add app name
        const appName = document.createElement('div');
        appName.className = 'app-name';
        appName.textContent = 'My Portfolio';
        
        // Add elements to splash screen
        splashScreen.appendChild(logoContainer);
        splashScreen.appendChild(appName);
        document.body.appendChild(splashScreen);
        
        // Remove splash screen after animation
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.remove();
            }, 500);
        }, 2000);

        // Mark that splash screen has been shown
        sessionStorage.setItem('splashShown', 'true');
    }
});
