import asyncio
import websockets
import json
import time

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws"
    print(f"Conectando a {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Conectado con éxito. Esperando frames...")
            start_time = time.time()
            frames_count = 0
            
            # Recibir 10 frames y comprobar la estructura
            for i in range(10):
                msg = await websocket.recv()
                data = json.loads(msg)
                
                if "image" in data and "detections" in data:
                    frames_count += 1
                    detections = data['detections']
                    print(f"Frame {frames_count} recibido. Tamaño imagen base64: {len(data['image']) // 1024} KB. Detecciones: {detections}")
                else:
                    print("Error: Estructura JSON incorrecta.")
                    break
                    
            end_time = time.time()
            elapsed = end_time - start_time
            fps = frames_count / elapsed
            print(f"\nPrueba de comunicación exitosa.")
            print(f"Recibidos {frames_count} frames en {elapsed:.2f} segundos (FPS promedio: {fps:.2f}).")
            
    except Exception as e:
        print(f"Error en la prueba del cliente WebSocket: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
