import socket
import os
import re

def resolve(host):
    print(f"Testing resolution for '{host}'...")
    try:
        ip = socket.gethostbyname(host)
        print(f"SUCCESS: Resolved to {ip}")
    except socket.gaierror as e:
        print(f"FAILED: {e}")

if os.path.exists(".env"):
    with open(".env", "r") as f:
        content = f.read()
        match = re.search(r"DATABASE_URL=postgresql\+asyncpg://[^@]+@([^/?]+)", content)
        if match:
            host = match.group(1)
            resolve(host)
        else:
            print("Could not find host in DATABASE_URL")
else:
    print(".env not found")

# Also test common external hosts
resolve("raw.githubusercontent.com")
resolve("google.com")
