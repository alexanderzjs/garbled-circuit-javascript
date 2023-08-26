let CryptoJS = require('crypto-js')
import { andBytes, orBytes, wordarrayToUint8Array, xorBytes } from "../common/conversion"
import { getRandomBlocks, hash } from "../common/crypt"
import { loadCircuitFromFile } from "./circuit"

export const garblerInit = (sharedInfo) => {
    let oneByte = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
    let delta = orBytes(wordarrayToUint8Array(CryptoJS.lib.WordArray.random(16)), oneByte, 16)
    let publicOneLabel = wordarrayToUint8Array(CryptoJS.lib.WordArray.random(16))
    let publicOneLabelDelta = xorBytes(publicOneLabel, delta, 16)
    sharedInfo.push(delta)
    sharedInfo.push(publicOneLabel)
    sharedInfo.push(publicOneLabelDelta)
}

export const generateGarbledInput = (gGInput0, gGInput1, gEInput0, gEInput1, gInputBitLength, eInputBitLength, delta) => {
    getRandomBlocks(0, wordarrayToUint8Array(CryptoJS.lib.WordArray.random(16)), gInputBitLength, gGInput0)
    for (let i = 0; i < gInputBitLength; i++) {
        gGInput1.push(xorBytes(gGInput0[i], delta, 16))
    }
    getRandomBlocks(0, wordarrayToUint8Array(CryptoJS.lib.WordArray.random(16)), eInputBitLength, gEInput0)
    for (let i = 0; i < eInputBitLength; i++) {
        gEInput1.push(xorBytes(gEInput0[i], delta, 16))
    }
}

export const garbleAndGate = (inputa, inputb, delta, output, gtt0, gtt1) => {
    let a0 = inputa
    let a1 = xorBytes(inputa, delta, 16)
    let b0 = inputb
    let b1 = xorBytes(inputb, delta, 16)
    let lsba0 = andBytes(a0, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 16)[15]
    let lsbb0 = andBytes(b0, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 16)[15]
    let hasheda0 = hash(a0).slice(0, 16)
    let hasheda1 = hash(a1).slice(0, 16)
    let hashedb0 = hash(b0).slice(0, 16)
    let hashedb1 = hash(b1).slice(0, 16)
    gtt0[0] = xorBytes(hasheda0, hasheda1, 16)
    if (lsbb0 == 1) {
        gtt0[0] = xorBytes(gtt0[0], delta, 16)
    }
    output[0] = hasheda0
    if (lsba0 == 1) {
        output[0] = xorBytes(output[0], gtt0[0], 16)
    }
    let temp = xorBytes(hashedb0, hashedb1, 16)
    gtt1[0] = xorBytes(temp, a0, 16)
    output[0] = xorBytes(output[0], hashedb0, 16)
    if (lsbb0 == 1) {
        output[0] = xorBytes(output[0], temp, 16)
    }
}

export const garbleOrGate = (inputa, inputb, delta, output, gtt0, gtt1) => {
    garbleAndGate(inputa, inputb, delta, output, gtt0, gtt1)
    output[0] = xorBytes(output[0], xorBytes(inputa, inputb, 16), 16)
}

export const garbleXorGate = (inputa, inputb) => { 
    return xorBytes(inputa, inputb, 16)
}

export const garbleNotGate = (publicLabel, input) => { 
    return xorBytes(publicLabel, input, 16)
}

export const computeGarbledCircuit = (ginput, gGInput0, gGInput1, gEInput0, publicOneLabelDelta, delta, output, gtt) => {
    let gates = []
    let circuitInfo = []
    loadCircuitFromFile(gates, circuitInfo)
    let numOfGate = circuitInfo[0]
    let numOfWire = circuitInfo[1]
    let numOfGInput = circuitInfo[2]
    let numOfEInput = circuitInfo[3]
    let numOfOutput = circuitInfo[4]
    let wires = []
    for (let i = 0; i < numOfWire; i++) {
        wires.push(new Uint8Array())
    }
    for (let i = 0; i < numOfGInput; i++) {
        if (ginput[i] == 0) {
            wires[i] = gGInput0[i]
        } else {
            wires[i] = gGInput1[i]
        }
    }
    for (let i = 0; i < numOfEInput; i++) {
        wires[i + numOfGInput] = gEInput0[i]
    }
    for (let i = 0; i < numOfGate; i++) {
        if (gates[4 * i + 3] == 0) {
            let output = []
            let gtt0 = []
            let gtt1 = []
            garbleAndGate(wires[gates[4 * i]], wires[gates[4 * i + 1]], delta, output, gtt0, gtt1)
            wires[gates[4 * i + 2]] = output[0]
            gtt.push(gtt0[0])
            gtt.push(gtt1[0])
        } else if(gates[4 * i + 3] == 3) {
            let output = []
            let gtt0 = []
            let gtt1 = []
            garbleOrGate(wires[gates[4 * i]], wires[gates[4 * i + 1]], delta, output, gtt0, gtt1)
            wires[gates[4 * i + 2]] = output[0]
            gtt.push(gtt0[0])
            gtt.push(gtt1[0])

        } else if (gates[4 * i + 3] == 1) {
            wires[gates[4 * i + 2]] = garbleXorGate(wires[gates[4 * i]], wires[gates[4 * i + 1]])
        } else if (gates[4 * i + 3] == 2) {
            wires[gates[4 * i + 2]] = garbleNotGate(publicOneLabelDelta, wires[gates[4 * i]])
        }
    }
    for (let i = numOfWire - numOfOutput; i < numOfWire; i++) {
        output.push(wires[i])
    }
}