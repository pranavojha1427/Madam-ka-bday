document.addEventListener("DOMContentLoaded", () => {
    
    // Select all the memory cards we want to animate
    const cards = document.querySelectorAll('.scroll-reveal');

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the card enters the viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the card is visible
    });

    // Attach the observer to every card
    cards.forEach(card => {
        observer.observe(card);
    });

});