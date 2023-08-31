import './App.css';
import React from "react";
import axios from 'axios';

import { addPoints, getGeneratorPoint, invPoint, multPointScalar } from './lib/common/crypt'
import { listConversion, bytesToHex, hexToBytes, unicodeToBytes, bytesToUnicode } from './lib/common/conversion'
import { baseOTSender1, baseGOTSender2, baseOTReceiver1, baseGOTReceiver2 } from './lib/ot/base'
import { garblerInit, generateGarbledInput, computeGarbledCircuit } from './lib/gc/garbler'
import { evaluateGarbledCircuit } from './lib/gc/evaluator'

const App = () => {

  const testECC = () => {
    let g = getGeneratorPoint()
    let g_2_add = addPoints(g, g)
    let g_3_add = addPoints(g_2_add, g)
    let g_3_mul = multPointScalar(g, BigInt(3))
    console.log(g_3_add.toAffine().x == g_3_mul.toAffine().x)
    let inv_g = invPoint(g)
    let g_inv_add = addPoints(g_2_add, inv_g)
    console.log(g_inv_add.toAffine().x == g.toAffine().x)
  }

  const testOT = () => {
    let numOfOT = 8
    let m_0 = []
    let m_1 = []
    for (let i = 0; i < numOfOT; i++) {
        m_0.push(unicodeToBytes("fo150jlafjgrj148rqrtq"))
        m_1.push(unicodeToBytes("amvjjafljga8451pqrqte"))
    }
    let message_len_in_bytes = m_0[0].length
    let b = [0, 1, 1, 0, 0, 1, 1, 0]
    let a = []
    let A = []
    let c = []
    let C = []
    baseOTSender1(numOfOT, a, A)
    baseOTReceiver1(numOfOT, b, A, c, C)
    let e_0 = []
    let e_1 = []
    baseGOTSender2(numOfOT, m_0, m_1, e_0, e_1, a, A, C, message_len_in_bytes)
    let m_b = []
    baseGOTReceiver2(numOfOT, b, e_0, e_1, m_b, c, A, message_len_in_bytes)
    for (let i = 0; i < numOfOT; i++) {
        console.log(bytesToUnicode(m_b[i]))
    }
  }

  const testGC = () => {
    let sharedInfo = []
    garblerInit(sharedInfo)
    let delta = sharedInfo[0]
    let public_one_label = sharedInfo[1]
    let public_one_label_delta = sharedInfo[2]
    let num_of_ginput = 256
    let num_of_einput = 128
    let num_of_output = 128
    let ginput = [1,1,1,1,0,1,1,0,0,1,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,1,0,1,1,1,0,0,0,0,1,1,1,1,0,0,1,0,1,1,1,0,0,0,1,1,1,0,0,1,1,1,1,1,0,1,1,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,1,0,0,1,0,0, 0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,0,0,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,0,1,0,0,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,0,1,1]
    let gginput_0 = [] 
    let gginput_1 = [] 
    let geinput_0 = [] 
    let geinput_1 = [] 
    generateGarbledInput(gginput_0, gginput_1, geinput_0, geinput_1, num_of_ginput, num_of_einput, delta)
    let g_output = []
    let gtt = []
    computeGarbledCircuit(ginput, gginput_0, gginput_1, geinput_0, public_one_label_delta, delta, g_output, gtt)
    let einput = [1,1,0,1,0,0,1,1,1,0,0,0,1,0,0,0,1,0,1,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,0,1,0,0,0,0,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,0,0,0,1,1,1,1,1,1,1,1,1]
    let geinput = []
    let message_len_in_bytes = 16
    let a = []
    let A = []
    let c = []
    let C = []
    baseOTSender1(num_of_einput, a, A)
    baseOTReceiver1(num_of_einput, einput, A, c, C)
    let e_0 = []
    let e_1 = []
    baseGOTSender2(num_of_einput, geinput_0, geinput_1, e_0, e_1, a, A, C, message_len_in_bytes)
    baseGOTReceiver2(num_of_einput, einput, e_0, e_1, geinput, c, A, message_len_in_bytes)
    let e_output = evaluateGarbledCircuit(gginput_0, geinput, public_one_label, gtt)
    let result = []
    for (let i = 0; i < num_of_output; i++) {
        let equal = 0
        for (let j = 0; j < 16; j++) {
            if (g_output[i][j] != e_output[i][j]) {
                result.push(1)
                equal = 1
                break
            }
        }
        if (equal == 0) {
            result.push(0)
        }
    }
    console.log(result.toString())
    // # expected output is 01011100111101001000101011111011111011101010000011111011110011001101111101111011100001010111000110110110000000000110000111101000
  }

  const recoverResult = (gOutput, eOutput) => {
    let result = ""
    let temp = ""
    for (let i = 0; i < gOutput.length; i++) {
      if (i % 4 == 0) {
        temp = ""
      }
      if (gOutput[i] == eOutput[i]) {
        temp += "0"
      } else {
        temp += "1"
      }
      if (i % 4 == 3) {
        result += parseInt(temp, 2).toString(16)
      }
    }
    return result;
  }
  
  const garbler = async (e) => {
    e.preventDefault();
    // First part - baseOT phase 1:
    let numOfEInput = 128
    let a = []
    let A = []
    baseOTSender1(numOfEInput, a, A)
    const evaluatorFirstApi = "http://localhost/backend/evaluator/first"
    let evaluatorFirstResponse = await axios.post(evaluatorFirstApi, {
      "A": listConversion(A, "point3d", "hex")
    })
    if (evaluatorFirstResponse.status != 200) {
      console.log("failure");
    }
    let C = listConversion(evaluatorFirstResponse.data.C, "hex", "point3d")
    // Second part - baseOT phase 2 + GC
    let sharedInfo = []
    garblerInit(sharedInfo)
    let delta = sharedInfo[0]
    let publicOneLabel = sharedInfo[1]
    let publicOneLabelDelta = sharedInfo[2]
    let numOfGInput = 256
    let gGInput0 = [] 
    let gGInput1 = [] 
    let gEInput0 = [] 
    let gEInput1 = [] 
    generateGarbledInput(gGInput0, gGInput1, gEInput0, gEInput1, numOfGInput, numOfEInput, delta)
    let gInput = [1,1,1,1,0,1,1,0,0,1,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,1,0,1,1,1,0,0,0,0,1,1,1,1,0,0,1,0,1,1,1,0,0,0,1,1,1,0,0,1,1,1,1,1,0,1,1,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,1,0,0,1,0,0, 0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,0,0,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,0,1,0,0,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,0,1,1]
    let eMessage0 = []
    let eMessage1 = []
    let messageLenInBytes = 16
    baseGOTSender2(numOfEInput, gEInput0, gEInput1, eMessage0, eMessage1, a, A, C, messageLenInBytes)
    let gOutput = []
    let gtt = []
    computeGarbledCircuit(gInput, gGInput0, gGInput1, gEInput0, publicOneLabelDelta, delta, gOutput, gtt)
    const evaluatorSecondApi = "http://localhost/backend/evaluator/second"
    let evaluatorSecondResponse = await axios.post(evaluatorSecondApi, {
      "A": listConversion(A, "point3d", "hex"),
      "e_0": listConversion(eMessage0, "bytes", "hex"),
      "e_1": listConversion(eMessage1, "bytes", "hex"),
      "gginput_0": listConversion(gGInput0, "bytes", "hex"),
      "public_one_label": bytesToHex(publicOneLabel),
      "gtt": listConversion(gtt, "bytes", "hex")
    })
    if (evaluatorSecondResponse.status != 200) {
      console.log("failure");
    }
    let eOutputString = evaluatorSecondResponse.data.eOutput
    let gOutputString = listConversion(gOutput, "bytes", "hex")
    let encryptedData = recoverResult(gOutputString, eOutputString)
    console.log(encryptedData)
    // expected output is 5cf48afbeea0fbccdf7b8571b60061e8 (hex) or # aes expected output is 01011100111101001000101011111011111011101010000011111011110011001101111101111011100001010111000110110110000000000110000111101000 (binary)
  }

  const evaluator = async (e) => {
    e.preventDefault();
    // trigger the process
    const garblerFirstApi = "http://localhost/backend/garbler/first"
    let garblerFirstResponse = await axios.post(garblerFirstApi, {
    })
    if (garblerFirstResponse.status != 200) {
      console.log("failure");
    }
    let numOfEInput = 128
    let messageLenInBytes = 16
    let A = listConversion(garblerFirstResponse.data.A, "hex", "point3d")
    let c = []
    let C = []
    let eInput = [1,1,0,1,0,0,1,1,1,0,0,0,1,0,0,0,1,0,1,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,0,1,0,0,0,0,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,0,0,0,1,1,1,1,1,1,1,1,1]
    baseOTReceiver1(numOfEInput, eInput, A, c, C)
    const garblerSecondApi = "http://localhost/backend/garbler/second"
    let garblerSecondResponse = await axios.post(garblerSecondApi, {
      "A": listConversion(A, "point3d", "hex"),
      "C": listConversion(C, "point3d", "hex"),
    })
    if (garblerSecondResponse.status != 200) {
      console.log("failure");
    }
    let eMessage0 = listConversion(garblerSecondResponse.data.eMessage0, "hex", "bytes")
    let eMessage1 = listConversion(garblerSecondResponse.data.eMessage1, "hex", "bytes")
    let gEInput = []
    baseGOTReceiver2(numOfEInput, eInput, eMessage0, eMessage1, gEInput, c, A, messageLenInBytes)
    let gGInput0 = listConversion(garblerSecondResponse.data.gGInput0, "hex", "bytes")
    let gtt = listConversion(garblerSecondResponse.data.gtt, "hex", "bytes")
    let eOutput = evaluateGarbledCircuit(gGInput0, gEInput, hexToBytes(garblerSecondResponse.data.publicOneLabel), gtt)
    let gOutputString = garblerSecondResponse.data.gOutput
    let eOutputString = listConversion(eOutput, "bytes", "hex")
    let encryptedData = recoverResult(gOutputString, eOutputString)
    console.log(encryptedData)
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={testECC}>Test ECC locally</button>
        <br/>
        <button onClick={testOT}>Test OT locally</button>
        <br/>
        <button onClick={testGC}>Test GC locally</button>
        <br/>
        <button onClick={garbler}>Browser is Garbler, Server is Evaluator</button>
        <br/>
        <button onClick={evaluator}>Browser is Evaluator, Server is Garbler</button>
        <br/>
      </header>
    </div>
  );
}

export default App;
