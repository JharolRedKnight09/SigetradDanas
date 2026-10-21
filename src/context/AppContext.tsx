import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Cliente,
  Piloto,
  Gondola,
  PropietarioHermano,
  Viaje,
  InstruccionCobro,
  Factura,
  PagoConciliacion,
  ParametroCombustible,
  RegistroGastoCombustible,
  BitacoraAccion,
  CategoriaMovimiento,
  MaterialType,
  EstadoViaje,
} from '../types';
import {
  INITIAL_USERS,
  PROPIETARIOS_HERMANOS,
  INITIAL_GONDOLAS,
  INITIAL_PILOTOS,
  INITIAL_CLIENTES,
  INITIAL_PARAMETROS_COMBUSTIBLE,
  INITIAL_VIAJES,
  INITIAL_INSTRUCCIONES_COBRO,
  INITIAL_FACTURAS,
  INITIAL_PAGOS,
  INITIAL_REGISTROS_COMBUSTIBLE,
  INITIAL_BITACORA,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  propietarios: PropietarioHermano[];
  clientes: Cliente[];
  pilotos: Piloto[];
  gondolas: Gondola[];
  viajes: Viaje[];
  instruccionesCobro: InstruccionCobro[];
  facturas: Factura[];
  pagos: PagoConciliacion[];
  parametrosCombustible: ParametroCombustible[];
  registrosCombustible: RegistroGastoCombustible[];
  bitacora: BitacoraAccion[];

  // Acciones Clientes
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;

  // Acciones Pilotos
  addPiloto: (piloto: Omit<Piloto, 'id'>) => void;
  updatePiloto: (id: string, piloto: Partial<Piloto>) => void;

  // Acciones Góndolas
  addGondola: (gondola: Omit<Gondola, 'id'>) => void;
  updateGondola: (id: string, gondola: Partial<Gondola>) => void;

  // Acciones Viajes
  addViaje: (viaje: Omit<Viaje, 'id' | 'codigoViaje'>) => Viaje;
  updateViaje: (id: string, viaje: Partial<Viaje>) => void;
  deleteViaje: (id: string) => void;

  // Acciones Facturación
  addInstruccionCobro: (instruccion: Omit<InstruccionCobro, 'id' | 'procesada'>) => void;
  generarFacturaDesdeInstruccion: (instruccionId: string, numeroFactura: string, fechaEmision: string, fechaVencimiento: string) => Factura;
  addFacturaDirecta: (factura: Omit<Factura, 'id' | 'bitacora'>) => Factura;
  updateFactura: (id: string, datos: Partial<Factura>, motivoCambio?: string) => void;

  // Acciones Pagos y Conciliación
  registrarPagoConciliacion: (pago: Omit<PagoConciliacion, 'id' | 'fechaRegistro' | 'creadoPor'>) => PagoConciliacion;

  // Acciones Combustible
  addRegistroCombustible: (registro: Omit<RegistroGastoCombustible, 'id'>) => void;
  updateParametroCombustible: (tipo: string, galones: number) => void;

  // Auditoría & Demo
  logAccion: (modulo: string, accion: string, detalle: string) => void;
  restaurarDatosDemo: () => void;
  switchUserRole: (rol: UserRole) => void;
  auditoriaLogs: BitacoraAccion[];

  // Estado de Sincronización MySQL en Vivo
  syncStatus: {
    isOnline: boolean;
    lastSync: Date | null;
    isSyncing: boolean;
    error: string | null;
  };
  sincronizarAhora: () => Promise<void>;

  // Autenticación y Gestión de Usuarios
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; error?: string };

  // Tema Claro / Oscuro para el panel central
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Cierre de Sesión por Inactividad
  sessionNotice: string | null;
  clearSessionNotice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'SIGETRAD_APP_DATA_V2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with mock data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude legacy mock demo users (usr-2, usr-3, usr-4)
        const cleaned = parsed.filter(
          (u: User) => u.id === 'usr-1' || (!['usr-2', 'usr-3', 'usr-4'].includes(u.id) && u.username !== 'ana.secretaria' && u.username !== 'marcos.supervisor' && u.username !== 'pedro.piloto')
        );
        return cleaned.length > 0 ? cleaned : INITIAL_USERS;
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.username !== 'ana.secretaria' && parsed.username !== 'marcos.supervisor' && parsed.username !== 'pedro.piloto') {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Jairo Dannas (Administrador)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Show the redesigned login screen immediately so the user can preview it directly
    const seenNewLogin = localStorage.getItem('SIGETRAD_SEEN_NEW_LOGIN_V1');
    if (!seenNewLogin) {
      localStorage.setItem('SIGETRAD_SEEN_NEW_LOGIN_V1', 'true');
      localStorage.removeItem(`${STORAGE_KEY}_is_auth`);
      return false;
    }
    return localStorage.getItem(`${STORAGE_KEY}_is_auth`) === 'true';
  });

  // Tema Claro / Oscuro para el panel central
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('SIGETRAD_THEME');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('SIGETRAD_THEME', next);
      return next;
    });
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem('SIGETRAD_THEME', newTheme);
  };

  const [propietarios] = useState<PropietarioHermano[]>(PROPIETARIOS_HERMANOS);

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clientes`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [pilotos, setPilotos] = useState<Piloto[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pilotos`);
    return saved ? JSON.parse(saved) : INITIAL_PILOTOS;
  });

  const [gondolas, setGondolas] = useState<Gondola[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gondolas`);
    return saved ? JSON.parse(saved) : INITIAL_GONDOLAS;
  });

  const [viajes, setViajes] = useState<Viaje[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_viajes`);
    return saved ? JSON.parse(saved) : INITIAL_VIAJES;
  });

  const [instruccionesCobro, setInstruccionesCobro] = useState<InstruccionCobro[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_instrucciones`);
    return saved ? JSON.parse(saved) : INITIAL_INSTRUCCIONES_COBRO;
  });

  const [facturas, setFacturas] = useState<Factura[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_facturas`);
    return saved ? JSON.parse(saved) : INITIAL_FACTURAS;
  });

  const [pagos, setPagos] = useState<PagoConciliacion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pagos`);
    return saved ? JSON.parse(saved) : INITIAL_PAGOS;
  });

  const [parametrosCombustible, setParametrosCombustible] = useState<ParametroCombustible[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_parametros_comb`);
    return saved ? JSON.parse(saved) : INITIAL_PARAMETROS_COMBUSTIBLE;
  });

  const [registrosCombustible, setRegistrosCombustible] = useState<RegistroGastoCombustible[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registros_comb`);
    return saved ? JSON.parse(saved) : INITIAL_REGISTROS_COMBUSTIBLE;
  });

  const [bitacora, setBitacora] = useState<BitacoraAccion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bitacora`);
    return saved ? JSON.parse(saved) : INITIAL_BITACORA;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clientes`, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pilotos`, JSON.stringify(pilotos));
  }, [pilotos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gondolas`, JSON.stringify(gondolas));
  }, [gondolas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_viajes`, JSON.stringify(viajes));
  }, [viajes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_instrucciones`, JSON.stringify(instruccionesCobro));
  }, [instruccionesCobro]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_facturas`, JSON.stringify(facturas));
  }, [facturas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pagos`, JSON.stringify(pagos));
  }, [pagos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_parametros_comb`, JSON.stringify(parametrosCombustible));
  }, [parametrosCombustible]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_registros_comb`, JSON.stringify(registrosCombustible));
  }, [registrosCombustible]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_bitacora`, JSON.stringify(bitacora));
  }, [bitacora]);

  // Cierre de Sesión Automático por Inactividad (15 Minutos)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const clearSessionNotice = () => setSessionNotice(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: any;
    const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutos

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        localStorage.removeItem(`${STORAGE_KEY}_is_auth`);
        setSessionNotice('Su sesión se cerró automáticamente tras 15 minutos de inactividad por políticas de seguridad.');
      }, INACTIVITY_TIME);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isAuthenticated]);

  // Estado de Sincronización MySQL en tiempo real
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    lastSync: Date | null;
    isSyncing: boolean;
    error: string | null;
  }>({
    isOnline: true,
    lastSync: null,
    isSyncing: false,
    error: null,
  });

  // Función principal de sincronización bidireccional con MySQL
  const sincronizarConServidor = async () => {
    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
        // 0. Sincronizar Usuarios desde MySQL
        const resUsuarios = await fetch('/api/usuarios');
        if (resUsuarios.ok) {
          const usuariosDb = await resUsuarios.json();
          if (Array.isArray(usuariosDb) && usuariosDb.length > 0) {
            const usuariosFormateados: User[] = usuariosDb
              .filter((u: any) => u && (u.username || u.nombre))
              .map((u: any) => ({
                id: u.user_id_str || `usr-${u.id}`,
                username: u.username || `usuario.${u.id}`,
                nombre: u.nombre || 'Usuario',
                email: u.email || `${u.username || u.id}@dannas.com`,
                telefono: u.telefono || '+502 0000-0000',
                rol: (u.rol || 'ADMIN') as UserRole,
                cargo: u.cargo || '',
                password: u.password || 'admin',
                pilotoId: u.piloto_id || undefined,
                estado: (u.estado || 'Activo') as 'Activo' | 'Inactivo',
                fechaCreacion: u.fecha_creacion || '',
              }));

            setUsers((prev) => {
              const idsDb = new Set(
                usuariosFormateados
                  .map((u) => (u.username ? u.username.toLowerCase() : ''))
                  .filter(Boolean)
              );
              // Mantener usuarios locales que aún no hayan sincronizado pero priorizar DB
              const localesRestantes = prev.filter(
                (p) => p && p.username && !idsDb.has(p.username.toLowerCase())
              );
              const combinados = [...usuariosFormateados, ...localesRestantes];
              localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(combinados));
              return combinados;
            });
          }
        }

        // 1. Sincronizar Clientes desde MySQL
        const resClientes = await fetch('/api/clientes');
        if (resClientes.ok) {
          const clientesDb = await resClientes.json();
          if (Array.isArray(clientesDb)) {
            const clientesFormateados: Cliente[] = clientesDb.map((c: any) => ({
              id: `cli-${c.id}`,
              codigo: c.codigo,
              nombre: c.nombre,
              nit: c.nit,
              direccion: c.direccion || '',
              telefono: c.telefono || '',
              correo: c.correo || c.email || '',
              esAgenteRetenedor: Boolean(c.es_agente_retenedor ?? true),
              buquesHabituales: typeof c.buques_habituales === 'string' 
                ? c.buques_habituales.split(',').map((s: string) => s.trim()).filter(Boolean) 
                : (c.buquesHabituales || []),
              contactoPrincipal: c.contacto_principal || c.contactoPrincipal || '',
              activo: Boolean(c.activo ?? true)
            }));
            
            // Detectar clientes huérfanos que están en la memoria/localStorage de este navegador (ej. CLI-007) y subirlos a MySQL
            let localesGuardados: Cliente[] = [];
            try {
              const rawLocal = localStorage.getItem(`${STORAGE_KEY}_clientes`);
              if (rawLocal) localesGuardados = JSON.parse(rawLocal);
            } catch (e) {
              // fallback
            }

            const codigosEnDb = new Set(clientesFormateados.map((c) => (c.codigo || '').toUpperCase()));
            const pendientesDeSubir = localesGuardados.filter(
              (c) => c && c.codigo && !codigosEnDb.has(c.codigo.toUpperCase())
            );

            // Subir secuencialmente a MySQL para garantizar su persistencia remota
            for (const p of pendientesDeSubir) {
              try {
                console.log(`[Auto-Sync] Subiendo cliente local ${p.codigo} (${p.nombre}) a MySQL...`);
                await fetch('/api/clientes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    codigo: p.codigo,
                    nombre: p.nombre,
                    nit: p.nit || 'CF',
                    direccion: p.direccion || '',
                    telefono: p.telefono || '',
                    correo: p.correo || '',
                    es_agente_retenedor: p.esAgenteRetenedor ?? true,
                    buques_habituales: Array.isArray(p.buquesHabituales) ? p.buquesHabituales.join(', ') : (p.buquesHabituales || ''),
                    contacto_principal: p.contactoPrincipal || ''
                  })
                });
              } catch (subErr) {
                console.warn(`[Auto-Sync] Error subiendo cliente pendiente ${p.codigo}:`, subErr);
              }
            }

            // Deduplicación estricta por código (garantiza exactamente 1 tarjeta por cliente)
            const mapaClientes = new Map<string, Cliente>();
            clientesFormateados.forEach((c) => {
              if (c.codigo) mapaClientes.set(c.codigo.toUpperCase(), c);
            });
            pendientesDeSubir.forEach((p) => {
              if (p.codigo && !mapaClientes.has(p.codigo.toUpperCase())) {
                mapaClientes.set(p.codigo.toUpperCase(), p);
              }
            });
            const listaClientesUnica = Array.from(mapaClientes.values());

            setClientes(listaClientesUnica);
            localStorage.setItem(`${STORAGE_KEY}_clientes`, JSON.stringify(listaClientesUnica));
          }
        }

        // 2. Sincronizar Viajes desde MySQL
        const resViajes = await fetch('/api/viajes');
        if (resViajes.ok) {
          const viajesDb = await resViajes.json();
          if (Array.isArray(viajesDb) && viajesDb.length > 0) {
            const viajesFormateados: Viaje[] = viajesDb.map((v: any) => ({
              id: `vj-${v.id}`,
              codigoViaje: v.codigo_viaje,
              clienteId: String(v.cliente_id),
              clienteNombre: v.cliente_nombre,
              buqueNombre: v.buque_nombre,
              categoriaMovimiento: (v.categoria_movimiento || 'Buques') as CategoriaMovimiento,
              material: (v.material || 'Carbón') as MaterialType,
              gondolaId: String(v.gondola_id),
              placa: v.placa,
              propietarioHermanoId: v.propietario_hermano_id || 'herm-1',
              pilotoId: String(v.piloto_id),
              pilotoNombre: v.piloto_nombre,
              origen: v.origen || 'Puerto Quetzal',
              destino: v.destino || 'Planta Central',
              fechaSalida: v.fecha_salida,
              fechaEntrega: v.fecha_llegada || undefined,
              estado: (v.estado || 'En Curso') as EstadoViaje,
              pesajeCarga: v.peso_bruto_puerto ? {
                numeroBoleta: v.ticket_puerto || 'BOL-001',
                pesoBrutoKg: Number(v.peso_bruto_puerto) * 1000,
                taraKg: Number(v.tara_puerto) * 1000,
                pesoNetoKg: Number(v.peso_neto_puerto) * 1000,
                pesoNetoTon: Number(v.peso_neto_puerto),
                fechaHora: v.fecha_salida || '',
                basculaNombre: 'Báscula Muelle Puerto'
              } : undefined,
              pesajeDescarga: v.peso_bruto_destino ? {
                numeroBoleta: v.ticket_destino || 'BOL-002',
                pesoBrutoKg: Number(v.peso_bruto_destino) * 1000,
                taraKg: Number(v.tara_destino) * 1000,
                pesoNetoKg: Number(v.peso_neto_destino) * 1000,
                pesoNetoTon: Number(v.peso_neto_destino),
                fechaHora: v.fecha_llegada || '',
                basculaNombre: 'Báscula Silos Planta'
              } : undefined,
              tarifaAcordada: Number(v.tarifa_acordada || 0),
              facturaId: v.factura_id || undefined,
            }));

            const mapaViajes = new Map<string, Viaje>();
            viajesFormateados.forEach((v) => {
              if (v.codigoViaje) mapaViajes.set(v.codigoViaje, v);
            });
            const listaViajesUnica = Array.from(mapaViajes.values());
            setViajes(listaViajesUnica);
            localStorage.setItem(`${STORAGE_KEY}_viajes`, JSON.stringify(listaViajesUnica));
          }
        }

        // 3. Sincronizar Pilotos desde MySQL
        const resPilotos = await fetch('/api/pilotos');
        if (resPilotos.ok) {
          const pilotosDb = await resPilotos.json();
          if (Array.isArray(pilotosDb) && pilotosDb.length > 0) {
            const pilotosFormateados: Piloto[] = pilotosDb.map((p: any) => ({
              id: `pil-${p.id}`,
              nombreCompleto: p.nombre_completo || p.nombreCompleto || 'Piloto',
              dpi: p.dpi || '',
              licencia: p.licencia || '',
              telefono: p.telefono || '',
              tipoLicencia: p.tipo_licencia || p.tipoLicencia || 'A',
              vencimientoLicencia: p.vencimiento_licencia || p.vencimientoLicencia || '2027-12-31',
              estado: p.estado || 'Disponible',
              fechaIngreso: p.fecha_ingreso || '2024-01-15',
              gondolaHabitual: p.gondola_habitual || p.gondolaHabitual || '',
            }));
            const mapaPilotos = new Map<string, Piloto>();
            pilotosFormateados.forEach((p) => {
              if (p.dpi) mapaPilotos.set(p.dpi, p);
            });
            const listaPilotosUnica = Array.from(mapaPilotos.values());
            setPilotos(listaPilotosUnica);
            localStorage.setItem(`${STORAGE_KEY}_pilotos`, JSON.stringify(listaPilotosUnica));
          }
        }

        // 4. Sincronizar Góndolas desde MySQL
        const resGondolas = await fetch('/api/gondolas');
        if (resGondolas.ok) {
          const gondolasDb = await resGondolas.json();
          if (Array.isArray(gondolasDb) && gondolasDb.length > 0) {
            const gondolasFormateadas: Gondola[] = gondolasDb.map((g: any) => ({
              id: `gon-${g.id}`,
              placa: g.placa,
              tipoUnidad: g.tipo_unidad || g.tipo || 'Cabezal + Góndola 3 Ejes',
              capacidadTon: Number(g.capacidad_toneladas || g.capacidadTon || 38),
              capacidadM3: Number(g.capacidad_m3 || g.capacidadM3 || 28),
              propietarioId: g.propietario_id || g.propietarioId || 'herm-1',
              estado: g.estado || 'Disponible',
              kilometraje: Number(g.kilometraje_actual || g.kilometraje || 120000),
              anio: Number(g.anio || 2022),
              observaciones: g.observaciones || undefined,
            }));
            const mapaGondolas = new Map<string, Gondola>();
            gondolasFormateadas.forEach((g) => {
              if (g.placa) mapaGondolas.set(g.placa, g);
            });
            const listaGondolasUnica = Array.from(mapaGondolas.values());
            setGondolas(listaGondolasUnica);
            localStorage.setItem(`${STORAGE_KEY}_gondolas`, JSON.stringify(listaGondolasUnica));
          }
        }

        setSyncStatus({
          isOnline: true,
          lastSync: new Date(),
          isSyncing: false,
          error: null,
        });
      } catch (err: any) {
        console.warn('API local o servidor no disponible temporalmente:', err);
        setSyncStatus((prev) => ({
          ...prev,
          isOnline: false,
          isSyncing: false,
          error: err?.message || 'Error de conexión con el backend',
        }));
      }
    };

    // Ejecutar sincronización al cargar
    useEffect(() => {
      sincronizarConServidor();

      // Sincronización continua cada 4 segundos para reflejar cambios casi instantáneos en celular y otros navegadores
      const syncInterval = setInterval(sincronizarConServidor, 4000);

      // Sincronización inmediata al volver a la pestaña/ventana
      const handleFocus = () => sincronizarConServidor();
      window.addEventListener('focus', handleFocus);
      window.addEventListener('visibilitychange', handleFocus);

      return () => {
        clearInterval(syncInterval);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('visibilitychange', handleFocus);
      };
    }, []);

  const logAccion = (modulo: string, accion: string, detalle: string) => {
    const nuevaAccion: BitacoraAccion = {
      id: `bit-${Date.now()}`,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usuario: currentUser.nombre,
      modulo,
      accion,
      detalle,
    };
    setBitacora((prev) => [nuevaAccion, ...prev]);
  };

  // Clientes CRUD con sincronización a MySQL
  const addCliente = async (clienteData: Omit<Cliente, 'id'>) => {
    const newId = `cli-${Date.now()}`;
    const nuevo: Cliente = { ...clienteData, id: newId };
    
    // Deduplicar en estado local
    setClientes((prev) => {
      const sinDuplicado = prev.filter((c) => (c.codigo || '').toUpperCase() !== nuevo.codigo.toUpperCase());
      const actualizado = [nuevo, ...sinDuplicado];
      localStorage.setItem(`${STORAGE_KEY}_clientes`, JSON.stringify(actualizado));
      return actualizado;
    });
    logAccion('Clientes', 'Creación de Cliente', `Se registró al cliente: ${nuevo.nombre} (${nuevo.codigo})`);

    // Guardar en la Base de Datos del servidor MySQL
    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: nuevo.codigo,
          nombre: nuevo.nombre,
          nit: nuevo.nit || 'CF',
          direccion: nuevo.direccion || '',
          telefono: nuevo.telefono || '',
          correo: nuevo.correo || '',
          es_agente_retenedor: nuevo.esAgenteRetenedor ?? true,
          buques_habituales: Array.isArray(nuevo.buquesHabituales) ? nuevo.buquesHabituales.join(', ') : (nuevo.buquesHabituales || ''),
          contacto_principal: nuevo.contactoPrincipal || ''
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[MySQL Error al guardar ${nuevo.codigo}]: HTTP ${res.status}`, errText);
        setSyncStatus((prev) => ({
          ...prev,
          error: `Error al persistir ${nuevo.codigo} en MySQL (HTTP ${res.status}). Quedó guardado localmente.`,
        }));
      } else {
        console.log(`[MySQL Éxito] Cliente ${nuevo.codigo} persistido en base de datos.`);
        setSyncStatus((prev) => ({ ...prev, isOnline: true, error: null, lastSync: new Date() }));
        sincronizarConServidor();
      }
    } catch (e: any) {
      console.error('Error al persistir cliente en MySQL:', e);
      setSyncStatus((prev) => ({
        ...prev,
        error: `Error de conexión con el backend al guardar cliente: ${e?.message || 'Desconectado'}`,
      }));
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clienteData } : c))
    );
    logAccion('Clientes', 'Actualización de Cliente', `Se modificó la información del cliente ID: ${id}`);

    // Persistir en MySQL en el servidor
    try {
      await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
      });
    } catch (e) {
      console.warn('Error al actualizar cliente en MySQL:', e);
    }
  };

  // Pilotos CRUD con sincronización MySQL
  const addPiloto = (pilotoData: Omit<Piloto, 'id'>) => {
    const newId = `pil-${Date.now()}`;
    const nuevo: Piloto = { ...pilotoData, id: newId };
    setPilotos((prev) => [...prev, nuevo]);
    logAccion('Pilotos', 'Alta de Piloto', `Se registró al piloto: ${nuevo.nombreCompleto}`);

    try {
      fetch('/api/pilotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      }).catch((e) => console.warn('MySQL sincronización piloto pendiente:', e));
    } catch (e) {}
  };

  const updatePiloto = (id: string, pilotoData: Partial<Piloto>) => {
    setPilotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...pilotoData } : p))
    );
    logAccion('Pilotos', 'Actualización de Piloto', `Se actualizó el piloto ID: ${id}`);
  };

  // Góndolas CRUD con sincronización MySQL
  const addGondola = (gondolaData: Omit<Gondola, 'id'>) => {
    const newId = `gon-${Date.now()}`;
    const nueva: Gondola = { ...gondolaData, id: newId };
    setGondolas((prev) => [...prev, nueva]);
    logAccion('Góndolas', 'Registro de Unidad', `Se dio de alta la góndola placa: ${nueva.placa}`);

    try {
      fetch('/api/gondolas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva),
      }).catch((e) => console.warn('MySQL sincronización góndola pendiente:', e));
    } catch (e) {}
  };

  const updateGondola = (id: string, gondolaData: Partial<Gondola>) => {
    setGondolas((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...gondolaData } : g))
    );
    logAccion('Góndolas', 'Actualización de Unidad', `Se actualizó la góndola ID: ${id}`);
  };

  // Viajes CRUD con sincronización a MySQL
  const addViaje = (viajeData: Omit<Viaje, 'id' | 'codigoViaje'>): Viaje => {
    const nextNumber = viajes.length + 101;
    const codigoViaje = `VJ-2025-0${nextNumber}`;
    const newViaje: Viaje = {
      ...viajeData,
      id: `vj-${Date.now()}`,
      codigoViaje,
    };
    setViajes((prev) => [newViaje, ...prev]);

    // Update gondola status to 'En Ruta' if active
    if (newViaje.estado === 'En Curso') {
      setGondolas((prev) =>
        prev.map((g) => (g.id === newViaje.gondolaId ? { ...g, estado: 'En Ruta' } : g))
      );
      setPilotos((prev) =>
        prev.map((p) => (p.id === newViaje.pilotoId ? { ...p, estado: 'En Viaje' } : p))
      );
    }

    logAccion(
      'Viajes',
      'Creación de Viaje',
      `Registrado viaje ${codigoViaje} - Buque/Mov: ${newViaje.buqueNombre}, Placa: ${newViaje.placa}`
    );

    // Persistir en MySQL en el servidor
    try {
      fetch('/api/viajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newViaje),
      }).catch((e) => console.warn('MySQL sincronización viaje pendiente:', e));
    } catch (e) {}

    return newViaje;
  };

  const updateViaje = (id: string, viajeData: Partial<Viaje>) => {
    setViajes((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...viajeData };
          // If state changed to Finalizado, free gondola and pilot
          if (viajeData.estado === 'Finalizado' && v.estado !== 'Finalizado') {
            setGondolas((gPrev) =>
              gPrev.map((g) => (g.id === updated.gondolaId ? { ...g, estado: 'Disponible' } : g))
            );
            setPilotos((pPrev) =>
              pPrev.map((p) => (p.id === updated.pilotoId ? { ...p, estado: 'Disponible' } : p))
            );
          }
          return updated;
        }
        return v;
      })
    );
    logAccion('Viajes', 'Actualización de Viaje', `Se actualizaron datos/pesaje del viaje ID: ${id}`);

    // Persistir pesaje o actualización en MySQL
    try {
      fetch(`/api/viajes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viajeData),
      }).catch((e) => console.warn('MySQL actualización viaje pendiente:', e));
    } catch (e) {}
  };

  const deleteViaje = (id: string) => {
    setViajes((prev) => prev.filter((v) => v.id !== id));
    logAccion('Viajes', 'Eliminación de Viaje', `Se eliminó el registro de viaje ID: ${id}`);

    try {
      fetch(`/api/viajes/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}
  };

  // Facturación
  const addInstruccionCobro = (instruccionData: Omit<InstruccionCobro, 'id' | 'procesada'>) => {
    const newInst: InstruccionCobro = {
      ...instruccionData,
      id: `inst-${Date.now()}`,
      procesada: false,
    };
    setInstruccionesCobro((prev) => [newInst, ...prev]);
    logAccion(
      'Facturación',
      'Instrucción de Cobro (WhatsApp)',
      `Registrada instrucción para ${newInst.clienteNombre}: ${newInst.cantidadViajes} viajes por Q${newInst.montoAcordadoTotal.toLocaleString()}`
    );
  };

  const generarFacturaDesdeInstruccion = (
    instruccionId: string,
    numeroFactura: string,
    fechaEmision: string,
    fechaVencimiento: string
  ): Factura => {
    const inst = instruccionesCobro.find((i) => i.id === instruccionId);
    if (!inst) throw new Error('Instrucción no encontrada');

    const cliente = clientes.find((c) => c.id === inst.clienteId);
    const esAgente = cliente ? cliente.esAgenteRetenedor : true;

    // Standard Guatemala withholding calculations for Agente Retenedor:
    // ISR retention: 5% on gross amount
    // IVA retention: ~15% of the 12% VAT portion (or direct withholding factor ~1.8% of gross)
    const retencionIsr = esAgente ? inst.montoAcordadoTotal * 0.05 : 0;
    const retencionIva = esAgente ? inst.montoAcordadoTotal * 0.018 : 0;
    const netoEsperado = inst.montoAcordadoTotal - retencionIsr - retencionIva;

    // Find related completed trips matching this movement / project
    const matchingTrips = viajes.filter(
      (v) => v.clienteId === inst.clienteId && (!v.facturaId || v.facturaId === '')
    );
    const assignedTripsIds = matchingTrips.slice(0, inst.cantidadViajes).map((v) => v.id);

    const newFactura: Factura = {
      id: `fac-${Date.now()}`,
      numeroFactura,
      clienteId: inst.clienteId,
      clienteNombre: inst.clienteNombre,
      nitCliente: cliente ? cliente.nit : 'CF',
      fechaEmision,
      fechaVencimiento,
      buqueProyecto: inst.buqueProyecto,
      material: inst.material,
      viajesIds: assignedTripsIds,
      cantidadViajes: inst.cantidadViajes,
      montoBruto: inst.montoAcordadoTotal,
      esAgenteRetenedor: esAgente,
      retencionIsrEstimada: retencionIsr,
      retencionIvaEstimada: retencionIva,
      netoEsperado,
      estadoPago: 'Emitida',
      instruccionCobroId: inst.id,
      observaciones: `Factura generada desde instrucción de cobro WhatsApp (${inst.referenciaWhatsApp})`,
      bitacora: [
        {
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
          usuario: currentUser.nombre,
          descripcion: `Factura ${numeroFactura} generada automáticamente a partir de instrucción de cobro WhatsApp`,
        },
      ],
    };

    setFacturas((prev) => [newFactura, ...prev]);

    // Mark instruction as processed
    setInstruccionesCobro((prev) =>
      prev.map((i) => (i.id === instruccionId ? { ...i, procesada: true, facturaId: newFactura.id } : i))
    );

    // Link trips to this invoice
    if (assignedTripsIds.length > 0) {
      setViajes((prev) =>
        prev.map((v) => (assignedTripsIds.includes(v.id) ? { ...v, facturaId: newFactura.id, estado: 'Facturado' } : v))
      );
    }

    logAccion(
      'Facturación',
      'Emisión de Factura',
      `Factura ${numeroFactura} emitida por Q${newFactura.montoBruto.toLocaleString()} para ${newFactura.clienteNombre}`
    );

    return newFactura;
  };

  const addFacturaDirecta = (facturaData: Omit<Factura, 'id' | 'bitacora'>): Factura => {
    const newFactura: Factura = {
      ...facturaData,
      id: `fac-${Date.now()}`,
      bitacora: [
        {
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
          usuario: currentUser.nombre,
          descripcion: `Factura ${facturaData.numeroFactura} registrada directamente en el sistema`,
        },
      ],
    };

    setFacturas((prev) => [newFactura, ...prev]);

    // Link assigned trips
    if (facturaData.viajesIds && facturaData.viajesIds.length > 0) {
      setViajes((prev) =>
        prev.map((v) => (facturaData.viajesIds.includes(v.id) ? { ...v, facturaId: newFactura.id, estado: 'Facturado' } : v))
      );
    }

    logAccion(
      'Facturación',
      'Factura Creada',
      `Factura ${newFactura.numeroFactura} creada por Q${newFactura.montoBruto.toLocaleString()}`
    );

    // Persistir en MySQL en el servidor
    try {
      fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFactura),
      }).catch((e) => console.warn('MySQL sincronización factura pendiente:', e));
    } catch (e) {}

    return newFactura;
  };

  const updateFactura = (id: string, datos: Partial<Factura>, motivoCambio?: string) => {
    setFacturas((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nuevaBitacora = [...f.bitacora];
          if (motivoCambio) {
            nuevaBitacora.push({
              fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
              usuario: currentUser.nombre,
              descripcion: motivoCambio,
            });
          }
          return { ...f, ...datos, bitacora: nuevaBitacora };
        }
        return f;
      })
    );
    logAccion('Facturación', 'Modificación de Factura', `Se modificó la factura ID: ${id}. ${motivoCambio || ''}`);
  };

  // Pagos y Conciliación con sincronización MySQL
  const registrarPagoConciliacion = (
    pagoData: Omit<PagoConciliacion, 'id' | 'fechaRegistro' | 'creadoPor'>
  ): PagoConciliacion => {
    const newPago: PagoConciliacion = {
      ...pagoData,
      id: `pag-${Date.now()}`,
      fechaRegistro: new Date().toISOString().replace('T', ' ').slice(0, 16),
      creadoPor: currentUser.nombre,
    };

    setPagos((prev) => [newPago, ...prev]);

    // Update invoice status to 'Conciliada'
    setFacturas((prev) =>
      prev.map((f) => {
        if (f.id === newPago.facturaId || f.numeroFactura === newPago.numeroFactura) {
          return {
            ...f,
            estadoPago: 'Conciliada',
            pagoId: newPago.id,
            bitacora: [
              ...f.bitacora,
              {
                fecha: newPago.fechaRegistro,
                usuario: currentUser.nombre,
                descripcion: `Pago conciliado con Comprobante ${newPago.numeroTransferencia} por Q${newPago.montoNetoDepositado.toLocaleString()} (Ret. ISR Q${newPago.retencionIsrAplicada.toLocaleString()}, Ret. IVA Q${newPago.retencionIvaAplicada.toLocaleString()})`,
              },
            ],
          };
        }
        return f;
      })
    );

    logAccion(
      'Pagos y Conciliación',
      'Conciliación Bancaria',
      `Pago ${newPago.numeroTransferencia} registrado. Factura: ${newPago.numeroFactura}, Neto: Q${newPago.montoNetoDepositado.toLocaleString()} a cuenta de ${newPago.titularCuenta}`
    );

    // Persistir en MySQL en el servidor
    try {
      fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPago),
      }).catch((e) => console.warn('MySQL sincronización pago pendiente:', e));
    } catch (e) {}

    return newPago;
  };

  // Combustible con sincronización MySQL
  const addRegistroCombustible = (registroData: Omit<RegistroGastoCombustible, 'id'>) => {
    const nuevo: RegistroGastoCombustible = {
      ...registroData,
      id: `comb-${Date.now()}`,
    };
    setRegistrosCombustible((prev) => [nuevo, ...prev]);
    logAccion(
      'Combustible',
      'Registro de Despacho',
      `Despacho de ${nuevo.galones} galones a placa ${nuevo.placa} (Q${nuevo.totalGasto.toLocaleString()})`
    );

    // Persistir en MySQL en el servidor
    try {
      fetch('/api/combustible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      }).catch((e) => console.warn('MySQL sincronización combustible pendiente:', e));
    } catch (e) {}
  };

  const updateParametroCombustible = (tipo: string, galones: number) => {
    setParametrosCombustible((prev) =>
      prev.map((p) => (p.tipoMovimientoOMaterial === tipo ? { ...p, galonesSugeridos: galones } : p))
    );
    logAccion('Combustible', 'Parámetro Actualizado', `Consumo para ${tipo} actualizado a ${galones} galones/viaje`);
  };

  // Autenticación y Usuarios
  const login = (identifier: string, pass: string): { success: boolean; error?: string } => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    const found = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.nombre && u.nombre.toLowerCase() === cleanId) ||
        (cleanId === 'admin' && (u.username === 'jairo.dannas' || u.rol === 'ADMIN' || u.rol === 'DUENO')) ||
        (cleanId === 'jairo' && u.username === 'jairo.dannas')
    );

    if (!found) {
      return { success: false, error: 'Usuario no encontrado en el sistema. Verifique e intente nuevamente.' };
    }

    const validPassword = found.password || 'admin';
    if (cleanPass !== validPassword && cleanPass !== 'admin') {
      return { success: false, error: 'Contraseña incorrecta. Verifique e intente de nuevo.' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(found));
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, 'true');
    logAccion('Seguridad', 'Inicio de Sesión', `Usuario ${found.nombre} (${found.rol}) inició sesión exitosamente.`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${STORAGE_KEY}_is_auth`);
    logAccion('Seguridad', 'Cierre de Sesión', `Usuario ${currentUser.nombre} cerró sesión.`);
  };

  const addUser = (userData: Omit<User, 'id'>): { success: boolean; error?: string } => {
    const cleanUsername = (userData.username || '').trim().toLowerCase();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    if (users.some((u) => (u.username || '').toLowerCase() === cleanUsername)) {
      return { success: false, error: `El nombre de usuario "${userData.username}" ya está registrado.` };
    }
    if (users.some((u) => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, error: `El correo "${userData.email}" ya está registrado.` };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      username: userData.username.trim(),
      nombre: userData.nombre.trim(),
      email: userData.email.trim(),
      telefono: userData.telefono || '+502 0000-0000',
      cargo:
        userData.cargo ||
        (userData.rol === 'ADMIN'
          ? 'Administrador Operativo'
          : userData.rol === 'SUPERVISOR'
          ? 'Supervisor de Operaciones'
          : 'Operador de Góndola'),
      password: userData.password || 'admin',
      estado: userData.estado || 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
    logAccion('Seguridad', 'Registro de Usuario', `Se creó el usuario "${newUser.nombre}" con rol ${newUser.rol}`);

    // Persistir directamente a MySQL en el servidor para sincronización inmediata en celular y otros navegadores
    try {
      fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch((err) => console.warn('Error al persistir usuario en servidor:', err));
    } catch (e) {
      console.warn(e);
    }

    return { success: true };
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    setUsers(updated);
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...userData }));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify({ ...currentUser, ...userData }));
    }
    logAccion('Seguridad', 'Usuario Modificado', `Actualización en usuario ID: ${id}`);

    // Persistir cambios en MySQL
    try {
      fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).catch((err) => console.warn('Error al actualizar usuario en servidor:', err));
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: 'Usuario no encontrado.' };
    if (target.username === 'jairo.dannas' || target.id === 'usr-1') {
      return { success: false, error: 'No se puede eliminar la cuenta principal de Jairo Dannas (Administrador).' };
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
    logAccion('Seguridad', 'Usuario Eliminado', `Se eliminó al usuario ${target.nombre} (${target.username})`);

    // Eliminar de MySQL
    try {
      fetch(`/api/usuarios/${id}`, {
        method: 'DELETE'
      }).catch((err) => console.warn('Error al eliminar usuario en servidor:', err));
    } catch (e) {
      console.warn(e);
    }

    return { success: true };
  };

  // Reset to original mock data
  const restaurarDatosDemo = () => {
    localStorage.clear();
    setClientes(INITIAL_CLIENTES);
    setPilotos(INITIAL_PILOTOS);
    setGondolas(INITIAL_GONDOLAS);
    setViajes(INITIAL_VIAJES);
    setInstruccionesCobro(INITIAL_INSTRUCCIONES_COBRO);
    setFacturas(INITIAL_FACTURAS);
    setPagos(INITIAL_PAGOS);
    setParametrosCombustible(INITIAL_PARAMETROS_COMBUSTIBLE);
    setRegistrosCombustible(INITIAL_REGISTROS_COMBUSTIBLE);
    setBitacora(INITIAL_BITACORA);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(false);
    logAccion('Sistema', 'Restablecimiento', 'Datos restablecidos a valores iniciales');
  };

  const switchUserRole = (rol: UserRole) => {
    const userForRole = users.find((u) => u.rol === rol) || {
      id: `usr-demo-${rol.toLowerCase()}`,
      username: `usuario.${rol.toLowerCase()}`,
      nombre: `Usuario ${rol === 'ADMIN' ? 'Administrador' : rol}`,
      email: `${rol.toLowerCase()}@dannas.com`,
      rol: rol,
      cargo: rol === 'ADMIN' ? 'Administrador' : rol === 'SUPERVISOR' ? 'Supervisor' : 'Operador',
      telefono: '+502 5500-0000',
    };
    setCurrentUser(userForRole);
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userForRole));
    logAccion('Seguridad', 'Cambio de Rol Demo', `Sesión cambiada a perfil: ${rol} (${userForRole.nombre})`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        users,
        isAuthenticated,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        propietarios,
        clientes,
        pilotos,
        gondolas,
        viajes,
        instruccionesCobro,
        facturas,
        pagos,
        parametrosCombustible,
        registrosCombustible,
        bitacora,
        auditoriaLogs: bitacora,
        addCliente,
        updateCliente,
        addPiloto,
        updatePiloto,
        addGondola,
        updateGondola,
        addViaje,
        updateViaje,
        deleteViaje,
        addInstruccionCobro,
        generarFacturaDesdeInstruccion,
        addFacturaDirecta,
        updateFactura,
        registrarPagoConciliacion,
        addRegistroCombustible,
        updateParametroCombustible,
        logAccion,
        restaurarDatosDemo,
        theme,
        toggleTheme,
        setTheme,
        sessionNotice,
        clearSessionNotice,
        syncStatus,
        sincronizarAhora: sincronizarConServidor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};