// --- Global Constants ---
const quoteForm = document.getElementById('quote-form');
let currentStep = 1;
const totalSteps = 3;

// Prevents the page from jumping to the form when it first loads or resets
let isInitialLoad = true; 

// --- Quote Form Logic ---
if (quoteForm) {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const steps = document.querySelectorAll('.step');
    const serviceTypeSelect = document.getElementById('service-type');
    
    const cctvOptions = document.getElementById('cctv-options');
    const electricalOptions = document.getElementById('electrical-options');
    const housingQuestion = document.getElementById('housing-question');

    function updateFormVisibility() {
        // 1. Show/hide steps
        steps.forEach(step => {
            step.classList.add('d-none');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.remove('d-none');
            }
        });

        // 2. Manage Navigation Buttons
        prevBtn.classList.toggle('d-none', currentStep === 1);
        nextBtn.classList.toggle('d-none', currentStep === totalSteps);
        submitBtn.classList.toggle('d-none', currentStep !== totalSteps);
        
        // 3. Update Service-Specific Questions on Step 2
        if (currentStep === 2) {
            const serviceType = serviceTypeSelect.value;
            
            cctvOptions.classList.add('d-none');
            electricalOptions.classList.add('d-none');
            housingQuestion.classList.add('d-none');

            document.querySelectorAll('#cctv-options input').forEach(el => el.required = false);
            document.querySelectorAll('#electrical-options input').forEach(el => el.required = false);
            document.getElementById('house-size').required = false;

            if (serviceType === 'cctv') {
                cctvOptions.classList.remove('d-none');
                document.querySelectorAll('#cctv-options input').forEach(el => el.required = true);
            } else if (serviceType === 'electrical') {
                electricalOptions.classList.remove('d-none');
                document.querySelectorAll('#electrical-options input').forEach(el => el.required = true);
            }

            if (serviceType === 'cctv' || serviceType === 'electrical' || serviceType === 'gates') {
                housingQuestion.classList.remove('d-none');
                document.getElementById('house-size').required = true;
            }
        }
        
        // Only scroll to the form if it's NOT the initial load/reset
        if (!isInitialLoad) {
            quoteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            isInitialLoad = false; 
        }
    }
    
    updateFormVisibility();

    // --- Step Navigation Logic ---
    nextBtn.addEventListener('click', () => {
        const currentStepElement = document.querySelector(`.step-${currentStep}`);
        const inputs = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) isValid = false;
        });
        
        if (isValid) {
            quoteForm.classList.remove('was-validated');
            currentStep++;
            updateFormVisibility();
        } else {
            quoteForm.classList.add('was-validated');
        }
    });

    prevBtn.addEventListener('click', () => {
        quoteForm.classList.remove('was-validated');
        currentStep--;
        updateFormVisibility();
    });

    serviceTypeSelect.addEventListener('change', () => {
        if (currentStep === 2) updateFormVisibility();
    });

    // --- Final Submission Logic (Web3Forms) ---
    quoteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;
        const messageElement = document.getElementById('quote-message');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        form.classList.remove('was-validated');

        const formData = new FormData(form);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(async (response) => {
            if (response.status === 200) {
                const name = document.getElementById('name').value;
                
                // 1. Set message and styling
                messageElement.textContent = `Thank you, ${name}! Your quote request has been sent successfully.`;
                messageElement.classList.remove('d-none', 'text-danger');
                messageElement.classList.add('text-success', 'alert', 'alert-success', 'm-3');

                // 2. Reset form and return to Step 1
                form.reset();
                currentStep = 1;
                isInitialLoad = true; // Set to true so updateFormVisibility doesn't scroll to form center
                updateFormVisibility();

                // 3. Scroll to the very top of the page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } else {
                messageElement.textContent = "Something went wrong. Please try again or call us.";
                messageElement.classList.remove('d-none', 'text-success');
                messageElement.classList.add('text-danger', 'alert', 'alert-danger', 'm-3');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })
        .catch(error => {
            messageElement.textContent = "Could not connect. Please check your internet connection.";
            messageElement.classList.remove('d-none', 'text-success');
            messageElement.classList.add('text-danger', 'alert', 'alert-danger', 'm-3');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .finally(() => {
            submitButton.textContent = 'Submit for Free Quote';
            submitButton.disabled = false;
        });
    });
}