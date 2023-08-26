let CryptoJS = require('crypto-js')
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { bigintToBytes, bigintToHex, hexToBytes, uint8arrayToWordArray, wordarrayToUint8Array, xorBytes } from './conversion'

export const hash = (input) => {
    return sha256(input)
}

export const getGeneratorPoint = () => {
    return secp256k1.ProjectivePoint.BASE
}

export const addPoints = (A, B) => {
    return A.add(B)
}

export const invPoint = (A) => {
    return A.negate()
}

export const multPointScalar = (A, b) => {
    return A.multiply(b)
}

export const encrypt = (plaintext, key, counter) => {
    let keyWordArray = uint8arrayToWordArray(key);
    let ivWordArray = uint8arrayToWordArray(counter);
    let plainWordArray = uint8arrayToWordArray(plaintext);
    let cipherWordArray = CryptoJS.AES.encrypt(plainWordArray, keyWordArray, { mode: CryptoJS.mode.CTR, iv: ivWordArray, padding: CryptoJS.pad.NoPadding})
    let ciphertext = wordarrayToUint8Array(cipherWordArray.ciphertext);
    return ciphertext;
}

export const getEncryptedMask = (password, byteLen) => {
    if (byteLen % 16 != 0) {
        console.log("byte length invalid")
    }
    let plaintext = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    let counter = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    let passwordAffine = password.toAffine()
    let xHex = bigintToHex(passwordAffine.x, 64)
    let yHex = bigintToHex(passwordAffine.y, 64)
    let x = hexToBytes(xHex)
    let y = hexToBytes(yHex)
    let xorPassword = xorBytes(x, y, 32)
    let key = hash(xorPassword).slice(0, 16)
    return encrypt(plaintext, key, counter)
}

export const getRandomBlocks = (counter, password, numOfBlocks, output) => {
    let plaintext = new Uint8Array(numOfBlocks * 16)
    for (let i = 0; i < numOfBlocks; i++) {
        let temp = bigintToBytes(BigInt(counter + i), 16)
        for (let j = 0; j < 16; j++) {
            plaintext[i * 16 + j] = temp[j]
        }
    }
    let blocks = encrypt(plaintext, password, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
    for (let i = 0; i < numOfBlocks; i++) {
        let temp = blocks.slice(i * 16, i * 16 + 16)
        output.push(temp)
    }
}