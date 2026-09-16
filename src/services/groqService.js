export const transcribeAudioWithGroq = async (audioBlob, language) => {
  const formData = new FormData();
  
  // Groq API requere un nombre de archivo con extensión soportada
  // Safari graba en audio/mp4 y Chrome en audio/webm. Ambos soportados si ponemos extensión adecuada.
  const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('file', audioBlob, `recording.${extension}`);
  
  formData.append('model', 'whisper-large-v3');
  
  // Groq / Whisper API mapea 'pt' a portugués.
  if (language) {
    formData.append('language', language);
  }
  
  formData.append('response_format', 'json');

  try {
    const response = await fetch('/api/ai-proxy?action=transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la API de Groq');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};
