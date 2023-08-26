import { secp256k1 } from '@noble/curves/secp256k1';
import { Buffer } from 'buffer';
let CryptoJS = require('crypto-js')

export const bigintToBytes = (input, byteLen) => {
    let hex = BigInt(input).toString(16);
    if (hex.length % 2 != 0) {
        hex = '0' + hex;
    }
    let len = hex.length / 2;
    let output = new Uint8Array(byteLen);
    let i = 0;
    let j = 0;
    while (i < byteLen && i < len) {
        output[i] = parseInt(hex.slice(j, j + 2), 16);
        i += 1;
        j += 2;
    }
    if (byteLen > len) {
        while (i < byteLen) {
            output[i] = 0;
            i += 1;
        }
    }
    output = output.reverse();
    return output;
};

export const bytesToBigInt = (input) => {
    let nonZeroIndex = 0;
    while (nonZeroIndex < input.length) {
        if (input[nonZeroIndex] != 0) {
            break;
        }
        nonZeroIndex += 1;
    }
    let slicedInput = input.slice(nonZeroIndex);
    slicedInput = slicedInput.reverse();
    let hex = [];  
    slicedInput.forEach((i) => {
        let h = i.toString(16);
        if (h.length % 2) {
            h = '0' + h;
        }
        hex.push(h);
    });
    return BigInt('0x' + hex.join(''));
};

export const bigintToHex = (input, hexLen) => {
    let hexString = input.toString(16);
    if (hexString.length < hexLen) {
        let paddingLength = hexLen - hexString.length;
        for (let i = 0; i < paddingLength; i++) {
            hexString = '0' + hexString;
        }
    }
    return hexString;
};

export const hexToBigInt = (input) => {
    let output = BigInt('0x' + input); 
    return output;
};

export const unicodeToBytes = (input) => {
    return new Uint8Array(Buffer.from(input));
};

export const bytesToUnicode = (input) => {
    return Buffer.from(input.buffer).toString();
};

export const bytesToHex = (input) => {
    return Buffer.from(input).toString('hex')
};

export const hexToBytes = (input) => {
    return Uint8Array.from(Buffer.from(input, 'hex'))
};

export const uint8arrayToWordArray = (input) => {
    let len = input.length;
    let words = [];
    for (var i = 0; i < len; i++) {
        words[i >>> 2] |= (input[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
};

export const wordarrayToUint8Array = (input) => {
    let words = input.words;
    let sigBytes = input.sigBytes;
    let output = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
        let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        output[i]=byte;
    }
    return output;
};

export const xorBytes = (a, b, byteLen) => {
    let c = new Uint8Array(byteLen)
    for (let i = 0; i < byteLen; i++) {
        c[i] = a[i] ^ b[i]
    }
    return c
};

export const andBytes = (a, b, byteLen) => {
    let c = new Uint8Array(byteLen)
    for (let i = 0; i < byteLen; i++) {
        c[i] = a[i] & b[i]
    }
    return c
};

export const orBytes = (a, b, byteLen) => {
    let c = new Uint8Array(byteLen)
    for (let i = 0; i < byteLen; i++) {
        c[i] = a[i] | b[i]
    }
    return c
};

export const listConversion = (input, fromType, toType) => {
    let output = [];
    for (let i = 0; i < input.length; i++) {
        if (fromType == "bigint" && toType == "point3d") {
            let newPoint = new secp256k1.ProjectivePoint(input[i][0], input[i][1], input[i][2])
            output.push(newPoint)
        } else if (fromType == "hex" && toType == "point3d") {
            let newPoint = new secp256k1.ProjectivePoint(hexToBigInt(input[i][0]), hexToBigInt(input[i][1]), hexToBigInt(input[i][2]))
            output.push(newPoint)
        } else if (fromType == "point3d" && toType == "hex") {
            output.push([bigintToHex(input[i].px, -1), bigintToHex(input[i].py, -1), bigintToHex(input[i].pz, -1)])
        } else if (fromType == "point3d" && toType == "bigint") {
            output.push([input[i].px, input[i].py, input[i].pz])
        } else if (fromType == "bytes" && toType == "hex") {
            output.push(bytesToHex(input[i]))
        } else if (fromType == "bigint" && toType == "hex") {
            output.push(bigintToHex(input[i], -1))
        } else if (fromType == "hex" && toType == "bytes") {
            output.push(hexToBytes(input[i]))
        }
    }
    return output;
};