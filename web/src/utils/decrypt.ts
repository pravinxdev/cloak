// 🔐 Frontend AES-256-CBC decryption using Web Crypto API

export async function decryptValue(encrypted: string, sessionKeyBase64: string): Promise<string> {
  try {
    console.log('🔓 Decrypting...');
    console.log('   Encrypted input:', encrypted.substring(0, 50) + '...');
    console.log('   Session key (base64):', sessionKeyBase64.substring(0, 30) + '...');

    // Parse the encrypted format: "iv_hex:encrypted_hex"
    const [ivHex, encryptedHex] = encrypted.split(':');
    
    if (!ivHex || !encryptedHex) {
      throw new Error(`Invalid encrypted format - missing colon separator. Got: ${encrypted.substring(0, 50)}`);
    }

    console.log('   IV hex:', ivHex);
    console.log('   Encrypted hex:', encryptedHex.substring(0, 40) + '...');

    // Convert from hex to bytes
    const iv = hexToBytes(ivHex);
    const data = hexToBytes(encryptedHex);
    
    console.log('   IV bytes length:', iv.length);
    console.log('   Data bytes length:', data.length);

    // Convert session key from base64 to bytes
    const sessionKeyBytes = base64ToBytes(sessionKeyBase64);
    console.log('   Session key bytes length:', sessionKeyBytes.length);

    // Import the key for decryption
    const key = await crypto.subtle.importKey(
      'raw',
      uint8arrayToArrayBuffer(sessionKeyBytes),
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    console.log('   ✅ Key imported successfully');

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv as BufferSource },
      key,
      data as BufferSource
    );

    console.log('   ✅ Decryption successful');

    // Convert to string
    const result = new TextDecoder().decode(decrypted);
    console.log('   Result:', result);
    return result;
  } catch (err: any) {
    console.error('❌ Decryption error:', err);
    throw new Error(`Decryption failed: ${err.message}`);
  }
}

// Helper: Convert hex string to bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Helper: Convert base64 to bytes
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Safely convert Uint8Array to ArrayBuffer for Web Crypto API
function uint8arrayToArrayBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}
