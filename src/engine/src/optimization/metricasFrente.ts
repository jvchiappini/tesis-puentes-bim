/**
 * Metricas de calidad de frentes de Pareto usadas para validar el NSGA-II contra los
 * benchmarks de la literatura (ZDT1, SRN) -- ver docs/software/plan-de-validacion.md.
 *
 * Se definen ANTES de correr los benchmarks (mismo principio del plan de validacion:
 * el criterio de aceptacion se fija antes de ver los resultados, no despues).
 */

export function distanciaEuclidea(a: number[], b: number[]): number {
  let suma = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    suma += d * d;
  }
  return Math.sqrt(suma);
}

/**
 * Distancia generacional (GD, Van Veldhuizen & Lamont 1998): distancia media (en el
 * espacio de objetivos) entre cada solucion del frente obtenido y su solucion mas
 * cercana del frente de referencia. GD = 0 significa convergencia perfecta.
 */
export function distanciaGeneracional(frente: number[][], frenteReferencia: number[][]): number {
  if (frente.length === 0 || frenteReferencia.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  let suma = 0;
  for (const punto of frente) {
    let minimo = Number.POSITIVE_INFINITY;
    for (const ref of frenteReferencia) {
      const d = distanciaEuclidea(punto, ref);
      if (d < minimo) minimo = d;
    }
    suma += minimo * minimo;
  }
  return Math.sqrt(suma / frente.length);
}

/**
 * Indice de spread Delta (Deb et al., 2002, ec. 9): mide distribucion uniforme y
 * cobertura de los extremos del frente. Delta = 0 es una distribucion perfectamente
 * uniforme que alcanza ambos extremos del frente verdadero.
 *
 * @param frente Frente obtenido (cada punto = vector de objetivos).
 * @param extremos [[min f1, max f2], [max f1, min f2]]: puntos extremos del frente de referencia.
 */
export function indiceSpread(frente: number[][], extremos: number[][]): number {
  if (frente.length < 2 || extremos.length < 2) {
    return Number.POSITIVE_INFINITY;
  }
  const ordenado = [...frente].sort((a, b) => a[0] - b[0]);
  const distancias: number[] = [];
  let sumaDist = 0;
  for (let i = 0; i < ordenado.length - 1; i++) {
    const d = distanciaEuclidea(ordenado[i], ordenado[i + 1]);
    distancias.push(d);
    sumaDist += d;
  }
  const dPromedio = sumaDist / distancias.length;
  let sumaAbs = 0;
  for (const d of distancias) sumaAbs += Math.abs(d - dPromedio);

  const df = distanciaEuclidea(ordenado[0], extremos[0]);
  const dl = distanciaEuclidea(ordenado[ordenado.length - 1], extremos[1]);
  return (df + dl + sumaAbs) / (df + dl + distancias.length * dPromedio);
}

/**
 * Normaliza un frente de objetivos a [0,1]^M usando el minimo y maximo por objetivo
 * dados. Util para computar GD cuando los objetivos tienen escalas muy distintas (ej. SRN).
 */
export function normalizarFrente(
  frente: number[][],
  minimos: number[],
  maximos: number[],
): number[][] {
  return frente.map((p) =>
    p.map((v, i) => {
      const rango = maximos[i] - minimos[i];
      if (rango === 0) return 0;
      return (v - minimos[i]) / rango;
    }),
  );
}