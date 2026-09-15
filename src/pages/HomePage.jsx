import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SubjectModal from '../components/SubjectModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getAllSubjects, addSubject, updateSubject, deleteSubject, getRecordingCount } from '../db/database';

export default function HomePage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);

  // Estados del diálogo de confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // Estado del menú de acciones (para long press / context menu)
  const [activeMenuId, setActiveMenuId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allSubjects = await getAllSubjects();
      const subjectsWithCounts = await Promise.all(
        (allSubjects || []).map(async (sub) => {
          const count = await getRecordingCount(sub.id);
          return { ...sub, count };
        })
      );
      setSubjects(subjectsWithCounts);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Cerrar el menú contextual al hacer clic en cualquier otro lado
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSaveSubject = async ({ name, color, icon }) => {
    try {
      if (subjectToEdit) {
        await updateSubject(subjectToEdit.id, { name, color, icon });
      } else {
        await addSubject({ name, color, icon });
      }
      setIsModalOpen(false);
      setSubjectToEdit(null);
      await loadData();
    } catch (error) {
      console.error('Error al guardar asignatura:', error);
    }
  };

  const handleEdit = (subject, e) => {
    e.stopPropagation();
    setSubjectToEdit(subject);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteRequest = (subject, e) => {
    e.stopPropagation();
    setSubjectToDelete(subject);
    setIsConfirmOpen(true);
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (subjectToDelete) {
      try {
        await deleteSubject(subjectToDelete.id);
        setIsConfirmOpen(false);
        setSubjectToDelete(null);
        await loadData();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleContextMenu = (e, subjectId) => {
    e.preventDefault(); // Prevenir el menú contextual nativo
    setActiveMenuId(activeMenuId === subjectId ? null : subjectId);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img alt="Vocalis Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUm0QHSG4LJLncKxpuv0il3pw2dKgS5NKEN7yluC06HD7-i1_PLNdGWpgk0eqBnmlWTewXm8liQl_sNrQF2XKu7leh8NynF1BqhbmkuFL-pvAJDJkeL1jzcuqd576Y9oQcByW3Qwj9j5iYY2QQdEjT7U84RfR2QasB8UG9lU4G2uvB9AjeJXG_sYjsHZyxp9_JC5CCkWmHP0IgdOhpq_5ga0uVgZwPdC-RaqPKK3pNr81DEC5uYP0w"/>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-secondary uppercase tracking-widest">Menaa's Translate</span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[160px]">Asignaturas</h1>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            {/* Removed search and profile pic */}
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-lg">
          {/* Top Action & Search Bar Section */}
          <section className="flex flex-col gap-space-md pt-space-xs">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">Semestre Primavera 2025</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Mis Asignaturas</h2>
              </div>
              <button 
                onClick={() => {
                  setSubjectToEdit(null);
                  setIsModalOpen(true);
                }}
                aria-label="Crear nueva asignatura" 
                className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-space-sm rounded-full shadow-lg active:scale-95 transition-transform" 
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-body-sm text-body-sm font-semibold">Nueva</span>
              </button>
            </div>
            {/* Search & Filter Capsule */}
            <div className="flex items-center gap-space-xs bg-surface-container-high rounded-full px-space-md py-space-xs shadow-sm">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input className="bg-transparent flex-1 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none" placeholder="Buscar temas, conceptos o audios..." type="text"/>
              <button className="flex items-center gap-1 bg-surface-container-highest text-on-surface-variant hover:text-on-surface px-space-sm py-1 rounded-full text-caption font-caption transition-colors">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>Filtro</span>
              </button>
            </div>
          </section>


          {/* Section: Asignaturas Grid */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Asignaturas en Curso</span>
              <span className="font-caption text-caption text-secondary">Organizado por prioridad</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface-container rounded-lg">
                  <span className="text-4xl mb-4">📚</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">No hay asignaturas</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Crea tu primera asignatura para comenzar a organizar tus grabaciones.</p>
                  <button 
                    onClick={() => {
                      setSubjectToEdit(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-primary text-on-primary px-space-lg py-space-sm rounded-full font-semibold"
                  >
                    Crear Asignatura
                  </button>
                </div>
              ) : (
                subjects.map(subject => (
                  <div key={subject.id} className="group relative overflow-hidden bg-surface-container rounded-lg p-space-md shadow-md active:scale-[0.99] transition-transform cursor-pointer">
                    <div onContextMenu={(e) => handleContextMenu(e, subject.id)}>
                      <div className="flex items-start justify-between gap-space-sm mb-space-sm" onClick={() => navigate(`/subject/${subject.id}`)}>
                        <div className="flex items-center gap-space-sm">
                          <div className="w-11 h-11 rounded-DEFAULT bg-primary-container/20 flex items-center justify-center text-[22px] shadow-sm" style={{ color: subject.color }}>
                            {subject.icon}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{subject.name}</h3>
                            <div className="flex items-center gap-space-xs mt-0.5">
                              <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-semibold" style={{ color: subject.color }}>ACTIVA</span>
                              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">{subject.count || 0} audios</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-space-xs mt-space-xs bg-surface-container-low/60 rounded-DEFAULT px-space-sm py-1.5" onClick={() => navigate(`/subject/${subject.id}`)}>
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[16px]" style={{ color: subject.color }}>bolt</span>
                          <span>Abrir asignatura</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                      </div>
                    </div>
                    
                    {activeMenuId === subject.id && (
                      <div className="absolute top-12 right-2 bg-surface-container-high shadow-xl rounded-xl border border-surface-container-highest overflow-hidden z-10 w-32 animate-fade-in">
                        <button onClick={(e) => handleEdit(subject, e)} className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-highest border-b border-surface-container-lowest transition-colors">Editar</button>
                        <button onClick={(e) => handleDeleteRequest(subject, e)} className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors">Eliminar</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>


        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.25)]">
        <div className="flex justify-around items-center h-16 px-gutter-mobile">
          <Link to="/" className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 transition-all text-primary font-semibold">
            <span className="material-symbols-outlined text-[24px]">folder</span>
            <span className="font-caption text-caption">Asignaturas</span>
          </Link>
          <Link to="/recorder" className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 text-on-surface-variant hover:text-on-surface transition-all">
            <div className="w-10 h-10 -mt-3.5 rounded-full bg-primary flex items-center justify-center shadow-[0_4px_16px_rgba(192,193,255,0.35)]">
              <span className="material-symbols-outlined text-on-primary text-[22px]">mic</span>
            </div>
            <span className="font-caption text-caption mt-0.5">Grabadora</span>
          </Link>

          <Link to="/settings" className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 text-on-surface-variant hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="font-caption text-caption">Ajustes</span>
          </Link>
        </div>
      </nav>

      <SubjectModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubjectToEdit(null);
        }} 
        onSave={handleSaveSubject}
        editSubject={subjectToEdit}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Eliminar Asignatura"
        message={`¿Estás seguro de que deseas eliminar "${subjectToDelete?.name}"? Esta acción no se puede deshacer y borrará todas las grabaciones.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSubjectToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
