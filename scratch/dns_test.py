import socket
import sys

host = "ep-wispy-art-am4uaiuc-pooler.c-5.us-east-1.aws.neon.tech"
print(f"Testing resolution for {host}...")
try:
    ip = socket.gethostbyname(host)
    print(f"SUCCESS: Resolved to {ip}")
except socket.gaierror as e:
    print(f"FAILED: {e}")

# Try without .c-5 just in case
host2 = "ep-wispy-art-am4uaiuc-pooler.us-east-1.aws.neon.tech"
print(f"Testing resolution for {host2}...")
try:
    ip = socket.gethostbyname(host2)
    print(f"SUCCESS: Resolved to {ip}")
except socket.gaierror as e:
    print(f"FAILED: {e}")
