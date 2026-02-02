"""
Convert JWK (JSON Web Key) to PEM format for SUPABASE_JWT_PUBLIC_KEY
"""
import json
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

# Your JWK from Supabase
jwk = {
    "x": "RYNkwEtB_1JjTxulU5No58qQyPdYkplibalFrEiDkQc",
    "y": "5AjhI_rdQO5JkE6eLatQM1431CavNTKSAo7QQbDA0pg",
    "alg": "ES256",
    "crv": "P-256",
    "ext": True,
    "kid": "8579bc96-44c4-4ab3-bc3c-99036e05cf9f",
    "kty": "EC",
    "key_ops": ["verify"]
}

# Decode base64url encoded coordinates
x_bytes = base64.urlsafe_b64decode(jwk["x"] + "==")
y_bytes = base64.urlsafe_b64decode(jwk["y"] + "==")

# Create ECC public key from coordinates
public_numbers = ec.EllipticCurvePublicNumbers(
    x=int.from_bytes(x_bytes, 'big'),
    y=int.from_bytes(y_bytes, 'big'),
    curve=ec.SECP256R1()  # P-256 curve
)
public_key = public_numbers.public_key()

# Convert to PEM format
pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

print("=" * 60)
print("PEM FORMAT PUBLIC KEY")
print("=" * 60)
print(pem.decode())
print()
print("=" * 60)
print("FOR .env FILE (use \\n for newlines):")
print("=" * 60)
pem_str = pem.decode().strip()
env_format = pem_str.replace('\n', '\\n')
print(f'SUPABASE_JWT_PUBLIC_KEY="{env_format}"')
print()
print("=" * 60)
print("Key ID (kid):", jwk["kid"])
print("Algorithm:", jwk["alg"])
print("=" * 60)
