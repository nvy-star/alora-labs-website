// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Create submit button reference
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Add event listener for form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                services: document.getElementById('services').value,
                budget: document.getElementById('budget').value,
                message: document.getElementById('message').value
            };
            
            // Update button state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                // Success state
                submitButton.textContent = 'Message Sent!';
                submitButton.style.background = 'var(--color-sage)';
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.style.cssText = `
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--color-sage);
                    color: white;
                    text-align: center;
                    border-radius: 2px;
                `;
                successMessage.textContent = 'Thank you! We\'ll be in touch within 24-48 hours.';
                contactForm.appendChild(successMessage);
                
                // Reset form
                contactForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    submitButton.style.background = '';
                    successMessage.remove();
                }, 5000);
            }, 1500);
            
            // In production, replace the above with actual form submission:
            /*
            fetch('your-form-endpoint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                // Handle success
                submitButton.textContent = 'Message Sent!';
                contactForm.reset();
            })
            .catch(error => {
                // Handle error
                submitButton.textContent = 'Error - Try Again';
                submitButton.style.background = 'var(--color-rose)';
            })
            .finally(() => {
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    submitButton.style.background = '';
                }, 3000);
            });
            */
        });
        
        // Form validation enhancement
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value) {
                    this.style.borderColor = 'var(--color-rose)';
                } else {
                    this.style.borderColor = '';
                }
            });
            
            input.addEventListener('focus', function() {
                this.style.borderColor = 'var(--color-rose)';
            });
        });
    }
});
