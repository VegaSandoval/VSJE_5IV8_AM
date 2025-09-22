document.addEventListener('DOMContentLoaded', () => {
  const letras = ['T','R','W','A','G','M','Y','F','P','D','X','B','N','J','Z','S','Q','V','H','L','C','K','E','T'];

  const form = document.getElementById('dniForm');
  const dniNumber = document.getElementById('dniNumber');
  const dniLetter = document.getElementById('dniLetter');
  const message = document.getElementById('message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const num = parseInt(dniNumber.value, 10);
    const letra = dniLetter.value.toUpperCase();

    // Validar rango
    if (num < 0 || num > 99999999 || isNaN(num)) {
      message.textContent = "Número proporcionado no válido.";
      return;
    }

    const resto = num % 23;
    const letraCorrecta = letras[resto];

    if (letra !== letraCorrecta) {
      message.textContent = `Letra incorrecta. Debería ser ${letraCorrecta}.`;
    } else {
      message.textContent = `DNI correcto: ${num}${letra}`;
    }
  });
});