import { useState } from "react";
import {
  parsearYamlTipologia,
  LosaMaciza,
  optimizarNSGA2,
  decodificarEntradaLosa,
  type SitioLosa,
  type DefinicionVariable,
} from "@tesis-puentes-bim/engine";
import yamlConfig from "../../../data/parametros_tipologia/losa_maciza.yaml?raw";

const configuracion = parsearYamlTipologia(yamlConfig);
const modelo = new LosaMaciza(configuracion);

interface FilaPareto {
  h: number;
  diamPrincipal: number;
  sepPrincipal: number;
  diamReparticion: number;
  sepReparticion: number;
  costo: number;
  peso: number;
  factible: boolean;
}

function extraerFilas(
  soluciones: { genotipo: number[]; objetivos: number[]; violacionTotal: number }[],
  variables: DefinicionVariable[],
  sitio: SitioLosa,
): FilaPareto[] {
  return soluciones.map((solucion) => {
    const entrada = decodificarEntradaLosa(variables, solucion.genotipo, sitio);
    return {
      h: entrada.espesor_losa,
      diamPrincipal: entrada.diametro_armadura_principal,
      sepPrincipal: entrada.separacion_armadura_principal,
      diamReparticion: entrada.diametro_armadura_reparticion,
      sepReparticion: entrada.separacion_armadura_reparticion,
      costo: solucion.objetivos[0],
      peso: solucion.objetivos[1],
      factible: solucion.violacionTotal <= 0,
    };
  });
}

