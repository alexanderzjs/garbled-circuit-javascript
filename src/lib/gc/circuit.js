import { aesCircuit } from "./aes_circuit";

export const loadCircuitFromFile = (gates, info) => {
    const lines = aesCircuit;
    let line = lines[0].split(" ")
    let num_of_gate = parseInt(line[0])
    let num_of_wire = parseInt(line[1])
    line = lines[1].split(" ")
    let num_of_ginput = parseInt(line[0])
    let num_of_einput = parseInt(line[1])
    let num_of_output = parseInt(line[4])
    for (let i = 3; i < lines.length; i++) {
        line = lines[i].split(" ")
        if (line[0] == '2') {
            gates.push(parseInt(line[2]))
            gates.push(parseInt(line[3]))
            gates.push(parseInt(line[4]))
            if (line[5] == 'AND') {
                gates.push(0)
            }
            else if (line[5] == 'XOR') {
                gates.push(1)
            }
            else if (line[5] == 'OR') {
                gates.push(3)
            }
        } else if (line[0] == '1') {
            gates.push(parseInt(line[2]))
            gates.push(-1)
            gates.push(parseInt(line[3]))
            gates.push(2)
        }
    }
    info.push(num_of_gate)
    info.push(num_of_wire)
    info.push(num_of_ginput)
    info.push(num_of_einput)
    info.push(num_of_output)
}

