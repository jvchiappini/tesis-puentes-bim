/**
 * Evaluador de expresiones aritmeticas seguras (sin eval/Function) usado por el motor
 * para interpretar FORMULAS parametrizadas en el YAML de la tipologia
 * (data/parametros_tipologia/*.yaml) -- ej. impacto "50/(L+125)", espesor minimo
 * "1.2*(S+10)/30", armadura de reparticion "100/sqrt(S)".
 *
 * Asi, las formulas son datos modificables (parametros), no codigo.
 *
 * Soporta: numeros, identificadores (variables), + - * / ( ) y las funciones
 * sqrt, floor, ceil, round, abs, pow, max, min.
 */

interface Estado {
  texto: string;
  pos: number;
}

function error(estado: Estado, mensaje: string): never {
  throw new Error(`Expresion invalida en pos ${estado.pos}: ${mensaje} -- "${estado.texto}"`);
}

function saltarEspacios(estado: Estado): void {
  while (estado.pos < estado.texto.length && /\s/.test(estado.texto[estado.pos])) {
    estado.pos++;
  }
}

function leerNumero(estado: Estado): number {
  const inicio = estado.pos;
  while (estado.pos < estado.texto.length && /[0-9.]/.test(estado.texto[estado.pos])) {
    estado.pos++;
  }
  if (inicio === estado.pos) error(estado, "se esperaba un numero");
  return Number.parseFloat(estado.texto.slice(inicio, estado.pos));
}

function leerIdentificador(estado: Estado): string {
  const inicio = estado.pos;
  while (estado.pos < estado.texto.length && /[a-zA-Z_]/.test(estado.texto[estado.pos])) {
    estado.pos++;
  }
  if (inicio === estado.pos) error(estado, "identificador invalido");
  return estado.texto.slice(inicio, estado.pos);
}

function parsearPrimario(estado: Estado, variables: Record<string, number>): number {
  saltarEspacios(estado);
  const ch = estado.texto[estado.pos];
  if (ch === "(") {
    estado.pos++;
    const valor = parsearExpresion(estado, variables);
    saltarEspacios(estado);
    if (estado.texto[estado.pos] !== ")") error(estado, "se esperaba ')'");
    estado.pos++;
    return valor;
  }
  if (ch === "-") {
    estado.pos++;
    return -parsearPrimario(estado, variables);
  }
  if (/[0-9.]/.test(ch ?? "")) {
    return leerNumero(estado);
  }
  if (/[a-zA-Z_]/.test(ch ?? "")) {
    const id = leerIdentificador(estado);
    saltarEspacios(estado);
    if (estado.texto[estado.pos] === "(") {
      estado.pos++;
      const args: number[] = [];
      if (estado.texto[estado.pos] !== ")") {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          args.push(parsearExpresion(estado, variables));
          saltarEspacios(estado);
          if (estado.texto[estado.pos] === ",") {
            estado.pos++;
            continue;
          }
          break;
        }
      }
      if (estado.texto[estado.pos] !== ")") error(estado, "se esperaba ')'");
      estado.pos++;
      return aplicarFuncion(id, args, estado);
    }
    if (!(id in variables)) error(estado, `variable desconocida: ${id}`);
    return variables[id];
  }
  error(estado, `token inesperado: "${ch}"`);
}

function parsearTermino(estado: Estado, variables: Record<string, number>): number {
  let valor = parsearPrimario(estado, variables);
  saltarEspacios(estado);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const op = estado.texto[estado.pos];
    if (op === "*" || op === "/") {
      estado.pos++;
      const derecho = parsearPrimario(estado, variables);
      valor = op === "*" ? valor * derecho : valor / derecho;
    } else {
      break;
    }
  }
  return valor;
}

function parsearExpresion(estado: Estado, variables: Record<string, number>): number {
  let valor = parsearTermino(estado, variables);
  saltarEspacios(estado);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const op = estado.texto[estado.pos];
    if (op === "+" || op === "-") {
      estado.pos++;
      const derecho = parsearTermino(estado, variables);
      valor = op === "+" ? valor + derecho : valor - derecho;
    } else {
      break;
    }
  }
  return valor;
}

function aplicarFuncion(nombre: string, args: number[], estado: Estado): number {
  switch (nombre) {
    case "sqrt":
      if (args.length !== 1) error(estado, `sqrt espera 1 argumento`);
      return Math.sqrt(args[0]);
    case "floor":
      if (args.length !== 1) error(estado, `floor espera 1 argumento`);
      return Math.floor(args[0]);
    case "ceil":
      if (args.length !== 1) error(estado, `ceil espera 1 argumento`);
      return Math.ceil(args[0]);
    case "round":
      if (args.length !== 1) error(estado, `round espera 1 argumento`);
      return Math.round(args[0]);
    case "abs":
      if (args.length !== 1) error(estado, `abs espera 1 argumento`);
      return Math.abs(args[0]);
    case "pow":
      if (args.length !== 2) error(estado, `pow espera 2 argumentos`);
      return Math.pow(args[0], args[1]);
    case "max":
      if (args.length < 1) error(estado, `max espera al menos 1 argumento`);
      return Math.max(...args);
    case "min":
      if (args.length < 1) error(estado, `min espera al menos 1 argumento`);
      return Math.min(...args);
    default:
      error(estado, `funcion desconocida: ${nombre}`);
  }
}

/** Evalua una expresion aritmetica con las variables dadas. */
export function evaluarExpresion(expresion: string, variables: Record<string, number>): number {
  const estado: Estado = { texto: expresion.trim(), pos: 0 };
  const resultado = parsearExpresion(estado, variables);
  saltarEspacios(estado);
  if (estado.pos < estado.texto.length) {
    error(estado, `caracteres sobrantes al final`);
  }
  return resultado;
}