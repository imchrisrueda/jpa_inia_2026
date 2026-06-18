import cv2
import threading
import time
import numpy as np

class VideoCamera:
    def __init__(self, source=0):
        self.source = source
        self.cap = None
        self.frame = None
        self.is_running = False
        self.lock = threading.Lock()
        self.thread = None
        self.is_dummy = False
        
        # Parámetros para la animación en modo simulado
        self.sim_apple_x = 150
        self.sim_apple_y = 240
        self.sim_apple_dx = 2
        self.sim_dandelion_x = 450
        self.sim_dandelion_y = 240
        self.sim_dandelion_dy = 3

    def start(self):
        if self.is_running:
            return True
            
        print(f"Intentando inicializar cámara web en el índice {self.source}...")
        self.cap = cv2.VideoCapture(self.source)
        
        if not self.cap.isOpened():
            print("Fallo en índice 0. Intentando índice 1...")
            self.cap.release()
            self.cap = cv2.VideoCapture(1)
            
        if not self.cap.isOpened():
            print("Fallo en índice 1. Intentando índice 2...")
            self.cap.release()
            self.cap = cv2.VideoCapture(2)
            
        if not self.cap.isOpened():
            print("WARNING: No se detectó ninguna cámara web física. Entrando en MODO SIMULACIÓN.")
            self.is_dummy = True
            self.is_running = True
            self.thread = threading.Thread(target=self._update_dummy, daemon=True)
            self.thread.start()
            return True
            
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        self.is_dummy = False
        self.is_running = True
        
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()
        print("Cámara web física iniciada con éxito.")
        return True

    def _update(self):
        while self.is_running:
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.frame = frame
            else:
                time.sleep(0.03)
            time.sleep(0.005)

    def get_simulated_frame(self):
        # Crear un fondo verde oscuro que simule un campo agrícola
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame[:, :] = [30, 45, 20] # BGR
        
        # Dibujar cuadrícula de campo
        for x in range(0, 640, 40):
            cv2.line(frame, (x, 0), (x, 480), (40, 60, 30), 1)
        for y in range(0, 480, 40):
            cv2.line(frame, (0, y), (640, y), (40, 60, 30), 1)
            
        # Actualizar posiciones
        self.sim_apple_x += self.sim_apple_dx
        if self.sim_apple_x < 50 or self.sim_apple_x > 300:
            self.sim_apple_dx *= -1
            
        self.sim_dandelion_y += self.sim_dandelion_dy
        if self.sim_dandelion_y < 50 or self.sim_dandelion_y > 430:
            self.sim_dandelion_dy *= -1
            
        # Dibujar cultivo (manzana roja)
        cv2.line(frame, (self.sim_apple_x, self.sim_apple_y - 35), (self.sim_apple_x + 5, self.sim_apple_y - 25), (20, 70, 100), 3)
        cv2.circle(frame, (self.sim_apple_x, self.sim_apple_y), 25, (31, 7, 175), -1) # Color CSIC Rojo
        cv2.circle(frame, (self.sim_apple_x - 8, self.sim_apple_y - 8), 6, (100, 100, 255), -1)
        
        # Dibujar maleza (diente de león amarillo/verde)
        cv2.ellipse(frame, (self.sim_dandelion_x, self.sim_dandelion_y), (20, 8), 45, 0, 360, (50, 150, 50), -1)
        cv2.ellipse(frame, (self.sim_dandelion_x, self.sim_dandelion_y), (20, 8), -45, 0, 360, (50, 150, 50), -1)
        cv2.circle(frame, (self.sim_dandelion_x, self.sim_dandelion_y), 15, (0, 220, 255), -1)
        
        # Texto indicador de simulación
        cv2.putText(frame, "MODO SIMULACION ACTIVO", (15, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 150, 150), 1, cv2.LINE_AA)
        return frame

    def _update_dummy(self):
        while self.is_running:
            frame = self.get_simulated_frame()
            with self.lock:
                self.frame = frame
            time.sleep(0.03) # ~30 FPS

    def get_frame(self):
        with self.lock:
            if self.frame is not None:
                return self.frame.copy()
            return None

    def stop(self):
        self.is_running = False
        if self.thread is not None:
            self.thread.join(timeout=2.0)
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        print("Cámara web detenida.")
