export function getBrazilTime(): Date {
  // Cria a data atual em UTC
  const now = new Date();

  // Cria uma data formatada no timezone brasileiro (America/Sao_Paulo)
  // e reconverte para Date real (com a hora ajustada)
  const brazilTimeString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  return new Date(brazilTimeString);
}

export function transformDateToBrazilTime(date: Date): Date {
  const brazilTimeString = date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  return new Date(brazilTimeString);
}