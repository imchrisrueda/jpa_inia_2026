import cv2
import os
import sys
import shutil
import time

def setup_directories():
    base_dir = "dataset"
    for split in ["train", "val"]:
        os.makedirs(os.path.join(base_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(base_dir, "labels", split), exist_ok=True)
    return base_dir

def capture_dataset():
    setup_directories()
    
    # Abrir cámara web
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: No se pudo abrir la cámara web para capturar fotos.")
        return False
        
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("\n" + "="*50)
    print("      GESTOR DE CAPTURA PARA ENTRENAMIENTO IA")
    print("="*50)
    print("Instrucciones:")
    print("Coloca el objeto centrado frente a la cámara y pulsa:")
    print("  [1] Capturar foto de MANZANA (CULTIVO)")
    print("  [2] Capturar foto de DIENTE DE LEÓN (MALEZA)")
    print("  [T] Terminar capturas y arrancar ENTRENAMIENTO")
    print("  [Q] Salir sin guardar")
    print("="*50 + "\n")
    
    counts = {0: 0, 1: 0} # 0: manzana, 1: diente_de_leon
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error al leer de la cámara.")
            break
            
        # Hacer copia para dibujar HUD en la vista previa
        display_frame = frame.copy()
        h, w, _ = frame.shape
        
        # Dibujar cuadro guía central (80% del tamaño)
        box_w, box_h = int(w * 0.7), int(h * 0.7)
        x1, y1 = int((w - box_w)/2), int((h - box_h)/2)
        x2, y2 = x1 + box_w, y1 + box_h
        cv2.rectangle(display_frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
        
        cv2.putText(display_frame, f"Manzanas: {counts[0]} | Dientes de Leon: {counts[1]}", (15, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(display_frame, "Pulse [1] Manzana | [2] Diente de Leon | [T] Entrenar | [Q] Salir", (15, h - 20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow("Captura de Dataset - CropShield AI", display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            print("Captura cancelada.")
            cap.release()
            cv2.destroyAllWindows()
            return False
            
        elif key in [ord('1'), ord('2')]:
            class_id = 0 if key == ord('1') else 1
            class_name = "manzana" if class_id == 0 else "diente_de_leon"
            
            # Repartir 20% a validación y 80% a entrenamiento de forma automática
            split = "val" if (counts[class_id] % 5 == 0 and counts[class_id] > 0) else "train"
            
            timestamp = int(time.time() * 1000)
            img_filename = f"{class_name}_{timestamp}.jpg"
            label_filename = f"{class_name}_{timestamp}.txt"
            
            # Rutas de guardado
            img_path = os.path.join("dataset", "images", split, img_filename)
            label_path = os.path.join("dataset", "labels", split, label_filename)
            
            # Guardar imagen original (sin la caja dibujada)
            cv2.imwrite(img_path, frame)
            
            # Generar etiqueta YOLOv8 automática (caja centrada que cubre el 70% del visor)
            # Formato YOLO: class_id center_x center_y width height (normalizado de 0 a 1)
            with open(label_path, "w") as lf:
                lf.write(f"{class_id} 0.5 0.5 0.7 0.7\n")
                
            counts[class_id] += 1
            print(f"Foto guardada en {split}: {img_filename} (Etiqueta YOLO autogenerada)")
            
        elif key == ord('t') or key == ord('T'):
            if counts[0] < 5 or counts[1] < 5:
                print("WARNING: Te sugerimos capturar al menos 5 fotos de cada clase antes de entrenar.")
                # Permitir entrenar de todos modos
            print("Finalizando capturas. Iniciando pipeline de entrenamiento...")
            break
            
    cap.release()
    cv2.destroyAllWindows()
    return True

def create_yaml():
    yaml_content = """
path: ./dataset
train: images/train
val: images/val
names:
  0: manzana
  1: diente_de_leon
"""
    with open("dataset/data.yaml", "w", encoding="utf-8") as f:
        f.write(yaml_content.strip())
    print("Archivo data.yaml generado con éxito.")

def train_model():
    print("\n" + "="*50)
    print("      INICIANDO AJUSTE DE YOLOv8 EN GPU (CUDA)")
    print("="*50)
    
    import torch
    from ultralytics import YOLO
    
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"Dispositivo de entrenamiento: {device}")
    
    # Generar data.yaml
    create_yaml()
    
    # Cargar modelo YOLOv8 Nano base
    model = YOLO("yolov8n.pt")
    
    # Entrenar por 15 epochs (suficiente para transfer learning rápido en showcase)
    print("Entrenando por 15 épocas. Esto tardará muy poco en la GPU RTX 4070Ti...")
    model.train(
        data="dataset/data.yaml",
        epochs=15,
        imgsz=640,
        device=device,
        project="runs",
        name="train",
        exist_ok=True
    )
    
    # Copiar pesos resultantes al directorio raíz como best.pt
    best_weights_path = os.path.join("runs", "detect", "runs", "train", "weights", "best.pt")
    if os.path.exists(best_weights_path):
        shutil.copy(best_weights_path, "best.pt")
        print("\n" + "="*50)
        print("¡ENTRENAMIENTO COMPLETADO CON ÉXITO!")
        print("El nuevo modelo 'best.pt' ha sido instalado en la raíz.")
        print("La aplicación lo cargará automáticamente en el próximo arranque.")
        print("="*50 + "\n")
    else:
        print("Error: No se pudieron encontrar los pesos resultantes en runs/train/weights/best.pt")

if __name__ == "__main__":
    # Si se pasa el argumento --train-only, se salta la captura de imágenes
    if len(sys.argv) > 1 and sys.argv[1] == "--train-only":
        if os.path.exists("dataset"):
            train_model()
        else:
            print("Error: No existe la carpeta 'dataset'. Ejecuta primero el script sin argumentos para capturar fotos.")
    else:
        if capture_dataset():
            train_model()
