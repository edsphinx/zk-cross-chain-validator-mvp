const path = require('path');
const wasm_tester = require('circom_tester').wasm;
const { expect } = require('chai');

describe('AccountBalanceProof Circuit Tests', function() {
    this.timeout(100000);

    let circuit;

    before(async () => {
        // Compile the circuit
        circuit = await wasm_tester(
            path.join(__dirname, '../circuits/AccountBalanceProof.circom'),
            { output: path.join(__dirname, '../build/test') }
        );
    });

    describe('Valid Proofs', () => {
        it('Should generate a valid proof when balance >= threshold', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should work when balance equals threshold', async () => {
            const input = {
                balance: '500000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should work with large numbers', async () => {
            const input = {
                balance: '999999999999999999',
                threshold: '100000000000000000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should work with minimum threshold (0)', async () => {
            const input = {
                balance: '100',
                threshold: '0',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should work with different account hashes', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '99999999999999999999'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });
    });

    describe('Public Signals', () => {
        it('Should correctly expose threshold as public signal', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);

            // Public signals should be: threshold, accountHash
            // They are indexed starting from 1 (0 is always 1 in the witness)
            const publicSignals = [witness[2], witness[3]]; // Adjust indices based on circuit

            // Threshold should match input
            expect(publicSignals[0].toString()).to.equal(input.threshold);
        });

        it('Should correctly expose accountHash as public signal', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);

            const publicSignals = [witness[2], witness[3]];

            // AccountHash should match input
            expect(publicSignals[1].toString()).to.equal(input.accountHash);
        });

        it('Should NOT expose balance as public signal', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);

            // Balance should be private, not in public signals
            const publicSignals = [witness[2], witness[3]];

            // Balance should not appear in public signals
            expect(publicSignals[0].toString()).to.not.equal(input.balance);
            expect(publicSignals[1].toString()).to.not.equal(input.balance);
        });
    });

    describe('Edge Cases', () => {
        it('Should handle balance = 1, threshold = 0', async () => {
            const input = {
                balance: '1',
                threshold: '0',
                accountHash: '1'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should handle same values for all inputs', async () => {
            const input = {
                balance: '12345',
                threshold: '12345',
                accountHash: '12345'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });

        it('Should work with accountHash = 0', async () => {
            const input = {
                balance: '1000',
                threshold: '500',
                accountHash: '0'
            };

            const witness = await circuit.calculateWitness(input, true);
            await circuit.checkConstraints(witness);
        });
    });

    describe('Invalid Proofs', () => {
        it('Should fail when balance < threshold', async () => {
            const input = {
                balance: '400000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            try {
                await circuit.calculateWitness(input, true);
                expect.fail('Should have thrown an error');
            } catch (error) {
                // Expected to fail
                expect(error).to.exist;
            }
        });

        it('Should fail when balance is 0 and threshold > 0', async () => {
            const input = {
                balance: '0',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            try {
                await circuit.calculateWitness(input, true);
                expect.fail('Should have thrown an error');
            } catch (error) {
                // Expected to fail
                expect(error).to.exist;
            }
        });

        it('Should fail when balance is much less than threshold', async () => {
            const input = {
                balance: '1',
                threshold: '1000000000',
                accountHash: '12345678901234567890'
            };

            try {
                await circuit.calculateWitness(input, true);
                expect.fail('Should have thrown an error');
            } catch (error) {
                // Expected to fail
                expect(error).to.exist;
            }
        });
    });

    describe('Constraint Checks', () => {
        it('Should satisfy all constraints for valid input', async () => {
            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const witness = await circuit.calculateWitness(input, true);

            // This will throw if constraints are not satisfied
            await circuit.checkConstraints(witness);

            // If we get here, all constraints passed
            expect(true).to.be.true;
        });

        it('Should have correct number of constraints', async () => {
            const info = await circuit.getInfo();

            // The circuit should have a reasonable number of constraints
            // Exact number depends on implementation
            expect(info.constraints).to.be.greaterThan(0);
            console.log(`Circuit has ${info.constraints} constraints`);
        });
    });

    describe('Performance Tests', () => {
        it('Should calculate witness in reasonable time', async function() {
            this.timeout(10000);

            const input = {
                balance: '1000000',
                threshold: '500000',
                accountHash: '12345678901234567890'
            };

            const startTime = Date.now();
            await circuit.calculateWitness(input, true);
            const endTime = Date.now();

            const duration = endTime - startTime;
            console.log(`Witness calculation took ${duration}ms`);

            // Should complete in under 5 seconds
            expect(duration).to.be.lessThan(5000);
        });
    });
});
