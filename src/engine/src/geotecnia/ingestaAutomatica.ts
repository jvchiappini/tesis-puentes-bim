/**
 * Modulo PLANIFICADO (no implementado) para ingesta automatica de datos geoteccnicos.
 * Ver docs/software/extension-geotecnia-topografia.md para el detalle completo y las
 * reglas de honestidad tecnica (todo resultado debe marcarse esEstimado=true con fuente).
 */

export interface ParametrosSuelo {
  valor: unknown;
  fuente: string;
  esEstimado: true;
  resolucionOConfianza: string;
  nota: string;
}

export async function obtenerParametrosSueloAutomatico(coordenadas: { lat: number; lng: number }): Promise<ParametrosSuelo> {
  throw new Error(
    "TODO: ingesta automatica de geotecnia -- planificada, no implementada. Ver docs/software/extension-geotecnia-topografia.md"
  );
}
