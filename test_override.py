import os
import sys
from pathlib import Path

# Add ml folder to path
sys.path.insert(0, str(Path(__file__).resolve().parent / "ml"))

from ml.service import SpamDetectorService

service = SpamDetectorService(model_version="v7")

text = "I hope I'm not overstepping by reaching out directly. I've been following your work for a while and have a tremendous amount of respect for what you've built. I have an unconventional proposition that I believe could benefit both of us significantly. Rather than explain everything via email, would you be willing to jump on a quick call?"

res = service.predict(text)
print("PREDICTION RESULT:")
print(res)
