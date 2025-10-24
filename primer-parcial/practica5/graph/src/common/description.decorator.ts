// Pequeño decorador local `@Description` para cumplir con la consigna del taller.
// No realiza cambios funcionales en tiempo de ejecución; sirve para documentar
// con la sintaxis solicitada por el docente.
export function Description(text: string): MethodDecorator & ClassDecorator {
  return () => {
    /* decorador no-op: mantiene la firma @Description('...') en el código */
  };
}
