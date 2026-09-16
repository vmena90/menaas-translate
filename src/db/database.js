import Dexie from 'dexie';
import { encryptText, decryptText, encryptBlob, decryptBlob } from './crypto';

// Inicializar la base de datos Dexie
const db = new Dexie('VoiceClassDB');

// Definir el esquema de la base de datos (versión 1)
db.version(1).stores({
  subjects: '++id, name, color, icon, createdAt, updatedAt',
  recordings: '++id, subjectId, name, date, audioBlob, mimeType, audioDuration, transcription, translation, sourceLang, targetLang, createdAt'
});

// Funciones auxiliares para subjects (asignaturas)
export const getAllSubjects = async () => {
  return await db.subjects.orderBy('createdAt').reverse().toArray();
};

export const getSubject = async (id) => {
  return await db.subjects.get(id);
};

export const addSubject = async ({ name, color, icon }) => {
  const now = Date.now();
  return await db.subjects.add({
    name,
    color,
    icon,
    createdAt: now,
    updatedAt: now
  });
};

export const updateSubject = async (id, changes) => {
  return await db.subjects.update(id, {
    ...changes,
    updatedAt: Date.now()
  });
};

export const deleteSubject = async (id) => {
  // Iniciar una transacción para asegurar que todo se elimina correctamente
  return await db.transaction('rw', db.subjects, db.recordings, async () => {
    // Eliminar las grabaciones asociadas
    await db.recordings.where('subjectId').equals(id).delete();
    // Eliminar la asignatura
    await db.subjects.delete(id);
  });
};

// Funciones auxiliares para recordings (grabaciones)
export const getRecordingsBySubject = async (subjectId) => {
  const recordings = await db.recordings
    .where('subjectId')
    .equals(subjectId)
    .reverse()
    .sortBy('createdAt');
    
  return Promise.all(recordings.map(async (rec) => ({
    ...rec,
    transcription: await decryptText(rec.transcription),
    translation: await decryptText(rec.translation),
    audioBlob: await decryptBlob(rec.audioBlob, rec.iv)
  })));
};

export const getRecording = async (id) => {
  const rec = await db.recordings.get(id);
  if (!rec) return null;
  return {
    ...rec,
    transcription: await decryptText(rec.transcription),
    translation: await decryptText(rec.translation),
    audioBlob: await decryptBlob(rec.audioBlob, rec.iv)
  };
};

export const addRecording = async ({ subjectId, name, audioBlob, mimeType, audioDuration, transcription, translation, sourceLang, targetLang }) => {
  const now = Date.now();
  
  // Encrypt sensitive data
  const encTrans = await encryptText(transcription);
  const encTransl = await encryptText(translation);
  let finalBlob = audioBlob;
  let iv = null;
  
  if (audioBlob) {
    const encResult = await encryptBlob(audioBlob);
    if (encResult) {
      finalBlob = encResult.encryptedBlob;
      iv = encResult.iv;
    }
  }

  return await db.recordings.add({
    subjectId,
    name,
    audioBlob: finalBlob,
    iv,
    mimeType,
    audioDuration,
    transcription: encTrans,
    translation: encTransl,
    sourceLang,
    targetLang,
    date: now,
    createdAt: now
  });
};

export const updateRecording = async (id, changes) => {
  return await db.recordings.update(id, changes);
};

export const deleteRecording = async (id) => {
  return await db.recordings.delete(id);
};

export const getRecordingCount = async (subjectId) => {
  return await db.recordings.where('subjectId').equals(subjectId).count();
};


// Alias para compatibilidad
export const getSubjectById = getSubject;
export const getRecordingById = getRecording;

// Limpiar toda la base de datos
export const clearAllData = async () => {
  return await db.transaction('rw', db.subjects, db.recordings, async () => {
    await db.subjects.clear();
    await db.recordings.clear();
  });
};

export default db;
