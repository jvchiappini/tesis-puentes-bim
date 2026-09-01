import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EntradaLosa, SitioLosa } from "@tesis-puentes-bim/engine";

interface Props {
  entrada: EntradaLosa;
  sitio: SitioLosa;
}

/**
 * Visualizador 3D parametrico del puente losa maciza (Three.js): tablero, armadura
 * principal y de reparticion, y apoyos. La misma geometria es la que se exporta al IFC.
 */
export default function BimViewer({ entrada }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current) return;
    const div = contenedor.current;
    const ancho = div.clientWidth || 700;
    const alto = 380;

    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0xeef1f5);
    const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(ancho, alto);
    div.appendChild(renderer.domElement);

    const controles = new OrbitControls(camara, renderer.domElement);
    controles.enableDamping = true;

    const luz = new THREE.DirectionalLight(0xffffff, 1.2);
    luz.position.set(15, 30, 10);
    escena.add(luz);
    escena.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Escala: 1 unidad = 1 m. El puente va a lo largo de Z.
    const { luz_diseno: L, ancho_calzada: B, espesor_losa: h } = entrada;
    const c = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

    // Tablero (losa maciza)
    const tablero = new THREE.Mesh(
      new THREE.BoxGeometry(B, h, L),
      new THREE.MeshStandardMaterial({ color: 0x9aa7b0, roughness: 0.85, transparent: true, opacity: 0.75 }),
    );
    tablero.position.set(0, h / 2, L / 2);
    escena.add(tablero);

    // Apoyos (estribos)
    const apoyoGeom = new THREE.BoxGeometry(B + 0.4, 0.6, 0.5);
    const apoyoMat = new THREE.MeshStandardMaterial({ color: 0x6b7680 });
    for (const z of [0.25, L - 0.25]) {
      const apoyo = new THREE.Mesh(apoyoGeom, apoyoMat);
      apoyo.position.set(0, 0.3, z);
      escena.add(apoyo);
    }

    // Armadura principal (paralela al transito, a lo largo de Z, cerca de la cara inferior)
    const nBarras = Math.max(2, Math.round(B / entrada.separacion_armadura_principal));
    const barraGeom = new THREE.CylinderGeometry(entrada.diametro_armadura_principal / 1000 / 2, entrada.diametro_armadura_principal / 1000 / 2, L - 0.3, 8);
    const barraMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.4, roughness: 0.4 });
    for (let i = 0; i < nBarras; i++) {
      const x = -B / 2 + ((i + 0.5) * B) / nBarras;
      const barra = new THREE.Mesh(barraGeom, barraMat);
      barra.rotation.x = Math.PI / 2;
      barra.position.set(x, entrada.recubrimiento + entrada.diametro_armadura_principal / 1000 / 2, L / 2);
      escena.add(barra);
    }

    // Armadura de reparticion (transversal, a lo largo de X)
    const nTransv = Math.max(2, Math.round(L / entrada.separacion_armadura_reparticion));
    const transvGeom = new THREE.CylinderGeometry(entrada.diametro_armadura_reparticion / 1000 / 2, entrada.diametro_armadura_reparticion / 1000 / 2, B - 0.2, 8);
    const transvMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, metalness: 0.4, roughness: 0.4 });
    for (let i = 0; i < nTransv; i++) {
      const z = 0.15 + (i * (L - 0.3)) / nTransv;
      const barra = new THREE.Mesh(transvGeom, transvMat);
      barra.rotation.z = Math.PI / 2;
      barra.position.set(0, entrada.recubrimiento + entrada.diametro_armadura_reparticion / 1000 / 2, z);
      escena.add(barra);
    }

    // Ejes / rejilla de referencia
    const rejilla = new THREE.GridHelper(60, 20, 0xb0b8c0, 0xd0d6dc);
    rejilla.position.set(0, 0, L / 2);
    escena.add(rejilla);

    // Encuadre
    camara.position.set(L * 0.8, L * 0.6, L * 0.6);
    camara.lookAt(c(0, h / 2, L / 2));
    controles.target = c(0, h / 2, L / 2);

    const animar = () => {
      requestAnimationFrame(animar);
      controles.update();
      renderer.render(escena, camara);
    };
    animar();

    return () => {
      cancelAnimationFrame(0);
      renderer.dispose();
      div.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrada.luz_diseno, entrada.ancho_calzada, entrada.espesor_losa, entrada.separacion_armadura_principal, entrada.separacion_armadura_reparticion, entrada.recubrimiento]);

  return <div ref={contenedor} className="visor3d" />;
}