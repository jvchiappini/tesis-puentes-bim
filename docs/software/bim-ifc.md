# Generación del modelo BIM (IFC)

Cómo se mapea la solución óptima del frente de Pareto a entidades IFC, y cómo se aplican
los requisitos de información según ISO 19650 (ver `docs/tesis/referencias.bib`,
`iso19650-1` e `iso19650-2`).

## Implementado (Fase 3/4, 2026-08-31)

`src/engine/src/bim/ifcGenerator.ts` + `src/engine/src/bim/iso19650Metadata.ts`, usando
**web-ifc** (ThatOpen/engine_web-ifc) para ESCRITURA de IFC — confirmado que soporta
lectura Y escritura (ver `docs/tesis/bitacora-busquedas.md`). Schema **IFC4**.

### Estructura del modelo generado

```
IFCPROJECT                    <- Name/Description/Phase = metadata ISO 19650
└─ IFCRELAGGREGATES
   └─ IFCSITE                 <- emplazamiento (CompositionType=ELEMENT, cota 0)
      └─ IFCRELCONTAINEDINSPATIALSTRUCTURE
         └─ IFCSLAB ("Losa maciza - tablero", PredefinedType=BASESLAB)
            ├─ IFCPRODUCTDEFINITIONSHAPE
            │  └─ IFCSHAPEREPRESENTATION (Body / SweptSolid)
            │     └─ IFCEXTRUDEDAREASOLID (IFCRECTANGLEPROFILEDEF ancho×espesor, extr. luz)
            ├─ IFCRELASSOCIATESMATERIAL -> IFCMATERIAL ("Hormigon armado f'c=… MPa")
            └─ IFCRELDEFINESBYPROPERTIES -> IFCPROPERTYSET "Pset_TesisDiseno"
               └─ IFCPROPERTYSINGLEVALUE (variables de diseño, resultados estructurales,
                                           normativa y metadata ISO 19650)
```

Además del IFCPROJECT, hay `IFCUNITASSIGNMENT` con unidades SI (m, m², N, Pa) y
`IFCGEOMETRICREPRESENTATIONCONTEXT` (Model, 3D, precisión 1e-5).

### Reglas de escritura con web-ifc (bajo nivel)

- Los códigos de entidad se toman de las constantes sueltas del runtime
  (`webIfc.IFCPROJECT`, `webIfc.IFCSLAB`, …), no del objeto `IFC` (que no se exporta).
- Los **tipos definidos** (IfcIdentifier, IfcReal, IfcLabel, IfcText, IfcBoolean) se pasan
  como instancias del namespace `webIfc.IFC4` (ej. `new IFC4.IfcReal(0.75)`); un número o
  string crudo hace fallar el serializador en atributos tipo `IfcValue`/`IfcIdentifier`.
- Evitar `null` consecutivos en entidades con muchos atributos (IFCPROJECT/IFCSITE): el
  serializador puede desplazar columnas; usar strings descriptivos en Description/
  ObjectType/LongName/Phase.
- En el navegador hay que apuntar el WASM: el llamador provee `inicializarApi` que hace
  `api.Init((_path, _prefix) => <url del wasm>)`. En Vite: `import wasm from "web-ifc/web-ifc.wasm?url"`.

### ISO 19650

El `IFCPROJECT` (Name, Description, Phase) y el `Pset_TesisDiseno` portan: título,
descripción, autor, organización, fecha, fase ("Diseno"), estado ("Entregable de diseno"),
normativa aplicada y filosofía normativa (`aashto_standard_2002`). Esto cumple el
requisito de gestionar la información del contenedor (PIM) con trazabilidad.

## Validación

`src/engine/tests/ifcGenerator.test.ts` genera el IFC de un diseño factible y verifica:
archivo STEP/ISO-10303-21 con schema IFC4, presencia de IFCPROJECT/IFCSITE/IFCSLAB/
IFCPROPERTYSET/IFCRELAGGREGATES/IFCRELCONTAINEDINSPATIALSTRUCTURE/IFCMATERIAL (1 de cada),
valores del diseño en el pset, y que **web-ifc puede re-leer el archivo** (`OpenModel`).

## Pendiente

- Vista 3D por parseo del propio IFC (web-ifc-three) — hoy el visor de `src/web/` es
  paramétrico (Three.js) sobre la misma geometría.
- Extender el modelo a más elementos (pilas, estribos, armadura como entidades
  IFCTENDONAR/IFCREINFORCINGBAR), necesario para la Fase 4 completa.