"""User-bound Windows Credential Manager access. Never log secret values."""
import ctypes
import json
import sys
from ctypes import wintypes

TARGET = "AETERNUS/Lulu/Sandbox"


class Credential(ctypes.Structure):
    _fields_ = [
        ("Flags", wintypes.DWORD), ("Type", wintypes.DWORD),
        ("TargetName", wintypes.LPWSTR), ("Comment", wintypes.LPWSTR),
        ("LastWritten", wintypes.FILETIME), ("CredentialBlobSize", wintypes.DWORD),
        ("CredentialBlob", ctypes.POINTER(ctypes.c_ubyte)),
        ("Persist", wintypes.DWORD), ("AttributeCount", wintypes.DWORD),
        ("Attributes", ctypes.c_void_p), ("TargetAlias", wintypes.LPWSTR),
        ("UserName", wintypes.LPWSTR),
    ]


def main():
    if sys.platform != "win32":
        raise RuntimeError("Windows Credential Manager required")
    api = ctypes.WinDLL("Advapi32.dll", use_last_error=True)
    api.CredWriteW.argtypes = [ctypes.POINTER(Credential), wintypes.DWORD]
    api.CredWriteW.restype = wintypes.BOOL
    api.CredReadW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD,
                             ctypes.POINTER(ctypes.POINTER(Credential))]
    api.CredReadW.restype = wintypes.BOOL
    api.CredFree.argtypes = [ctypes.c_void_p]
    action = sys.argv[1]
    provider = sys.argv[2] if len(sys.argv) > 2 else 'lulu'
    if provider not in ('lulu', 'stripe'):
        raise ValueError('Unsupported provider')
    target = TARGET if provider == 'lulu' else 'AETERNUS/Stripe/Sandbox'
    if action == "store":
        data = json.load(sys.stdin)
        if provider == 'lulu':
            key, secret = data["client_key"], data["client_secret"]
            if len(key) != 36 or not 20 <= len(secret) <= 1000:
                raise ValueError("Unexpected credential shape")
        else:
            api_key = data['api_key']
            if not api_key.startswith('sk_test_') or not 20 <= len(api_key) <= 1000:
                raise ValueError('Stripe test credential required')
            key, secret = 'Stripe sandbox', json.dumps({'api_key': api_key})
        blob = secret.encode("utf-16-le")
        buffer = (ctypes.c_ubyte * len(blob)).from_buffer_copy(blob)
        credential = Credential(Type=1, TargetName=target,
                                Comment="AETERNUS sandbox only",
                                CredentialBlobSize=len(blob), CredentialBlob=buffer,
                                Persist=2, UserName=key)
        if not api.CredWriteW(ctypes.byref(credential), 0):
            raise ctypes.WinError(ctypes.get_last_error())
        print(json.dumps({"stored": True, "target": target}))
        return
    pointer = ctypes.POINTER(Credential)()
    if not api.CredReadW(target, 1, 0, ctypes.byref(pointer)):
        if action == "status":
            print(json.dumps({"stored": False, "target": target}))
            return
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        credential = pointer.contents
        if action == "status":
            print(json.dumps({"stored": True, "target": target,
                              "secret_bytes": credential.CredentialBlobSize}))
        elif action == "read":
            # Read exclusively into a child-process pipe, never into shell command text or logs.
            secret = ctypes.string_at(credential.CredentialBlob,
                                      credential.CredentialBlobSize).decode("utf-16-le")
            print(json.dumps({"client_key": credential.UserName, "client_secret": secret})
                  if provider == 'lulu' else secret)
        else:
            raise ValueError("Unsupported operation")
    finally:
        api.CredFree(pointer)


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, ValueError, KeyError, IndexError, TypeError):
        print("Credential operation failed", file=sys.stderr)
        sys.exit(1)
