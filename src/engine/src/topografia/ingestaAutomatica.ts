/**
 * Modulo PLANIFICADO (no implementado) para ingesta automatica de datos topograficos
 * (perfil de elevacion aproximado via DEM publico). Ver
 * docs/software/extension-geotecnia-topografia.md -- nunca reemplaza el levantamiento
 * topografico de precision que exige el Manual de Carreteras del Paraguay.
 */

export interface PerfilElevacion {
  valor: unknown;
  fuente: string;
  esEstimado: true;
  resolucionOConfianza: string;
  nota: string;
}

export async function obtenerPerfilElevacionAutomatico(
  coordenadas: { lat: number; lng: number },
  radioMetros: number
): Promise<PerfilElevacion> {
  throw new Error(
    "TODO: ingesta automatica de topografia -- planificada, no implementada. Ver docs/software/extension-geotecnia-topografia.md"
  );
}
