// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                services: document.getElementById('services').value,
                budget: document.getElementById('budget').value,
                message: document.getElementById('message').value
            };

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            fetch('https://formspree.io/f/maqvppww', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    submitButton.textContent = 'Message Sent!';
                    contactForm.reset();

                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.style.cssText = 'margin-top:1rem;padding:1rem;background:var(--bark);color:var(--cream);text-align:center;';
                    successMessage.textContent = "Thank you! We'll be in touch within 24–48 hours.";
                    contactForm.appendChild(successMessage);

                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        successMessage.remove();
                    }, 5000);
                } else {
                    throw new Error('Submission failed');
                }
            })
            .catch(() => {
                submitButton.textContent = 'Error — Try Again';
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }, 3000);
            });
        });

        // Field validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value) {
                    this.style.borderColor = 'var(--ink)';
                } else {
                    this.style.borderColor = '';
                }
            });
            input.addEventListener('focus', function() {
                this.style.borderColor = '';
            });
        });
    }
});
