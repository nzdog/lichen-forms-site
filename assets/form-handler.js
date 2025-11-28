// Form submission handler for Notion integration

function setupFormHandler(formId, endpoint, formType = null) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Add form type for follow-up forms
    if (formType) {
      data.formType = formType;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to thank you page on success
        const action = form.getAttribute('action');
        if (action) {
          window.location.href = action;
        } else {
          alert('Form submitted successfully!');
          form.reset();
        }
      } else {
        // Show error message
        alert(`Error: ${result.error || 'Failed to submit form. Please try again.'}`);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Network error. Please check your connection and try again.');
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Initialize forms when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Intake form
  setupFormHandler('field-questionnaire', '/.netlify/functions/submit-intake');

  // 24-hour follow-up form
  setupFormHandler('followup-24h-form', '/.netlify/functions/submit-followup', '24h');

  // 7-day follow-up form
  setupFormHandler('followup-7d-form', '/.netlify/functions/submit-followup', '7d');
});
