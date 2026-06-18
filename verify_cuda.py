import torch
import sys

print(f"Versión de Python: {sys.version}")
print(f"Versión de PyTorch: {torch.__version__}")
print(f"¿CUDA está disponible?: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"Dispositivo CUDA activo: {torch.cuda.get_device_name(0)}")
    print(f"Número de GPUs disponibles: {torch.cuda.device_count()}")
else:
    print("WARNING: CUDA no está disponible. PyTorch se ejecutará en CPU.")