function GraficoPareto({ filas }: { filas: FilaPareto[] }) {
  const ancho = 720;
  const alto = 420;
  const margen = 46;
  const factibles = filas.filter((f) => f.factible);
  if (filas.length === 0) return <p>Sin soluciones.</p>;
  const minX = Math.min(...filas.map((f) => f.costo));
  const maxX = Math.max(...filas.map((f) => f.costo));
  const minY = Math.min(...filas.map((f) => f.peso));
  const maxY = Math.max(...filas.map((f) => f.peso));
  const px = (x: number) => margen + ((x - minX) / (maxX - minX || 1)) * (ancho - margen * 2);
  const py = (y: number) => alto - margen - ((y - minY) / (maxY - minY || 1)) * (alto - margen * 2);
  return (
    <div className="grafico">
      <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`}>
        <line x1={margen} y1={alto - margen} x2={ancho - margen} y2={alto - margen} stroke="#444" />
        <line x1={margen} y1={margen} x2={margen} y2={alto - margen} stroke="#444" />
        <text x={ancho / 2} y={alto - 8} textAnchor="middle" fontSize="13">
          Costo de materiales (USD/m²)
        </text>
        <text x={14} y={alto / 2} textAnchor="middle" fontSize="13" transform={`rotate(-90 14 ${alto / 2})`}>
          Peso propio (kN/m²)
        </text>
        {filas.map((f, i) => (
          <circle
            key={i}
            cx={px(f.costo)}
            cy={py(f.peso)}
            r={4.5}
            fill={f.factible ? "#1a7f37" : "#d1242f"}
          />
        ))}
      </svg>
      <p className="leyenda">
        <span className="dot verde" /> factible · <span className="dot rojo" /> infactible ·{" "}
        <b>{factibles.length}</b>/{filas.length} soluciones del frente factibles
      </p>
    </div>
  );
}

export default function App() {
  const [luz, setLuz] = useState(12);
  const [ancho, setAncho] = useState(7.3);
  const [costoH, setCostoH] = useState(150);
  const [costoA, setCostoA] = useState(1.5);
  const [clase, setClase] = useState<"normal" | "agresiva">("normal");
  const [corriendo, setCorriendo] = useState(false);
  const [filas, setFilas] = useState<FilaPareto[] | null>(null);
  const [resumen, setResumen] = useState<string>("");

  function ejecutar() {
    setCorriendo(true);
    setResumen("");
    setTimeout(() => {
      try {
        const sitio: SitioLosa = {
          luz_diseno: luz,
          ancho_calzada: ancho,
          costo_unitario_hormigon: costoH,
          costo_unitario_acero: costoA,
          clase_exposicion: clase,
        };
        const problema = modelo.construirProblemaNSGA2(sitio, "basico");
        const resultado = optimizarNSGA2(problema, {
          poblacion: 60,
          generaciones: 200,
          probabilidadCruce: 0.9,
          probabilidadMutacion: 1 / problema.variables.length,
          semilla: 2026,
        });
        const f = extraerFilas(resultado.frentePareto, problema.variables, sitio);
        setFilas(f);
        const fact = f.filter((x) => x.factible);
        const barato = fact.length
          ? fact.reduce((a, b) => (b.costo < a.costo ? b : a))
          : null;
        setResumen(
          `Frente: ${f.length} soluciones (${fact.length} factibles). ` +
            (barato
              ? `Más barata: h=${(barato.h * 100).toFixed(0)} cm, Ø${barato.diamPrincipal} c/${(barato.sepPrincipal * 100).toFixed(0)} cm → ${barato.costo.toFixed(1)} USD/m², ${barato.peso.toFixed(1)} kN/m².`
              : "Sin soluciones factibles en el frente."),
        );
      } catch (e) {
        setResumen(`Error: ${(e as Error).message}`);
      } finally {
        setCorriendo(false);
      }
    }, 50);
  }

  return (
    <main>
      <header>
        <h1>Tesis Puentes BIM — Losa maciza de hormigón armado</h1>
        <p className="sub">
          NSGA-II (implementación propia, validada contra ZDT1/SRN) + modelo estructural
          AASHTO STANDARD 2002 parametrizado desde{" "}
          <code>data/parametros_tipologia/losa_maciza.yaml</code>. Demo v1.
        </p>
      </header>

      <section className="panel">
        <h2>Parámetros de sitio</h2>
        <div className="form">
          <label>
            Luz de diseño (m)
            <input type="number" step="0.5" min="4" max="40" value={luz} onChange={(e) => setLuz(Number(e.target.value))} />
          </label>
          <label>
            Ancho de calzada (m)
            <input type="number" step="0.1" min="3" max="20" value={ancho} onChange={(e) => setAncho(Number(e.target.value))} />
          </label>
          <label>
            Costo hormigón (USD/m³)
            <input type="number" step="5" min="0" value={costoH} onChange={(e) => setCostoH(Number(e.target.value))} />
          </label>
          <label>
            Costo acero (USD/kg)
            <input type="number" step="0.1" min="0" value={costoA} onChange={(e) => setCostoA(Number(e.target.value))} />
          </label>
          <label>
            Clase de exposición
            <select value={clase} onChange={(e) => setClase(e.target.value as "normal" | "agresiva")}>
              <option value="normal">Normal (rec. 2,5 cm)</option>
              <option value="agresiva">Agresiva (rec. 5,0 cm)</option>
            </select>
          </label>
        </div>
        <button onClick={ejecutar} disabled={corriendo}>
          {corriendo ? "Optimizando…" : "Optimizar (NSGA-II)"}
        </button>
        {resumen && <p className="resumen">{resumen}</p>}
      </section>

      {filas && (
        <section className="panel">
          <h2>Frente de Pareto — costo vs. peso propio</h2>
          <GraficoPareto filas={filas} />
          <table>
            <thead>
              <tr>
                <th>h (cm)</th>
                <th>Ø principal (mm)</th>
                <th>Sep. principal (cm)</th>
                <th>Ø repartición (mm)</th>
                <th>Sep. repartición (cm)</th>
                <th>Costo (USD/m²)</th>
                <th>Peso (kN/m²)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...filas]
                .sort((a, b) => a.costo - b.costo)
                .map((f, i) => (
                  <tr key={i} className={f.factible ? "" : "infactible"}>
                    <td>{(f.h * 100).toFixed(0)}</td>
                    <td>{f.diamPrincipal}</td>
                    <td>{(f.sepPrincipal * 100).toFixed(0)}</td>
                    <td>{f.diamReparticion}</td>
                    <td>{(f.sepReparticion * 100).toFixed(0)}</td>
                    <td>{f.costo.toFixed(1)}</td>
                    <td>{f.peso.toFixed(2)}</td>
                    <td>{f.factible ? "✓" : "✗"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      <footer>
        Herramienta académica (Trabajo Final de Grado, Ing. Civil). No reemplaza el
        cálculo, criterio y firma de un ingeniero matriculado.
      </footer>
    </main>
  );
}