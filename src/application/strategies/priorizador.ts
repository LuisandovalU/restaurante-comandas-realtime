// =============================================================================
// CAPA: Business Logic — Patrón de Diseño Strategy
// ARCHIVO: priorizador.ts
// DESCRIPCIÓN: Algoritmos intercambiables de priorización de platillos.
//              El Core selecciona la estrategia según el horario del restaurante
//              sin modificar la lógica principal (Principio Abierto/Cerrado).
// =============================================================================

// ---------------------------------------------------------------------------
// 1. ENTIDAD DE DOMINIO
// ---------------------------------------------------------------------------

/**
 * Representa un platillo en el sistema de comandas.
 * Los campos `tiempo_preparacion` y `nivel_dificultad` son los
 * criterios de ordenamiento que consumen las estrategias.
 */
export interface Platillo {
  /** Identificador único de la comanda o plato */
  id: string;
  /** Nombre del platillo (ej. "Tacos de canasta") */
  nombre: string;
  /** Tiempo estimado de preparación en minutos */
  tiempo_preparacion: number;
  /**
   * Nivel de dificultad de preparación.
   * Escala: 1 (muy sencillo) → 5 (alta complejidad técnica)
   */
  nivel_dificultad: number;
  /** Estación de preparación asignada en cocina */
  estacion: "frios" | "calientes" | "postres" | "bebidas";
  /** Estado actual de la comanda en el tablero Kanban */
  estado: "pendiente" | "en_preparacion" | "listo";
}

// ---------------------------------------------------------------------------
// 2. INTERFAZ DE LA ESTRATEGIA (Contrato / Abstracción)
// ---------------------------------------------------------------------------

/**
 * Interfaz que define el contrato para todos los algoritmos de priorización.
 *
 * Cada implementación encapsula un criterio de ordenamiento específico.
 * El Core depende de esta abstracción, nunca de implementaciones concretas,
 * cumpliendo con el Principio de Inversión de Dependencias (DIP).
 */
export interface EstrategiaPrioridad {
  /**
   * Nombre descriptivo de la estrategia (útil para logging y UI).
   */
  readonly nombre: string;

  /**
   * Ordena la lista de platillos según el criterio específico de la estrategia.
   * @param platillos - Lista original de platillos a ordenar.
   * @returns Nueva lista ordenada (no muta el array original).
   */
  priorizar(platillos: Platillo[]): Platillo[];
}

// ---------------------------------------------------------------------------
// 3. IMPLEMENTACIONES CONCRETAS DE LA ESTRATEGIA
// ---------------------------------------------------------------------------

/**
 * **Estrategia A — Por Tiempo de Preparación**
 *
 * Ordena de menor a mayor `tiempo_preparacion`.
 * Ideal para horas pico: los platos más rápidos salen primero,
 * reduciendo la percepción de espera del cliente.
 *
 * @example
 * const estrategia = new EstrategiaOrdenarPorTiempo();
 * const ordenados = estrategia.priorizar(platillos);
 */
export class EstrategiaOrdenarPorTiempo implements EstrategiaPrioridad {
  readonly nombre = "Prioridad por Tiempo de Preparación (hora pico)";

  priorizar(platillos: Platillo[]): Platillo[] {
    // Creamos una copia superficial para no mutar el array original
    return [...platillos].sort(
      (a, b) => a.tiempo_preparacion - b.tiempo_preparacion,
    );
  }
}

/**
 * **Estrategia B — Por Nivel de Dificultad**
 *
 * Ordena de menor a mayor `nivel_dificultad`.
 * Ideal para turnos tranquilos: los cocineros abordan primero los platos
 * técnicamente sencillos, reservando atención para los más complejos.
 *
 * @example
 * const estrategia = new EstrategiaOrdenarPorDificultad();
 * const ordenados = estrategia.priorizar(platillos);
 */
export class EstrategiaOrdenarPorDificultad implements EstrategiaPrioridad {
  readonly nombre = "Prioridad por Nivel de Dificultad (turno tranquilo)";

  priorizar(platillos: Platillo[]): Platillo[] {
    return [...platillos].sort(
      (a, b) => a.nivel_dificultad - b.nivel_dificultad,
    );
  }
}

/**
 * **Estrategia C — Mixta (Tiempo × Dificultad)**
 *
 * Pondera ambos criterios con pesos configurables.
 * Permite balancear velocidad y complejidad en situaciones intermedias.
 * Extensible sin modificar el Core (Principio Abierto/Cerrado).
 *
 * @param pesoPorTiempo     - Peso del criterio tiempo (0–1). Default: 0.6
 * @param pesoPorDificultad - Peso del criterio dificultad (0–1). Default: 0.4
 */
export class EstrategiaMixta implements EstrategiaPrioridad {
  readonly nombre: string;

  constructor(
    private readonly pesoPorTiempo: number = 0.6,
    private readonly pesoPorDificultad: number = 0.4,
  ) {
    this.nombre = `Prioridad Mixta (tiempo×${pesoPorTiempo} + dificultad×${pesoPorDificultad})`;
  }

