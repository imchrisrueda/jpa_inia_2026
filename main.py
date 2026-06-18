import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import cv2
import base64
import os
import sys
from camera import VideoCamera
from model import CropShieldModel

# Asegurar que el directorio static/assets existe para efectos de sonido
os.makedirs("static/assets", exist_ok=True)

app = FastAPI(title="CropShield AI Backend")

# Iniciar componentes globales
camera = VideoCamera(source=0)
detector = CropShieldModel()

# Montar directorio estático
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_index():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Error: static/index.html no encontrado.</h1>")

@app.get("/health")
async def health():
    import torch
    return {
        "status": "healthy",
        "gpu": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "camera_active": camera.is_running,
        "is_dummy": camera.is_dummy
    }

# FastAPI Startup event
@app.on_event("startup")
async def startup_event():
    success = camera.start()
    if not success:
        print("WARNING: No se pudo iniciar la cámara en el arranque.")

# FastAPI Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    camera.stop()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Conexión WebSocket establecida con el cliente.")
    
    if not camera.is_running:
        camera.start()
        
    conf_threshold = 0.35
    force_simulate = False
    
    # Tarea asíncrona para escuchar configuraciones del cliente
    async def listen_client():
        nonlocal conf_threshold, force_simulate
        try:
            while True:
                data = await websocket.receive_json()
                if "conf_threshold" in data:
                    conf_threshold = float(data["conf_threshold"])
                    print(f"Confianza de detección ajustada por el usuario: {conf_threshold:.2f}")
                if "simulate" in data:
                    force_simulate = bool(data["simulate"])
                    print(f"Modo simulación forzado ajustado a: {force_simulate}")
        except Exception:
            pass # Conexión cerrada

    client_task = asyncio.create_task(listen_client())
    
    try:
        while True:
            # Si estamos en modo simulación (forzado o por falta de cámara), generamos el frame y detecciones matemáticas
            if camera.is_dummy or force_simulate:
                frame = camera.get_simulated_frame()
                detections = [
                    {
                        "box": [
                            camera.sim_apple_x - 30,
                            camera.sim_apple_y - 30,
                            camera.sim_apple_x + 30,
                            camera.sim_apple_y + 30
                        ],
                        "class": "manzana",
                        "confidence": 0.99
                    },
                    {
                        "box": [
                            camera.sim_dandelion_x - 22,
                            camera.sim_dandelion_y - 22,
                            camera.sim_dandelion_x + 22,
                            camera.sim_dandelion_y + 22
                        ],
                        "class": "diente_de_leon",
                        "confidence": 0.95
                    }
                ]
            else:
                # Obtener el último frame de la cámara real
                frame = camera.get_frame()
                if frame is None:
                    await asyncio.sleep(0.01)
                    continue
                # Inferencia real de YOLOv8
                detections = detector.predict(frame, conf_threshold=conf_threshold)
            
            # Comprimir imagen en JPEG
            ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            if not ret:
                await asyncio.sleep(0.01)
                continue
                
            # Codificar a Base64
            b64_img = base64.b64encode(jpeg.tobytes()).decode('utf-8')
            
            # Empaquetar y enviar
            payload = {
                "image": f"data:image/jpeg;base64,{b64_img}",
                "detections": detections
            }
            await websocket.send_json(payload)
            
            # FPS: 30 FPS (~33ms de sleep)
            await asyncio.sleep(0.033)
            
    except WebSocketDisconnect:
        print("Cliente WebSocket desconectado.")
    except Exception as e:
        print(f"Error en canal WebSocket: {e}")
    finally:
        client_task.cancel()
        try:
            await websocket.close()
        except Exception:
            pass
