import { andBytes, xorBytes } from "../common/conversion"
import { hash } from "../common/crypt"
import { loadCircuitFromFile } from "./circuit"

export const evaluateAndGate = (wireA, wireB, gtt0, gtt1) => {
    let lsbA = andBytes(wireA, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 16)[15]
    let lsbB = andBytes(wireB, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 16)[15]
    let hashedA = hash(wireA).slice(0, 16)
    let hashedB = hash(wireB).slice(0, 16)
    let output = xorBytes(hashedA, hashedB, 16)
    if (lsbA == 1) {
        output = xorBytes(output, gtt0, 16)
    }
    if (lsbB == 1) {
        output = xorBytes(xorBytes(output, gtt1, 16), wireA, 16)
    }
    return output
}

export const evaluateOrGate = (wireA, wireB, gtt0, gtt1) => {
    let andOutput = evaluateAndGate(wireA, wireB, gtt0, gtt1)
    let output = xorBytes(andOutput, xorBytes(wireA, wireB, 16), 16)
    return output
}

export const evaluateXorGate = (inputA, inputB) => { 
    return xorBytes(inputA, inputB, 16)
}

export const evaluateNotGate = (publicOneLabel, input) => { 
    return xorBytes(publicOneLabel, input, 16)
}

export const evaluateGarbledCircuit = (gginput, geinput, publicOneLabel, gtt) => {
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
        wires[i] = gginput[i]
    }
    for (let i = 0; i < numOfEInput; i++) {
        wires[i + numOfGInput] = geinput[i]
    }
    let andGateId = 0
    for (let i = 0; i < numOfGate; i++) {
        if (gates[4 * i + 3] == 0) {
            wires[gates[4 * i + 2]] = evaluateAndGate(wires[gates[4 * i]], wires[gates[4 * i + 1]], gtt[2 * andGateId], gtt[2 * andGateId + 1])
            andGateId += 1
        } else if(gates[4 * i + 3] == 3) {
            wires[gates[4 * i + 2]] = evaluateOrGate(wires[gates[4 * i]], wires[gates[4 * i + 1]], gtt[2 * andGateId], gtt[2 * andGateId + 1])
            andGateId += 1
        } else if (gates[4 * i + 3] == 1) {
            wires[gates[4 * i + 2]] = evaluateXorGate(wires[gates[4 * i]], wires[gates[4 * i + 1]])
        } else if (gates[4 * i + 3] == 2) {
            wires[gates[4 * i + 2]] = evaluateNotGate(publicOneLabel, wires[gates[4 * i]])
        }
    }
    let output = []
    for (let i = numOfWire - numOfOutput; i < numOfWire; i++) {
        output.push(wires[i])
    }
    return output
}