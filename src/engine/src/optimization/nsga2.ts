/**
 * Implementacion propia de NSGA-II en TypeScript.
 *
 * Decision de arquitectura (ver docs/software/decisiones-arquitectura.md, ADR-002): no
 * existe en npm una libreria de NSGA-II con la madurez de `pymoo`, asi que se implementa
 * desde cero. Esto traslada la responsabilidad de demostrar correccion del algoritmo a
 * este mismo paquete -- ver tests/benchmarks/ (ZDT1, SRN), que son OBLIGATORIOS y deben
 * pasar antes de considerar esta implementacion valida para usar en la tesis.
 *
 * Componentes implementados (Deb et al., 2002 -- ver docs/tesis/referencias.bib):
 *   1. Ordenamiento no dominado rapido (fast-non-dominated-sort), O(M*N^2)
 *   2. Distancia de aglomeracion (crowding distance) para diversidad del frente
 *   3. Seleccion por torneo binario (usando rango + crowding distance)
 *   4. Cruce SBX y mutacion polinomial (Deb & Agrawal), respetando los rangos/tipos de
 *      cada variable segun el YAML cargado con config/loadYaml.ts (continuas, discretas,
 *      discretas categoricas) -- el genotipo se maneja normalizado en [0,1] y se decodifica
 *      al espacio real al evaluar
 *   5. Manejo de restricciones por dominancia restringida (constrained-domination)
 *
 * El algoritmo es GENERICO: opera sobre un ProblemaOptimizacion (definicion de variables
 * + funcion de evaluacion). Los benchmarks ZDT1/SRN (tests/benchmarks/) definen problemas
 * de prueba; el caso real de la losa maciza definira su propio problema cuando se acople
 * en la Fase 3.
 */

export type TipoVariable = "continua" | "discreta" | "discreta_categorica";

export interface DefinicionVariable {
  id: string;
  tipo: TipoVariable;
  /** Obligatorio para tipo "continua". */
  rango?: [number, number];
  /** Obligatorio para tipo "discreta" / "discreta_categorica". */
  catalogo?: number[];
}

export interface Evaluacion {
  /** Valores de los objetivos (todos en sentido "menor es mejor"). */
  objetivos: number[];
  /** Violaciones g_i(x); se considera violada si g_i(x) > 0. */
  restricciones: number[];
}

export interface ProblemaOptimizacion {
  variables: DefinicionVariable[];
  /** Recibe los valores YA decodificados (espacio real) y devuelve objetivos + restricciones. */
  evaluar: (valoresReales: number[]) => Evaluacion;
}

export interface ConfiguracionNSGA2 {
  poblacion: number;
  generaciones: number;
  probabilidadCruce: number;
  probabilidadMutacion: number;
  /** Semilla para el generador pseudoaleatorio (mulberry32). Si se omite, no es determinista. */
  semilla?: number;
}

export interface SolucionNSGA2 {
  /** Genotipo normalizado en [0,1]^D sobre el que operan cruce/mutacion. */
  genotipo: number[];
  /** Valores decodificados al espacio real (lo que recibe la funcion de evaluacion). */
  valores: number[];
  objetivos: number[];
  restricciones: number[];
  /** Suma de las violaciones positivas de las restricciones (0 = factible). */
  violacionTotal: number;
  /** Frente al que pertenece (0 = mejor frente). */
  rangoFrente: number;
  distanciaCrowding: number;
}

