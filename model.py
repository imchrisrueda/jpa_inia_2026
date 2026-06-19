import os
from ultralytics import YOLO
import torch

class CropShieldModel:
    def __init__(self, model_path="best.pt", fallback_path="yolov8n.pt"):
        # Detectar GPU
        self.device = 0 if torch.cuda.is_available() else "cpu"
        print(f"Cargando YOLOv8. Dispositivo de inferencia seleccionado: {self.device}")
        
        self.is_custom = False
        if os.path.exists(model_path):
            print(f"Cargando modelo entrenado localmente desde: {model_path}")
            self.model = YOLO(model_path)
            self.is_custom = True
        else:
            print(f"No se encontró un modelo entrenado localmente. Usando modelo base: {fallback_path}")
            # El modelo base se descargará automáticamente por ultralytics si no existe
            self.model = YOLO(fallback_path)
            self.is_custom = False
            
        # Mapeo de dispositivo
        self.model.to("cuda" if torch.cuda.is_available() else "cpu")

    def predict(self, frame, conf_threshold=0.3):
        # Inferencia rápida sin logs de consola de ultralytics
        results = self.model.predict(
            source=frame, 
            conf=conf_threshold, 
            device=self.device, 
            verbose=False,
            imgsz=640
        )
        
        detections = []
        if len(results) == 0:
            return detections
            
        result = results[0]
        boxes = result.boxes
        
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist() # [x1, y1, x2, y2]
            
            # Mapeo de clases
            if self.is_custom:
                # Modelo entrenado localmente
                class_name = self.model.names[cls_id].lower()
                if "manzana" in class_name or "apple" in class_name:
                    mapped_class = "manzana"
                elif "diente" in class_name or "dandelion" in class_name or "maleza" in class_name:
                    mapped_class = "maleza"
                else:
                    mapped_class = class_name
            else:
                # Modelo base COCO
                # COCO clase 47 = 'apple' (manzana)
                # COCO clases que mapeamos como Maleza/Amenaza:
                # 58 = 'potted plant' (planta de maceta)
                # 46 = 'banana' (plátano)
                # 50 = 'broccoli' (brócoli)
                # 49 = 'orange' (naranja)
                if cls_id == 47:
                    mapped_class = "manzana"
                elif cls_id in [58, 46, 50, 49]:
                    mapped_class = "maleza"
                else:
                    # Omitir cualquier otra clase COCO en el showcase
                    continue
            
            detections.append({
                "box": [int(x) for x in xyxy],
                "class": mapped_class,
                "confidence": round(conf, 2)
            })
            
        return detections
