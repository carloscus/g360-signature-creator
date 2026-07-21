/**
 * Valida los campos obligatorios y el formato de correo electrónico.
 * @returns {boolean} True si todos los campos son válidos.
 */
export function validateFields() {
  const nameInput = document.getElementById("name");
  const positionInput = document.getElementById("position");
  const emailInput = document.getElementById("email");
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");

  let isValid = true;

  if (!nameInput.value.trim()) {
    nameInput.classList.add("error");
    if (nameError) nameError.style.display = "inline";
    isValid = false;
  } else {
    nameInput.classList.remove("error");
    if (nameError) nameError.style.display = "none";
  }

  if (positionInput) {
    positionInput.classList.remove("error");
  }

  if (emailInput) {
    const email = emailInput.value.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (email && !emailPattern.test(email)) {
      emailInput.classList.add("error");
      if (emailError) emailError.style.display = "inline";
      isValid = false;
    } else {
      emailInput.classList.remove("error");
      if (emailError) emailError.style.display = "none";
    }
  }

  return isValid;
}

/**
 * Sanitiza una cadena de texto para prevenir ataques XSS.
 * @param {string} str - La cadena a sanitizar.
 * @returns {string} La cadena sanitizada.
 */
export function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
