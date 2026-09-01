/**
 * Interfaz comun a toda tipologia estructural del proyecto.
 * Ver docs/software/arquitectura.md.
 */

export interface BaseTipologia {
  variablesDiseno(): Record<string, unknown>;
  calcularSolicitaciones(parametros: Record<string, number>): Record<string, number>;
  verificarEstadosLimite(parametros: Record<string, number>): Record<string, number>;
  costo(parametros: Record<string, number>): number;
  pesoPropio(parametros: Record<string, number>): number;
}
