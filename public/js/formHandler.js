let currentStep = 0;
const totalSteps = document.querySelectorAll('.step').length;

function showStep(stepIndex) {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.style.display = index === stepIndex ? 'block' : 'none';
    });
    
    updateProgress(stepIndex);
    updateNavigationButtons(stepIndex);
}

function updateProgress(stepIndex) {
    const progressBar = document.querySelector('.progress-bar-inner');
    const progressText = document.querySelector('.progress-text');
    const progress = ((stepIndex + 1) / totalSteps) * 100;
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Étape ${stepIndex + 1} sur ${totalSteps}`;
}

function updateNavigationButtons(stepIndex) {
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const submitButton = document.querySelector('.submit-button');
    
    prevButton.style.display = stepIndex === 0 ? 'none' : 'block';
    nextButton.style.display = stepIndex === totalSteps - 1 ? 'none' : 'block';
    submitButton.style.display = stepIndex === totalSteps - 1 ? 'block' : 'none';
}

function nextStep() {
    if (validateStep() && currentStep < totalSteps - 1) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

function validateStep() {
    const currentStepElement = document.querySelectorAll('.step')[currentStep];
    const radioGroups = currentStepElement.querySelectorAll('input[type="radio"]');
    const checkboxGroups = currentStepElement.querySelectorAll('input[type="checkbox"]');
    
    // Vérifier les boutons radio
    const radioGroupNames = new Set([...radioGroups].map(radio => radio.name));
    for (const groupName of radioGroupNames) {
        const checked = currentStepElement.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) {
            alert('Veuillez répondre à toutes les questions avant de continuer.');
            return false;
        }
    }
    
    // Vérifier les cases à cocher (uniquement si présentes et dernière étape)
    if (checkboxGroups.length > 0 && currentStep === totalSteps - 1) {
        const checkboxGroupNames = new Set([...checkboxGroups].map(checkbox => checkbox.name));
        for (const groupName of checkboxGroupNames) {
            const checked = currentStepElement.querySelector(`input[name="${groupName}"]:checked`);
            if (!checked) {
                alert('Veuillez sélectionner au moins une préoccupation.');
                return false;
            }
        }
    }
    
    return true;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateStep()) return;

    const formData = new FormData(event.target);
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            body: new URLSearchParams(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const html = await response.text();
        document.querySelector('.container').innerHTML = html;
        
        history.pushState({}, '', '/');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);
});