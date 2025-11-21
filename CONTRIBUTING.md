# Contributing to ZK-Cross-Chain Validator

Thank you for your interest in contributing to the ZK-Cross-Chain Validator project!

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:
1. Check if the issue already exists
2. Open a new issue with a clear description
3. Include steps to reproduce (for bugs)
4. Add relevant labels

### Submitting Changes

1. **Fork the Repository**
   ```bash
   git clone https://github.com/edsphinx/zk-cross-chain-validator-mvp.git
   cd zk-cross-chain-validator-mvp
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm run test:circuit
   forge test
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Guidelines

### Code Style

**Solidity:**
- Follow Solidity style guide
- Use clear variable names
- Add NatSpec comments
- Keep functions small and focused

**JavaScript:**
- Use ES6+ features
- Add JSDoc comments
- Handle errors properly
- Use async/await

**Circom:**
- Document circuit inputs/outputs
- Explain constraint logic
- Optimize for fewer constraints

### Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for >70% code coverage
- Include edge case tests

### Documentation

- Update README.md for major changes
- Add code comments for complex logic
- Update TUTORIAL.md for new features
- Keep IMPLEMENTATION.md current

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## Areas for Contribution

### High Priority

1. **Additional Use Cases**
   - Asset ownership verification circuit
   - Transaction existence proof circuit
   - Voting eligibility circuit
   - Collateral verification circuit

2. **Security Enhancements**
   - Circuit optimization
   - Range check improvements
   - Gas optimization
   - Security audit recommendations

3. **Testing**
   - More edge case tests
   - Fuzzing tests
   - Integration tests
   - Performance benchmarks

### Medium Priority

4. **Documentation**
   - Video tutorials
   - Architecture diagrams
   - API documentation
   - Integration examples

5. **Developer Tools**
   - CLI improvements
   - Proof visualization
   - Debugging tools
   - Better error messages

### Future Enhancements

6. **Frontend**
   - React/Vue web app
   - Web3 wallet integration
   - Proof generation UI
   - Explorer for verified proofs

7. **Infrastructure**
   - Proof aggregation
   - Batch verification
   - Caching layer
   - API service

8. **Cross-Chain Integration**
   - Oracle integration
   - Bridge compatibility
   - Multi-chain support
   - State synchronization

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues/PRs
- Reach out to maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to decentralized, privacy-preserving verification! =€