export interface ResultadoNSGA2 {
  generaciones: number;
  soluciones: SolucionNSGA2[];
  frentes: SolucionNSGA2[][];
  frentePareto: SolucionNSGA2[];
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Generador pseudoaleatorio determinista mulberry32 (para reproducibilidad en tests). */
function crearAleatorio(semilla: number | undefined): () => number {
  if (semilla === undefined) {
    return Math.random;
  }
  let s = semilla >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Decodifica un gen normalizado [0,1] al valor real segun el tipo de variable. */
export function decodificarVariable(def: DefinicionVariable, gen: number): number {
  if (def.tipo === "continua") {
    const [min, max] = def.rango ?? [0, 1];
    return min + gen * (max - min);
  }
  const catalogo = def.catalogo ?? [];
  if (catalogo.length === 0) {
    throw new Error(`Variable "${def.id}": tipo discreto sin catalogo definido`);
  }
  const idx = Math.round(gen * (catalogo.length - 1));
  return catalogo[Math.min(catalogo.length - 1, Math.max(0, idx))];
}

// ---------------------------------------------------------------------------
// Componente 1 + 5: ordenamiento no dominado rapido con dominancia restringida
// ---------------------------------------------------------------------------

/**
 * Dominancia restringida (constrained-domination, Deb et al. 2002, sec. II-B):
 *  - dos soluciones factibles -> dominancia clasica por objetivos;
 *  - factible domina a infactible;
 *  - dos infactibles -> domina la de MENOR violacion total.
 */
export function esDominante(a: SolucionNSGA2, b: SolucionNSGA2): boolean {
  const factibleA = a.violacionTotal <= 0;
  const factibleB = b.violacionTotal <= 0;

  if (factibleA && factibleB) {
    let estrictamenteMejor = false;
    for (let i = 0; i < a.objetivos.length; i++) {
      if (a.objetivos[i] > b.objetivos[i]) return false;
      if (a.objetivos[i] < b.objetivos[i]) estrictamenteMejor = true;
    }
    return estrictamenteMejor;
  }
  if (factibleA) return true;
  if (factibleB) return false;
  return a.violacionTotal < b.violacionTotal;
}

/** fast-non-dominated-sort: devuelve los frentes como listas de indices sobre `soluciones`. */
export function ordenamientoNoDominado(soluciones: SolucionNSGA2[]): number[][] {
  const n = soluciones.length;
  const dominadosPor: number[][] = Array.from({ length: n }, () => []);
  const cuentaDominadores: number[] = new Array(n).fill(0);
  const frentes: number[][] = [];

  for (let p = 0; p < n; p++) {
    for (let q = 0; q < n; q++) {
      if (p === q) continue;
      if (esDominante(soluciones[p], soluciones[q])) {
        dominadosPor[p].push(q);
      } else if (esDominante(soluciones[q], soluciones[p])) {
        cuentaDominadores[p]++;
      }
    }
    if (cuentaDominadores[p] === 0) {
      if (frentes.length === 0) frentes.push([]);
      frentes[0].push(p);
    }
  }

  let frenteActual = 0;
  while (frenteActual < frentes.length && frentes[frenteActual].length > 0) {
    const siguiente: number[] = [];
    for (const p of frentes[frenteActual]) {
      for (const q of dominadosPor[p]) {
        cuentaDominadores[q]--;
        if (cuentaDominadores[q] === 0) siguiente.push(q);
      }
    }
    frenteActual++;
    if (siguiente.length > 0) frentes.push(siguiente);
  }
  return frentes;
}

// ---------------------------------------------------------------------------
// Componente 2: distancia de aglomeracion (crowding distance)
// ---------------------------------------------------------------------------

/** Asigna la distancia de aglomeracion a cada solucion del frente (indices sobre `soluciones`). */
export function asignarDistanciaCrowding(frente: number[], soluciones: SolucionNSGA2[]): void {
  const m = frente.length;
  if (m === 0) return;
  const nObjetivos = soluciones[frente[0]].objetivos.length;

  for (const idx of frente) soluciones[idx].distanciaCrowding = 0;
  if (m <= 2) {
    for (const idx of frente) soluciones[idx].distanciaCrowding = Infinity;
    return;
  }

  for (let o = 0; o < nObjetivos; o++) {
    const ordenados = [...frente].sort(
      (a, b) => soluciones[a].objetivos[o] - soluciones[b].objetivos[o],
    );
    soluciones[ordenados[0]].distanciaCrowding = Infinity;
    soluciones[ordenados[m - 1]].distanciaCrowding = Infinity;
    const rango = soluciones[ordenados[m - 1]].objetivos[o] - soluciones[ordenados[0]].objetivos[o];
    if (rango === 0) continue;
    for (let j = 1; j < m - 1; j++) {
      const idx = ordenados[j];
      soluciones[idx].distanciaCrowding +=
        (soluciones[ordenados[j + 1]].objetivos[o] - soluciones[ordenados[j - 1]].objetivos[o]) /
        rango;
    }
  }
}

// ---------------------------------------------------------------------------
// Componente 3: seleccion por torneo binario
// ---------------------------------------------------------------------------

/** Torneo binario: gana el de menor rango de frente; a igual rango, mayor crowding. */
export function seleccionarTorneo(poblacion: SolucionNSGA2[], aleatorio: () => number): SolucionNSGA2 {
  const a = poblacion[Math.floor(aleatorio() * poblacion.length)];
  const b = poblacion[Math.floor(aleatorio() * poblacion.length)];
  if (a.rangoFrente !== b.rangoFrente) return a.rangoFrente < b.rangoFrente ? a : b;
  return a.distanciaCrowding > b.distanciaCrowding ? a : b;
}

// ---------------------------------------------------------------------------
// Componente 4: cruce SBX y mutacion polinomial
// ---------------------------------------------------------------------------

/**
 * Cruce binario simulado (SBX, Deb & Agrawal 1995) sobre genotipos normalizados [0,1].
 * etaC = 20 (valor recomendado en Deb et al. 2002).
 */
export function cruceSBX(
  p1: number[],
  p2: number[],
  aleatorio: () => number,
  etaC: number = 20,
): [number[], number[]] {
  const d = p1.length;
  const c1 = new Array<number>(d);
  const c2 = new Array<number>(d);
  for (let i = 0; i < d; i++) {
    const u = aleatorio();
    let beta: number;
    if (u <= 0.5) {
      beta = Math.pow(2 * u, 1 / (etaC + 1));
    } else {
      beta = Math.pow(1 / (2 * (1 - u)), 1 / (etaC + 1));
    }
    c1[i] = 0.5 * ((1 + beta) * p1[i] + (1 - beta) * p2[i]);
    c2[i] = 0.5 * ((1 - beta) * p1[i] + (1 + beta) * p2[i]);
    c1[i] = Math.min(1, Math.max(0, c1[i]));
    c2[i] = Math.min(1, Math.max(0, c2[i]));
  }
  return [c1, c2];
}

/**
 * Mutacion polinomial sobre genotipos normalizados [0,1]. etaM = 20 (Deb et al. 2002).
 */
export function mutacionPolinomial(
  genotipo: number[],
  aleatorio: () => number,
  probabilidadMutacion: number,
  etaM: number = 20,
): number[] {
  const d = genotipo.length;
  const hijo = genotipo.slice();
  for (let i = 0; i < d; i++) {
    if (aleatorio() > probabilidadMutacion) continue;
    const u = aleatorio();
    let delta: number;
    if (u < 0.5) {
      delta = Math.pow(2 * u, 1 / (etaM + 1)) - 1;
    } else {
      delta = 1 - Math.pow(2 * (1 - u), 1 / (etaM + 1));
    }
    hijo[i] = Math.min(1, Math.max(0, hijo[i] + delta));
  }
  return hijo;
}

// ---------------------------------------------------------------------------
// Evaluacion, creacion de individuos y bucle principal
// ---------------------------------------------------------------------------

function evaluar(solucion: SolucionNSGA2, problema: ProblemaOptimizacion): void {
  const { objetivos, restricciones } = problema.evaluar(solucion.valores);
  solucion.objetivos = objetivos;
  solucion.restricciones = restricciones;
  solucion.violacionTotal = restricciones.reduce((acum, g) => acum + Math.max(0, g), 0);
}

function crearDesdeGenotipo(
  genotipo: number[],
  problema: ProblemaOptimizacion,
): SolucionNSGA2 {
  const valores = problema.variables.map((def, i) => decodificarVariable(def, genotipo[i]));
  const solucion: SolucionNSGA2 = {
    genotipo,
    valores,
    objetivos: [],
    restricciones: [],
    violacionTotal: 0,
    rangoFrente: 0,
    distanciaCrowding: 0,
  };
  evaluar(solucion, problema);
  return solucion;
}

function generarDescendencia(
  poblacion: SolucionNSGA2[],
  configuracion: ConfiguracionNSGA2,
  problema: ProblemaOptimizacion,
  aleatorio: () => number,
): SolucionNSGA2[] {
  const hijos: SolucionNSGA2[] = [];
  while (hijos.length < configuracion.poblacion) {
    const p1 = seleccionarTorneo(poblacion, aleatorio);
    const p2 = seleccionarTorneo(poblacion, aleatorio);
    let g1 = p1.genotipo.slice();
    let g2 = p2.genotipo.slice();
    if (aleatorio() < configuracion.probabilidadCruce) {
      [g1, g2] = cruceSBX(p1.genotipo, p2.genotipo, aleatorio);
    }
    g1 = mutacionPolinomial(g1, aleatorio, configuracion.probabilidadMutacion);
    g2 = mutacionPolinomial(g2, aleatorio, configuracion.probabilidadMutacion);
    hijos.push(crearDesdeGenotipo(g1, problema));
    hijos.push(crearDesdeGenotipo(g2, problema));
  }
  return hijos.slice(0, configuracion.poblacion);
}

export function optimizarNSGA2(
  problema: ProblemaOptimizacion,
  configuracion: ConfiguracionNSGA2,
): ResultadoNSGA2 {
  const aleatorio = crearAleatorio(configuracion.semilla);

  let poblacion: SolucionNSGA2[] = Array.from({ length: configuracion.poblacion }, () => {
    const genotipo = problema.variables.map(() => aleatorio());
    return crearDesdeGenotipo(genotipo, problema);
  });

  for (let generacion = 0; generacion < configuracion.generaciones; generacion++) {
    const descendencia = generarDescendencia(poblacion, configuracion, problema, aleatorio);
    const combinada = poblacion.concat(descendencia);

    const frentes = ordenamientoNoDominado(combinada);
    for (let f = 0; f < frentes.length; f++) {
      asignarDistanciaCrowding(frentes[f], combinada);
      for (const idx of frentes[f]) combinada[idx].rangoFrente = f;
    }

    const siguiente: SolucionNSGA2[] = [];
    for (let f = 0; f < frentes.length && siguiente.length < configuracion.poblacion; f++) {
      const frente = frentes[f];
      if (siguiente.length + frente.length <= configuracion.poblacion) {
        for (const idx of frente) siguiente.push(combinada[idx]);
      } else {
        const faltantes = configuracion.poblacion - siguiente.length;
        const ordenados = [...frente].sort(
          (a, b) => combinada[b].distanciaCrowding - combinada[a].distanciaCrowding,
        );
        for (let i = 0; i < faltantes; i++) siguiente.push(combinada[ordenados[i]]);
      }
    }
    poblacion = siguiente;
  }

  const frentesFinales = ordenamientoNoDominado(poblacion);
  for (let f = 0; f < frentesFinales.length; f++) {
    for (const idx of frentesFinales[f]) poblacion[idx].rangoFrente = f;
  }
  const frentes = frentesFinales.map((f) => f.map((i) => poblacion[i]));

  return {
    generaciones: configuracion.generaciones,
    soluciones: poblacion,
    frentes,
    frentePareto: frentes[0] ?? [],
  };
}