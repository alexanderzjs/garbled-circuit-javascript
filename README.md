# Garbled Circuit Javascript Implementation

This repo provides a workable Garbled Circuit implementation in Javascript.

## Installation
This project requires two cryptography libraries, one is crypto-js and the other one is @noble/curves (Ethereum ECC implementation). 

## Implemented Protocols
Half And Gate with Free XOR protocol is implemented.

## General Workflow
### Garbler Side Code
Garbler invokes garblerInit() to generate values shared between Garbler and Evaluator. Then, it runs generateGarbledInput() to generate labels for input wires of both Garbler and Evaluator. Lastly, it executs computeGarbledCircuit() to compute output labels corresponding to all-0-bit output for Garbler.

### Evaluator Side Code
Evaluator executes evaluateGarbledCircuit() to evaluate the garbled circuit.
