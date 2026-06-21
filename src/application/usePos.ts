import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export function usePos() {
  const categorias = useQuery(api.menuPublico.listarCategorias) ?? [];
  const productos = useQuery(api.menuPublico.listarMenu, {}) ?? [];
  
  const [mesa, setMesa] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener cuenta completa de la mesa actual
  const cuentaMesa = useQuery(api.pedidos.getCuentaMesa, { numero_mesa: mesa }) ?? [];

  const crearPedidoMutation = useMutation(api.pedidos.crearPedido);
  const marcarEntregadoMutation = useMutation(api.pedidos.marcarEntregado);
  const solicitarCuentaMutation = useMutation(api.pedidos.solicitarCuentaMesa);

  const enviarPedido = async (producto: any, notas: string = "") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await crearPedidoMutation({
        platillo: producto.nombre,
        estacion: producto.estacion,
        tiempo_preparacion: producto.tiempo_preparacion,
        dificultad: producto.dificultad,
        numero_mesa: mesa,
        notas: notas,
        total: producto.precio,
      });
      // Notificar éxito
    } catch (error) {
      console.error("Error al enviar pedido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const entregarPedido = async (pedidoId: any) => {
    try {
      await marcarEntregadoMutation({ pedidoId });
    } catch (error) {
      console.error("Error al entregar:", error);
    }
  };

  const pedirCuenta = async (metodo: "Efectivo" | "Tarjeta" | "Dividido") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await solicitarCuentaMutation({ numero_mesa: mesa, metodo_pago: metodo });
    } catch (error) {
      console.error("Error al pedir cuenta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    categorias,
    productos,
    mesa,
    setMesa,
    enviarPedido,
    isSubmitting,
    cuentaMesa,
    entregarPedido,
    pedirCuenta,
  };
}
