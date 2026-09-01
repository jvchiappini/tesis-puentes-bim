import { useState } from "react";
import {
  parsearYamlTipologia,
  LosaMaciza,
  optimizarNSGA2,
  decodificarEntradaLosa,
  generarIFC,
  type SitioLosa,
  type DefinicionVariable,
  type EntradaLosa,
  type IfcAPICompatible,
} from "@tesis-puentes-bim/engine";
import { IfcAPI } from "web-ifc";
import wasmUrl from "web-ifc/web-ifc.wasm?url";
import yamlConfig from "../../../data/parametros_tipologia/losa_maciza.yaml?raw";
import BimViewer from "./BimViewer";

const configuracion = parsearYamlTipologia(yamlConfig);
const modelo = new LosaMaciza(configuracion);

interface FilaPareto {
  genotipo: number[];
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
      genotipo: solucion.genotipo,
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

// Inicializa web-ifc en el navegador apuntando al WASM empaquetado por Vite.
async function inicializarApi(): Promise<IfcAPICompatible> {
  const api = new IfcAPI();
  await api.Init((_path, _prefix) => wasmUrl);
  return api as unknown as IfcAPICompatible;
}

function GraficoPareto({ filas, seleccion, onSeleccionar }: {
  filas: FilaPareto[];
  seleccion: number | null;
  onSeleccionar: (i: number) => void;
}) {
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
            r={seleccion === i ? 7 : 4.5}
            fill={f.factible ? "#1a7f37" : "#d1242f"}
            onClick={() => onSeleccionar(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      <p className="leyenda">
        <span className="dot verde" /> factible · <span className="dot rojo" /> infactible ·{" "}
        <b>{factibles.length}</b>/{filas.length} factibles · clic en un punto para ver en 3D / IFC
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
  const [variables, setVariables] = useState<DefinicionVariable[]>([]);
  const [sitio, setSitio] = useState<SitioLosa | null>(null);
  const [seleccionIndex, setSeleccionIndex] = useState<number | null>(null);
  const [seleccion, setSeleccion] = useState<EntradaLosa | null>(null);
  const [generandoIfc, setGenerandoIfc] = useState(false);
  const [resumen, setResumen] = useState<string>("");

  function ejecutar() {
    setCorriendo(true);
    setResumen("");
    setSeleccion(null);
    setSeleccionIndex(null);
    setTimeout(() => {
      try {
        const s: SitioLosa = {
          luz_diseno: luz,
          ancho_calzada: ancho,
          costo_unitario_hormigon: costoH,
          costo_unitario_acero: costoA,
          clase_exposicion: clase,
        };
        const problema = modelo.construirProblemaNSGA2(s, "basico");
        const resultado = optimizarNSGA2(problema, {
          poblacion: 60,
          generaciones: 200,
          probabilidadCruce: 0.9,
          probabilidadMutacion: 1 / problema.variables.length,
          semilla: 2026,
        });
        const f = extraerFilas(resultado.frentePareto, problema.variables, s);
        setFilas(f);
        setVariables(problema.variables);
        setSitio(s);
        const fact = f.filter((x) => x.factible);
        const barato = fact.length ? fact.reduce((a, b) => (b.costo < a.costo ? b : a)) : null;
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

  function seleccionar(i: number) {
    if (!variables.length || !sitio) return;
    const entrada = decodificarEntradaLosa(variables, filas![i].genotipo, sitio);
    setSeleccionIndex(i);
    setSeleccion(entrada);
  }

  async function descargarIFC() {
    if (!seleccion) return;
    setGenerandoIfc(true);
    try {
      const resultado = modelo.evaluar(seleccion, "basico");
      const bytes = await generarIFC(
        {
          nombre: "Puente losa maciza",
          descripcion: "Modelo IFC generado por Tesis Puentes BIM (NSGA-II + AASHTO STANDARD 2002)",
          luz: seleccion.luz_diseno,
          ancho: seleccion.ancho_calzada,
          espesor: seleccion.espesor_losa,
          diseno: seleccion,
          resultado,
        },
        { inicializarApi },
      );
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/step" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "puente-losa-maciza.ifc";
      a.click();
      URL.revokeObjectURL(url);
      setResumen("Archivo IFC4 descargado (abrirlo en un visor IFC compatible).");
    } catch (e) {
      setResumen(`Error generando IFC: ${(e as Error).message}`);
    } finally {
      setGenerandoIfc(false);
    }
  }

  const seleccionEvaluada = seleccion ? modelo.evaluar(seleccion, "basico") : null;

  return (
    <main>
      <header>
        <h1>Tesis Puentes BIM — Losa maciza de hormigón armado</h1>
        <p className="sub">
          NSGA-II (implementación propia, validada contra ZDT1/SRN) + modelo estructural
          AASHTO STANDARD 2002 parametrizado desde{" "}
          <code>data/parametros_tipologia/losa_maciza.yaml</code> + generación de modelo
          IFC (web-ifc).
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
          <GraficoPareto
            filas={filas}
            seleccion={seleccionIndex}
            onSeleccionar={seleccionar}
          />
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
                  <tr
                    key={i}
                    className={f.factible ? "" : "infactible"}
                    onClick={() => seleccionar(i)}
                    style={{ cursor: "pointer" }}
                  >
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

      {seleccion && seleccionEvaluada && (
        <section className="panel">
          <h2>Vista BIM de la solución seleccionada</h2>
          <p className="resumen">
            h={(seleccion.espesor_losa * 100).toFixed(0)} cm · Ø{seleccion.diametro_armadura_principal} c/
            {(seleccion.separacion_armadura_principal * 100).toFixed(0)} cm (principal) · Ø
            {seleccion.diametro_armadura_reparticion} c/
            {(seleccion.separacion_armadura_reparticion * 100).toFixed(0)} cm (repartición) · f'c=
            {seleccion.resistencia_hormigon} MPa · fy={seleccion.grado_acero} MPa · costo{" "}
            {seleccionEvaluada.costoPorM2.toFixed(1)} USD/m² · peso{" "}
            {seleccionEvaluada.pesoPropioPorM2.toFixed(2)} kN/m²
          </p>
          <BimViewer entrada={seleccion} sitio={seleccion} />
          <div className="acciones">
            <button onClick={descargarIFC} disabled={generandoIfc}>
              {generandoIfc ? "Generando IFC…" : "Descargar modelo IFC4 (.ifc)"}
            </button>
          </div>
        </section>
      )}

      <footer>
        Herramienta académica (Trabajo Final de Grado, Ing. Civil). No reemplaza el
        cálculo, criterio y firma de un ingeniero matriculado.
      </footer>
    </main>
  );
}