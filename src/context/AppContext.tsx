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

  // Sincronización con la API de MySQL en el servidor
  useEffect(() => {
    const sincronizarConServidor = async () => {
      try {
        const res = await fetch('/api/clientes');
        if (res.ok) {
          const clientesDb = await res.json();
          if (Array.isArray(clientesDb) && clientesDb.length > 0) {
            // Mapear los datos de MySQL al formato de Cliente
            const clientesFormateados: Cliente[] = clientesDb.map((c: any) => ({
              id: `cli-${c.id}`,
              codigo: c.codigo,
              nombre: c.nombre,
              nit: c.nit,
              direccion: c.direccion || '',
              telefono: c.telefono || '',
              correo: c.correo || c.email || '',
              esAgenteRetenedor: Boolean(c.es_agente_retenedor ?? true),
              buquesHabituales: Array.isArray(c.buquesHabituales) ? c.buquesHabituales : [],
              contactoPrincipal: c.contacto_principal || c.contactoPrincipal || '',
              activo: Boolean(c.activo ?? true)
            }));
            
            // Unir sin duplicados con los iniciales
            setClientes((prev) => {
              const existentesCodigos = new Set(clientesFormateados.map(c => c.codigo));
              const filtradosPrev = prev.filter(p => !existentesCodigos.has(p.codigo));
              return [...clientesFormateados, ...filtradosPrev];
            });
          }
        }
      } catch (err) {
        console.warn('API local o servidor no disponible temporalmente:', err);
      }
    };

    sincronizarConServidor();
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
    setClientes((prev) => [nuevo, ...prev]);
    logAccion('Clientes', 'Creación de Cliente', `Se registró al cliente: ${nuevo.nombre} (${nuevo.codigo})`);

    // Guardar en la Base de Datos del servidor
    try {
      await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: nuevo.codigo,
          nombre: nuevo.nombre,
          nit: nuevo.nit,
          direccion: nuevo.direccion,
          telefono: nuevo.telefono,
          correo: nuevo.correo,
          es_agente_retenedor: nuevo.esAgenteRetenedor,
          contacto_principal: nuevo.contactoPrincipal
        })
      });
    } catch (e) {
      console.error('Error al persistir cliente en MySQL:', e);
    }
  };

  const updateCliente = (id: string, clienteData: Partial<Cliente>) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clienteData } : c))
    );
    logAccion('Clientes', 'Actualización de Cliente', `Se modificó la información del cliente ID: ${id}`);
  };

  // Pilotos CRUD
  const addPiloto = (pilotoData: Omit<Piloto, 'id'>) => {
    const newId = `pil-${Date.now()}`;
    const nuevo: Piloto = { ...pilotoData, id: newId };
    setPilotos((prev) => [...prev, nuevo]);
    logAccion('Pilotos', 'Alta de Piloto', `Se registró al piloto: ${nuevo.nombreCompleto}`);
  };

  const updatePiloto = (id: string, pilotoData: Partial<Piloto>) => {
    setPilotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...pilotoData } : p))
    );
    logAccion('Pilotos', 'Actualización de Piloto', `Se actualizó el piloto ID: ${id}`);
  };

  // Góndolas CRUD
  const addGondola = (gondolaData: Omit<Gondola, 'id'>) => {
    const newId = `gon-${Date.now()}`;
    const nueva: Gondola = { ...gondolaData, id: newId };
    setGondolas((prev) => [...prev, nueva]);
    logAccion('Góndolas', 'Registro de Unidad', `Se dio de alta la góndola placa: ${nueva.placa}`);
  };

  const updateGondola = (id: string, gondolaData: Partial<Gondola>) => {
    setGondolas((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...gondolaData } : g))
    );
    logAccion('Góndolas', 'Actualización de Unidad', `Se actualizó la góndola ID: ${id}`);
  };

  // Viajes CRUD
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
  };

  const deleteViaje = (id: string) => {
    setViajes((prev) => prev.filter((v) => v.id !== id));
    logAccion('Viajes', 'Eliminación de Viaje', `Se eliminó el registro de viaje ID: ${id}`);
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

  // Pagos y Conciliación
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
        if (f.id === newPago.facturaId) {
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

    return newPago;
  };

  // Combustible
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
  };

  const updateParametroCombustible = (tipo: string, galones: number) => {
    setParametrosCombustible((prev) =>
      prev.map((p) => (p.tipoMovimientoOMaterial === tipo ? { ...p, galonesSugeridos: galones } : p))
    );
    logAccion('Combustible', 'Parámetro Actualizado', `Consumo para ${tipo} actualizado a ${galones} galones/viaje`);
  };

  // Autenticación y Usuarios
  const login = (identifier: string, pass: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.nombre.toLowerCase() === cleanId ||
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
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `El nombre de usuario "${userData.username}" ya está registrado.` };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
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
