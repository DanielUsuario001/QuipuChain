# Guía de Simulación de Transacciones en Starknet

## Descripción General

La aplicación ahora incluye una función de simulación de transacciones para Starknet que te permite probar una transacción antes de ejecutarla en la blockchain. Esto te ayuda a:

- Verificar que tu transacción se ejecutará correctamente
- Ver estimaciones precisas de gas antes de enviar
- Detectar errores potenciales (balance insuficiente, dirección incorrecta, etc.)
- Ahorrar dinero evitando transacciones fallidas

## Cómo Usar la Simulación

### Paso 1: Conecta tu Wallet de Starknet

1. Navega a la página principal
2. Asegúrate de estar conectado con una wallet de Starknet (Argent o Braavos)
3. Selecciona la red Starknet (Mainnet o Sepolia)

### Paso 2: Accede a la Función de Envío

1. Haz clic en el botón "Enviar y Recibir" en la página principal
2. Selecciona "Enviar" para iniciar una transferencia

### Paso 3: Completa los Detalles de la Transacción

1. **Selecciona el Token**: Elige qué stablecoin quieres enviar (USDT, USDC, o DAI)
2. **Dirección del Destinatario**: Ingresa la dirección de Starknet del destinatario
   - Debe comenzar con `0x`
   - Debe ser una dirección válida de Starknet
3. **Cantidad**: Ingresa la cantidad de tokens a enviar
   - Puedes usar el botón "MAX" para enviar todo tu balance

### Paso 4: Simula la Transacción

1. Haz clic en el botón **"Simular Transacción"**
2. Espera unos segundos mientras se ejecuta la simulación
3. Se mostrará un modal con los resultados de la simulación

## Interpretando los Resultados de la Simulación

### Simulación Exitosa ✅

Si la simulación es exitosa, verás:

- **Estado de Ejecución**: "SUCCEEDED"
- **Gas Estimado**: La cantidad estimada de ETH que costará la transacción
- **Max Fee Sugerido**: El fee máximo recomendado (1.5x del gas estimado para seguridad)
- **Botón "Proceder con Envío"**: Te permite continuar con la transacción real

**Ejemplo de resultado exitoso:**
```
✓ Simulación Exitosa
Estado: SUCCEEDED
Gas Estimado: 0.000234 ETH
Max Fee Sugerido: 0.000351 ETH
```

### Simulación Fallida ❌

Si la simulación falla, verás:

- **Estado de Ejecución**: "REVERTED"
- **Razón del Fallo**: Descripción del error que causó el fallo
- Sin opción para proceder

**Razones comunes de fallo:**
- Balance insuficiente de tokens
- Balance insuficiente de ETH para gas
- Dirección de destinatario inválida
- Token no aprobado para transferencia
- Problemas de red o RPC

## Después de una Simulación Exitosa

Tienes dos opciones:

1. **Proceder con Envío**: Cierra el modal de simulación y abre el modal de PIN para confirmar y ejecutar la transacción real
2. **Cerrar**: Revisa los detalles y simula nuevamente si es necesario

## Diferencias entre Simulación y Envío Real

| Característica | Simulación | Envío Real |
|----------------|-----------|------------|
| Costo | Gratis | Requiere pagar gas |
| Blockchain | No se escribe | Se escribe en la blockchain |
| Reversible | Sí | No |
| Requiere PIN | No | Sí |
| Tiempo | ~2-5 segundos | ~30-60 segundos |

## Mejores Prácticas

1. **Siempre simula primero**: Especialmente para transacciones grandes
2. **Verifica el gas estimado**: Asegúrate de tener suficiente ETH para cubrir el gas
3. **Revisa la dirección**: Confirma que la dirección del destinatario es correcta
4. **Considera el max fee**: El max fee sugerido es 1.5x el gas estimado para evitar que la transacción falle por gas insuficiente

## Limitaciones

- La simulación solo está disponible para redes Starknet (no Scroll)
- La simulación usa el estado actual de la blockchain, que puede cambiar antes de que ejecutes la transacción real
- Los fees de gas reales pueden variar ligeramente de la estimación

## Solución de Problemas

### "Wallet de Starknet no conectada"
- Asegúrate de haber conectado tu wallet de Starknet correctamente
- Verifica que estés en la red correcta (Mainnet o Sepolia)

### "La simulación solo está disponible para Starknet"
- La simulación no está disponible para Scroll
- Cambia a una red Starknet para usar esta función

### "Balance insuficiente"
- Verifica que tengas suficiente balance del token que intentas enviar
- Asegúrate de tener suficiente ETH para cubrir el gas

### "Simulación fallida"
- Revisa los detalles de la transacción
- Verifica que la dirección del destinatario sea válida
- Asegúrate de tener suficiente balance de tokens y ETH

## Código de Ejemplo

Si eres desarrollador y quieres integrar la simulación en tu propia aplicación:

```typescript
import { simulateStarknetTransaction } from '~/lib/web3/starknet';

// Simular una transferencia de tokens
const result = await simulateStarknetTransaction(
  account,           // Tu AccountInterface de Starknet
  tokenAddress,      // Dirección del contrato ERC-20
  recipientAddress,  // Dirección del destinatario
  amountBigInt       // Cantidad en BigInt (con decimales)
);

if (result.success) {
  console.log('Simulación exitosa!');
  console.log('Gas estimado:', result.gasEstimateFormatted, 'ETH');
  console.log('Max fee sugerido:', result.suggestedMaxFeeFormatted, 'ETH');
} else {
  console.error('Simulación fallida:', result.revertReason);
}
```

## Recursos Adicionales

- [Documentación de Starknet](https://docs.starknet.io/)
- [Starknet.js Documentation](https://www.starknetjs.com/)
- [StarkScan Explorer](https://starkscan.co/)
