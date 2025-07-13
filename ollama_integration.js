const { exec } = require('child_process');

// Funktion, um Ollama mit einem Prompt zu starten und die Antwort zurückzugeben
function runOllama(prompt, callback) {
  const command = `ollama run gemma:2b --prompt "${prompt}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(`Fehler: ${error.message}`, null);
      return;
    }
    if (stderr) {
      callback(`Stderr: ${stderr}`, null);
      return;
    }
    callback(null, stdout.trim());
  });
}

// Beispielaufruf
const testPrompt = "Hallo Ollama! Wie geht's dir heute?";

runOllama(testPrompt, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Antwort von Ollama:", result);
  }
});