  priorizar(platillos: Platillo[]): Platillo[] {
    return [...platillos].sort((a, b) => {
      const puntajeA =
        a.tiempo_preparacion * this.pesoPorTiempo +
        a.nivel_dificultad * this.pesoPorDificultad;
      const puntajeB =
        b.tiempo_preparacion * this.pesoPorTiempo +
        b.nivel_dificultad * this.pesoPorDificultad;
      return puntajeA - puntajeB;
    });
  }
}

// ---------------------------------------------------------------------------
// 4. CONTEXTO DE HORARIO
// ---------------------------------------------------------------------------

/**
 * Define los franjas horarias del restaurante.
 * Usadas por el Core para seleccionar la estrategia automáticamente.
 */
export type FranjaHoraria =
  | "apertura"       // 08:00–11:59 — desayunos, poco volumen
  | "hora_pico"      // 12:00–15:00 — comida, máximo volumen
  | "tarde"          // 15:01–19:59 — transición, volumen medio
  | "cierre";        // 20:00–23:59 — cena, volumen moderado

/**
 * Determina la franja horaria actual del restaurante.
 * @param fecha - Fecha a evaluar (default: ahora)
 * @returns La franja horaria correspondiente
 */
export function obtenerFranjaHoraria(fecha: Date = new Date()): FranjaHoraria {
  const hora = fecha.getHours();

  if (hora >= 8 && hora < 12) return "apertura";
  if (hora >= 12 && hora <= 15) return "hora_pico";
  if (hora > 15 && hora < 20) return "tarde";
  return "cierre";
}

// ---------------------------------------------------------------------------
// 5. FUNCIÓN CORE — SELECCIÓN AUTOMÁTICA DE ESTRATEGIA
// ---------------------------------------------------------------------------

/**
 * Resultado del Core: incluye la lista priorizada y metadata de auditoría.
 */
export interface ResultadoPriorizacion {
  /** Lista de platillos ordenados según la estrategia aplicada */
  platillosPriorizados: Platillo[];
  /** Nombre de la estrategia que se utilizó */
  estrategiaAplicada: string;
  /** Franja horaria detectada al momento de la priorización */
  franjaHoraria: FranjaHoraria;
  /** Timestamp de cuándo se ejecutó la priorización */
  timestamp: Date;
}

/**
 * **Core del Microkernel — Priorizador de Comandas**
 *
 * Recibe la lista de platillos pendientes y selecciona automáticamente
 * la estrategia de priorización según el horario actual del restaurante.
 *
 * La lógica principal (Core) es INMUTABLE. Para agregar nuevas
 * estrategias basta con crear una nueva clase que implemente
 * `EstrategiaPrioridad` y registrarla en el mapa de horarios.
 *
 * @param platillos         - Lista de platillos a priorizar (solo pendientes)
 * @param estrategiaManual  - Si se provee, omite la selección automática por horario
 * @param fechaReferencia   - Fecha para determinar la franja (default: ahora)
 * @returns ResultadoPriorizacion con la lista ordenada y metadata
 *
 * @example
 * // Selección automática por horario
 * const resultado = priorizarComandas(platillosPendientes);
 *
 * @example
 * // Inyección manual de estrategia (útil para testing o configuración del admin)
 * const resultado = priorizarComandas(platillos, new EstrategiaOrdenarPorDificultad());
 */
export function priorizarComandas(
  platillos: Platillo[],
  estrategiaManual?: EstrategiaPrioridad,
  fechaReferencia: Date = new Date(),
): ResultadoPriorizacion {
  // Guarda de entrada: si no hay platillos, retornamos rápido
  if (platillos.length === 0) {
    const franja = obtenerFranjaHoraria(fechaReferencia);
    return {
      platillosPriorizados: [],
      estrategiaAplicada: estrategiaManual?.nombre ?? "sin estrategia (lista vacía)",
      franjaHoraria: franja,
      timestamp: fechaReferencia,
    };
  }

  // Mapa de estrategias por franja horaria (fácilmente extensible)
  const estrategiasPorHorario: Record<FranjaHoraria, EstrategiaPrioridad> = {
    apertura:   new EstrategiaOrdenarPorDificultad(), // Poco volumen → platos sencillos primero
    hora_pico:  new EstrategiaOrdenarPorTiempo(),     // Alta demanda → más rápidos primero
    tarde:      new EstrategiaMixta(0.5, 0.5),        // Balance equitativo
    cierre:     new EstrategiaOrdenarPorTiempo(),     // Cerrar cocina rápido → velocidad
  };

  const franja = obtenerFranjaHoraria(fechaReferencia);

  // Si el administrador inyecta una estrategia manual, tiene precedencia
  const estrategiaActiva = estrategiaManual ?? estrategiasPorHorario[franja];

  const platillosPriorizados = estrategiaActiva.priorizar(platillos);

  return {
    platillosPriorizados,
    estrategiaAplicada: estrategiaActiva.nombre,
    franjaHoraria: franja,
    timestamp: fechaReferencia,
  };
}
