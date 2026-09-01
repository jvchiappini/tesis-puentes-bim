/**
 * Formato institucional del documento. AJUSTAR con el reglamento real de la facultad
 * (Fase 0 del ROADMAP.md) antes de compilar una versión "de verdad".
 *
 * Valores de acá son un punto de partida típico de tesis de ingeniería en Paraguay —
 * NO asumir que son los correctos sin verificar contra el reglamento.
 */

export const estilos = {
  fuente: "Times New Roman",
  tamanioTextoCuerpo: 24,     // en half-points: 24 = 12pt
  tamanioTitulo1: 32,         // 16pt
  tamanioTitulo2: 28,         // 14pt
  interlineado: 360,          // 1.5 líneas (line spacing en twentieths of a point)
  margenes: {
    // en twentieths of a point (1440 = 1 pulgada)
    superior: 1440,
    inferior: 1440,
    izquierdo: 1701, // ~3cm, típico para encuadernación
    derecho: 1440,
  },
  numeracionPaginas: true,
  tablaDeContenidosAutomatica: true,
};
