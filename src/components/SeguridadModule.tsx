import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import {
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  Key,
  History,
  CheckCircle2,
  XCircle,
  Smartphone,
  Briefcase,
  AlertCircle,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  UserCheck,
  Shield,
  ShieldAlert,
  X,
} from 'lucide-react';

export const SeguridadModule: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    switchUserRole,
    auditoriaLogs,
    users,
    addUser,
    updateUser,
    deleteUser,
    pilotos,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'roles' | 'bitacora'>('usuarios');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for creating/editing user
  const [formNombre, setFormNombre] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formRol, setFormRol] = useState<UserRole>('ADMIN');
  const [formCargo, setFormCargo] = useState('');
  const [formPassword, setFormPassword] = useState('admin');
  const [formPilotoId, setFormPilotoId] = useState('');
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  const openCreateModal = () => {
    setEditingUser(null);
    setFormNombre('');
    setFormUsername('');
    setFormEmail('');
    setFormTelefono('+502 ');
    setFormRol('ADMIN');
    setFormCargo('Administrador Operativo');
    setFormPassword('admin');
    setFormPilotoId('');
    setFormEstado('Activo');
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormNombre(user.nombre);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormTelefono(user.telefono || '+502 ');
    setFormRol(user.rol === 'DUENO' ? 'ADMIN' : user.rol);
    setFormCargo(user.cargo);
    setFormPassword(user.password || 'admin');
    setFormPilotoId(user.pilotoId || '');
    setFormEstado(user.estado || 'Activo');
    setShowAddModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        nombre: formNombre.trim(),
        username: formUsername.trim(),
        email: formEmail.trim(),
        telefono: formTelefono.trim(),
        rol: formRol,
        cargo: formCargo.trim(),
        password: formPassword.trim(),
        pilotoId: formRol === 'OPERADOR' || formRol === 'PILOTO' ? formPilotoId || undefined : undefined,
        estado: formEstado,
      });
      setFeedbackMsg({
        type: 'success',
        text: `Usuario "${formNombre}" actualizado exitosamente.`,
      });
      setShowAddModal(false);
    } else {
      // Create new user
      const result = addUser({
        nombre: formNombre.trim(),
        username: formUsername.trim(),
        email: formEmail.trim(),
        telefono: formTelefono.trim(),
        rol: formRol,
        cargo: formCargo.trim() || (formRol === 'ADMIN' ? 'Administrador' : formRol === 'SUPERVISOR' ? 'Supervisor' : 'Operador'),
        password: formPassword.trim() || 'admin',
        pilotoId: formRol === 'OPERADOR' || formRol === 'PILOTO' ? formPilotoId || undefined : undefined,
        estado: formEstado,
      });

      if (!result.success) {
        setFeedbackMsg({
          type: 'error',
          text: result.error || 'Error al crear el usuario.',
        });
        return;
      }

      setFeedbackMsg({
        type: 'success',
        text: `Usuario "${formNombre}" registrado con éxito. Ahora puede iniciar sesión con la contraseña indicada.`,
      });
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Confirma que desea eliminar el usuario "${nombre}"?`)) {
      const res = deleteUser(id);
      if (!res.success) {
        setFeedbackMsg({ type: 'error', text: res.error || 'Error al eliminar usuario' });
      } else {
        setFeedbackMsg({ type: 'success', text: `Usuario "${nombre}" eliminado correctamente.` });
      }
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const isCurrentAdmin = currentUser.rol === 'ADMIN' || currentUser.rol === 'DUENO';

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.cargo.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const ROLES_INFO: {
    role: UserRole;
    title: string;
    description: string;
    badgeColor: string;
    permissions: { name: string; allowed: boolean }[];
  }[] = [
    {
      role: 'ADMIN',
      title: 'Administrador (Jairo Dannas / Gerencia / Operativo)',
      description:
        'Control integral de la flota de góndolas: clientes, pilotos, viajes por buque, pesaje de báscula en muelle, facturación, retenciones IVA/ISR, gastos de combustible, reportes y registro de nuevos usuarios.',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      permissions: [
        { name: 'Acceso Total a Datos Financieros y Márgenes', allowed: true },
        { name: 'Cuentas Bancarias de los 3 Hermanos (Dannas)', allowed: true },
        { name: 'Emisión y Modificación de Facturas', allowed: true },
        { name: 'Conciliación Bancaria y Retenciones', allowed: true },
        { name: 'Creación y Asignación de Viajes por Buque', allowed: true },
        { name: 'Registro de Pesaje en Básculas', allowed: true },
        { name: 'Configuración Parámetros Combustible', allowed: true },
        { name: 'Registro y Administración de Nuevos Usuarios', allowed: true },
        { name: 'Bitácora de Auditoría del Sistema', allowed: true },
      ],
    },
    {
      role: 'SUPERVISOR',
      title: 'Supervisor de Operaciones (Muelle y Puerto)',
      description:
        'Consulta de viajes asignados por buque, coordinación de pilotos y góndolas, registro y validación de boletas de pesaje en báscula. Sin acceso a cuentas bancarias privadas ni facturación.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      permissions: [
        { name: 'Acceso Total a Datos Financieros y Márgenes', allowed: false },
        { name: 'Cuentas Bancarias de los 3 Hermanos (Dannas)', allowed: false },
        { name: 'Emisión y Modificación de Facturas', allowed: false },
        { name: 'Conciliación Bancaria y Retenciones', allowed: false },
        { name: 'Creación y Asignación de Viajes por Buque', allowed: true },
        { name: 'Registro de Pesaje en Básculas', allowed: true },
        { name: 'Configuración Parámetros Combustible', allowed: false },
        { name: 'Registro y Administración de Nuevos Usuarios', allowed: false },
        { name: 'Bitácora de Auditoría del Sistema', allowed: true },
      ],
    },
    {
      role: 'OPERADOR',
      title: 'Operador / Piloto de Góndola',
      description:
        'Acceso móvil optimizado para conductores de góndolas. Permite ver viajes asignados por fecha y buque, registrar salida/llegada y cargar pesos de báscula de sus propios viajes.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      permissions: [
        { name: 'Acceso Total a Datos Financieros y Márgenes', allowed: false },
        { name: 'Cuentas Bancarias de los 3 Hermanos (Dannas)', allowed: false },
        { name: 'Emisión y Modificación de Facturas', allowed: false },
        { name: 'Conciliación Bancaria y Retenciones', allowed: false },
        { name: 'Creación y Asignación de Viajes por Buque', allowed: false },
        { name: 'Registro de Pesaje en Básculas (Sus Viajes)', allowed: true },
        { name: 'Configuración Parámetros Combustible', allowed: false },
        { name: 'Registro y Administración de Nuevos Usuarios', allowed: false },
        { name: 'Bitácora de Auditoría del Sistema', allowed: false },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Seguridad Corporativa, Usuarios y Control de Acceso
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              Sesión: {currentUser.rol === 'DUENO' ? 'ADMINISTRADOR' : currentUser.rol}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración centralizada de cuentas de usuario, asignación de perfiles, control de accesos (RBAC) y bitácora de auditoría.
          </p>
        </div>

        {/* Action Button for Administrator */}
        {isCurrentAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2.5 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('usuarios')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'usuarios'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Registrados ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriz de Permisos (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bitacora')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'bitacora'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora de Auditoría ({auditoriaLogs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: USUARIOS REGISTRADOS Y GESTIÓN */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Top Bar with Search & Info */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-[11px] text-slate-500">
                Total cuentas registradas: <strong>{filteredUsers.length}</strong>
              </span>
              {isCurrentAdmin && (
                <button
                  onClick={openCreateModal}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 border border-blue-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Nuevo Usuario</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Users */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nombre y Cargo</th>
                    <th className="px-4 py-3">Usuario (Login)</th>
                    <th className="px-4 py-3">Rol del Sistema</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Contraseña</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser.id === u.id;
                    const isPrimaryAdmin = u.username === 'jairo.dannas';
                    const isPassVisible = visiblePasswords[u.id] || false;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {u.nombre.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.nombre}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px]">{u.cargo}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <code className="font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                            {u.username}
                          </code>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.rol === 'ADMIN' || u.rol === 'DUENO'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : u.rol === 'SUPERVISOR'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-purple-100 text-purple-800 border-purple-300'
                            }`}
                          >
                            {u.rol === 'ADMIN' || u.rol === 'DUENO'
                              ? 'Administrador'
                              : u.rol === 'SUPERVISOR'
                              ? 'Supervisor'
                              : 'Piloto / Operador'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-800">{u.email}</div>
                          <div className="text-slate-400 text-[11px]">{u.telefono}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span>{isPassVisible ? u.password || 'admin' : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title={isPassVisible ? 'Ocultar' : 'Mostrar contraseña'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (u.estado || 'Activo') === 'Activo'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {u.estado || 'Activo'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            {isCurrentAdmin && (
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Editar datos del usuario"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Button */}
                            {isCurrentAdmin && !isPrimaryAdmin && (
                              <button
                                onClick={() => handleDelete(u.id, u.nombre)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MATRIZ DE PERMISOS */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>Matriz Institucional de Control de Acceso (RBAC)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              En cumplimiento con la política de seguridad corporativa, el cambio de usuario y rol se realiza exclusivamente cerrando sesión e ingresando las credenciales autorizadas en la pantalla de inicio de sesión. Para asignar estos perfiles a nuevos colaboradores, utilice la pestaña <strong className="text-white">"Usuarios Registrados"</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES_INFO.map((r) => {
              const isCurrent = currentUser.rol === r.role || (r.role === 'ADMIN' && currentUser.rol === 'DUENO');

              return (
                <div
                  key={r.role}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                        {r.role === 'ADMIN' ? 'ADMINISTRADOR' : r.role}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          ● Sesión Actual
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                    </div>

                    {/* Permissions list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      {r.permissions.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className={p.allowed ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                            {p.name}
                          </span>
                          {p.allowed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold text-center ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}
                    >
                      {isCurrent ? 'Perfil en Uso' : 'Asignable al Registrar Usuario'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: BITÁCORA DE AUDITORÍA */}
      {activeSubTab === 'bitacora' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Bitácora de Auditoría en Tiempo Real
              </h3>
              <p className="text-xs text-slate-500">
                Registro inmutable de acciones críticas (viajes, pesajes, facturas, cobros y administración de usuarios).
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {auditoriaLogs.length} eventos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Usuario Responsable</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Módulo</th>
                  <th className="px-4 py-3">Acción Realizada</th>
                  <th className="px-4 py-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditoriaLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{log.fechaHora}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.usuarioNombre}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.usuarioRol === 'DUENO' ? 'ADMIN' : log.usuarioRol}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{log.modulo}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{log.accion}</td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] max-w-md truncate" title={log.detalles}>
                      {log.detalles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR / EDITAR USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser
                      ? 'Actualice los datos y permisos de la cuenta'
                      : 'El nuevo usuario podrá acceder inmediatamente'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              {/* Nombre Completo */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej. Carlos Dannas, Lic. Roberto Gómez"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Username & Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Usuario de Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="ej. carlos.dannas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rol en SIGETRAD *
                  </label>
                  <select
                    value={formRol}
                    onChange={(e) => setFormRol(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold bg-white"
                  >
                    <option value="ADMIN">Administrador (Control Total)</option>
                    <option value="SUPERVISOR">Supervisor (Muelle / Básculas)</option>
                    <option value="OPERADOR">Piloto / Operador (Góndolas)</option>
                  </select>
                </div>
              </div>

              {/* Cargo / Puesto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo / Puesto Formal
                </label>
                <input
                  type="text"
                  value={formCargo}
                  onChange={(e) => setFormCargo(e.target.value)}
                  placeholder="Ej. Administrador de Flota, Supervisor de Muelle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Email & Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="correo@transportesdannas.gt"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    placeholder="+502 5555-1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Contraseña & Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Por defecto: admin</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as 'Activo' | 'Inactivo')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              {/* Vinculación con Piloto si es Operador */}
              {(formRol === 'OPERADOR' || formRol === 'PILOTO') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <label className="block font-semibold text-amber-900">
                    Vincular con Piloto de Flota (Opcional):
                  </label>
                  <select
                    value={formPilotoId}
                    onChange={(e) => setFormPilotoId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                  >
                    <option value="">-- Sin vincular directamente --</option>
                    {pilotos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.alias}) • Lic. {p.tipoLicencia}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
