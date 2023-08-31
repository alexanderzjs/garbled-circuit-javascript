import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils'
import { mod } from '@noble/curves/abstract/modular'
import { bytesToBigInt, xorBytes }  from '../common/conversion'
import { addPoints, getGeneratorPoint, multPointScalar, getEncryptedMask, invPoint }  from '../common/crypt'

export const baseOTSender1 = (numOfOT, a, A) => {
    for (let i = 0; i < numOfOT; i++) {
        let randInt = bytesToBigInt(randomBytes(32));
        let currenta = mod(randInt, secp256k1.CURVE.n);
        let currentA = multPointScalar(getGeneratorPoint(), currenta);
        a.push(currenta);
        A.push(currentA);
    }
}

export const baseOTReceiver1 = (numOfOT, b, A, c, C) => {
    for (let i = 0; i < numOfOT; i++) {
        let randInt = bytesToBigInt(randomBytes(32));
        let currentc = mod(randInt, secp256k1.CURVE.n);
        let currentC = multPointScalar(getGeneratorPoint(), currentc)
        if (b[i] == 1) {
            currentC = secp256k1.ProjectivePoint.fromAffine(addPoints(currentC, A[i]).toAffine())
        }
        c.push(currentc)
        C.push(currentC)
    }
}

export const baseGOTSender2 = (numOfOT, message0, message1, eMessage0, eMessage1, a, A, C, messageLenInBytes) => {
    for (let i = 0; i < numOfOT; i++) {
        let aC = multPointScalar(C[i], a[i])
        let mask0 = getEncryptedMask(aC, messageLenInBytes)
        eMessage0.push(xorBytes(message0[i], mask0, messageLenInBytes))
        let aCA = multPointScalar(addPoints(C[i], invPoint(A[i])), a[i])
        let mask1 = getEncryptedMask(aCA, messageLenInBytes)
        eMessage1.push(xorBytes(message1[i], mask1, messageLenInBytes))
    }
    return;
}

export const baseGOTReceiver2 = (numOfOT, b, eMessage0, eMessage1, messageb, c, A, messageLenInBytes) => {
    for (let i = 0; i < numOfOT; i++) {
        let cA = multPointScalar(A[i], c[i])
        let maskb = getEncryptedMask(cA, messageLenInBytes)
        if (b[i] == 0) {
            messageb.push(xorBytes(eMessage0[i], maskb, messageLenInBytes))
        } else {
            messageb.push(xorBytes(eMessage1[i], maskb, messageLenInBytes))
        }
    }
    return;
}