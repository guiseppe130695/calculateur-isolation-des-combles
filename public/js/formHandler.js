async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) return;

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
        
        // Update URL without page reload
        history.pushState({}, '', '/');
    } catch (error) {
        console.error('Error:', error);
    }
}

function validateForm() {
    const requiredFields = [
        { name: 'habitation', message: 'Veuillez sélectionner un type d\'habitation' },
        { name: 'isolation_existante', message: 'Veuillez indiquer l\'état de votre isolation actuelle' },
        { name: 'surface', message: 'Veuillez sélectionner une surface approximative' },
        { name: 'materiau', message: 'Veuillez choisir un matériau d\'isolation' },
        { name: 'budget', message: 'Veuillez sélectionner une tranche de budget' },
        { name: 'aides', message: 'Veuillez indiquer votre intérêt pour les aides financières' }
    ];

    for (const field of requiredFields) {
        const inputs = document.querySelectorAll(`input[name="${field.name}"]`);
        let isSelected = false;

        inputs.forEach(input => {
            if ((input.type === 'radio' || input.type === 'checkbox') && input.checked) {
                isSelected = true;
            }
        });

        if (!isSelected) {
            alert(field.message);
            return false;
        }
    }

    // Vérification spéciale pour les préoccupations (optionnel)
    const preoccupationsInputs = document.querySelectorAll('input[name="preoccupations[]"]');
    let hasPreoccupations = false;
    preoccupationsInputs.forEach(input => {
        if (input.checked) {
            hasPreoccupations = true;
        }
    });

    return true;
}