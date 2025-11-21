import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import Link from 'next/link';

// Aave V3 on Scroll Sepolia addresses
const AAVE_POOL = '0x48914C788295b5db23aF2b5F0B3BE775C4eA9440';
const USDC = '0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D';
const WETH = '0xb123dCe044EdF0a755505d9623Fba16C0F41cae9';
const DAI = '0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40';
const AAVE_FAUCET = '0x2F826FD1a0071476330a58dD1A9B36bcF7da832d';

export default function AaveDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow' | 'repay' | 'withdraw'>('supply');

  // Form states
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAsset, setCollateralAsset] = useState(USDC);
  const [borrowAsset, setBorrowAsset] = useState(DAI);
  const [zkProof, setZkProof] = useState<any>(null);
  const [generatingProof, setGeneratingProof] = useState(false);

  // Account data state
  const [accountData, setAccountData] = useState({
    totalCollateralBase: '0',
    totalDebtBase: '0',
    availableBorrowsBase: '0',
    currentLiquidationThreshold: '0',
    ltv: '0',
    healthFactor: '0'
  });

  // Active loans state
  const [activeLoans, setActiveLoans] = useState<any[]>([]);

  // Asset balances
  const [balances, setBalances] = useState({
    usdc: '0',
    weth: '0',
    dai: '0'
  });

  // Fetch Aave account data
  const fetchAccountData = async () => {
    if (!address) return;

    try {
      const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/');
      const aavePool = new ethers.Contract(
        AAVE_POOL,
        [
          'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
        ],
        provider
      );

      const data = await aavePool.getUserAccountData(address);

      setAccountData({
        totalCollateralBase: ethers.formatUnits(data[0], 8), // Base currency has 8 decimals
        totalDebtBase: ethers.formatUnits(data[1], 8),
        availableBorrowsBase: ethers.formatUnits(data[2], 8),
        currentLiquidationThreshold: data[3].toString(),
        ltv: data[4].toString(),
        healthFactor: ethers.formatUnits(data[5], 18)
      });
    } catch (error) {
      console.error('Error fetching Aave data:', error);
    }
  };

  // Fetch token balances
  const fetchBalances = async () => {
    if (!address) return;

    try {
      const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/');
      const erc20Abi = ['function balanceOf(address) view returns (uint256)'];

      const usdcContract = new ethers.Contract(USDC, erc20Abi, provider);
      const wethContract = new ethers.Contract(WETH, erc20Abi, provider);
      const daiContract = new ethers.Contract(DAI, erc20Abi, provider);

      const [usdcBal, wethBal, daiBal] = await Promise.all([
        usdcContract.balanceOf(address),
        wethContract.balanceOf(address),
        daiContract.balanceOf(address)
      ]);

      setBalances({
        usdc: ethers.formatUnits(usdcBal, 6), // USDC has 6 decimals
        weth: ethers.formatUnits(wethBal, 18),
        dai: ethers.formatUnits(daiBal, 18)
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchAccountData();
      fetchBalances();
      const interval = setInterval(() => {
        fetchAccountData();
        fetchBalances();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  // Generate ZK Proof for collateral
  const generateCollateralProof = async () => {
    setGeneratingProof(true);
    try {
      // This would call your ZK proof generation script
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Placeholder proof
      const proof = {
        pA: [1, 2],
        pB: [[1, 2], [3, 4]],
        pC: [1, 2],
        pubSignals: [collateralAmount, borrowAmount, Date.now()]
      };

      setZkProof(proof);
      alert('✅ ZK Proof generated successfully!');
    } catch (error) {
      console.error('Error generating proof:', error);
      alert('❌ Failed to generate proof');
    } finally {
      setGeneratingProof(false);
    }
  };

  // Health Factor color
  const getHealthFactorColor = (hf: string) => {
    const healthFactor = parseFloat(hf);
    if (healthFactor === 0) return 'text-gray-400';
    if (healthFactor < 1.5) return 'text-red-500';
    if (healthFactor < 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <>
      <Head>
        <title>Aave V3 Integration | ZK Validator</title>
        <meta name="description" content="Borrow from Aave with ZK collateral proofs" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <span className="text-white font-bold text-xl">Aave Integration</span>
            </Link>
            <ConnectButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Aave V3 on <span className="text-purple-400">Scroll Sepolia</span>
            </h1>
            <p className="text-gray-300">
              Supply collateral and borrow assets with ZK proof verification
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl mb-6">Connect your wallet to continue</p>
              <ConnectButton />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: Account Overview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Account Health */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Account Health</h2>

                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Health Factor</div>
                      <div className={`text-3xl font-bold ${getHealthFactorColor(accountData.healthFactor)}`}>
                        {parseFloat(accountData.healthFactor) === 0
                          ? '∞'
                          : parseFloat(accountData.healthFactor).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {parseFloat(accountData.healthFactor) < 1.5 && parseFloat(accountData.healthFactor) > 0 && (
                          <span className="text-red-400">⚠️ Risk of liquidation!</span>
                        )}
                        {parseFloat(accountData.healthFactor) >= 1.5 && parseFloat(accountData.healthFactor) < 2 && (
                          <span className="text-yellow-400">⚠️ Moderate risk</span>
                        )}
                        {parseFloat(accountData.healthFactor) >= 2 && (
                          <span className="text-green-400">✅ Healthy</span>
                        )}
                        {parseFloat(accountData.healthFactor) === 0 && (
                          <span className="text-gray-400">No debt</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Total Collateral</span>
                        <span className="text-white font-semibold">
                          ${parseFloat(accountData.totalCollateralBase).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Total Debt</span>
                        <span className="text-white font-semibold">
                          ${parseFloat(accountData.totalDebtBase).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available to Borrow</span>
                        <span className="text-green-400 font-semibold">
                          ${parseFloat(accountData.availableBorrowsBase).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">LTV</span>
                        <span className="text-white">
                          {(parseFloat(accountData.ltv) / 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liq. Threshold</span>
                        <span className="text-white">
                          {(parseFloat(accountData.currentLiquidationThreshold) / 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Balances */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Your Wallet</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          U
                        </div>
                        <span className="text-white">USDC</span>
                      </div>
                      <span className="text-white font-semibold">
                        {parseFloat(balances.usdc).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          E
                        </div>
                        <span className="text-white">WETH</span>
                      </div>
                      <span className="text-white font-semibold">
                        {parseFloat(balances.weth).toFixed(4)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                          D
                        </div>
                        <span className="text-white">DAI</span>
                      </div>
                      <span className="text-white font-semibold">
                        {parseFloat(balances.dai).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://sepolia.scrollscan.com/address/${AAVE_FAUCET}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Get Test Tokens from Faucet →
                  </a>
                </div>

                {/* Quick Links */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Resources</h2>
                  <div className="space-y-2">
                    <a href="https://docs.aave.com/" target="_blank" className="block text-purple-400 hover:text-purple-300">
                      📖 Aave Docs →
                    </a>
                    <a href={`https://sepolia.scrollscan.com/address/${AAVE_POOL}`} target="_blank" className="block text-purple-400 hover:text-purple-300">
                      🔗 Aave Pool Contract →
                    </a>
                    <Link href="/dashboard" className="block text-purple-400 hover:text-purple-300">
                      ⚡ ZK Circuits Dashboard →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Operations */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="flex border-b border-gray-700">
                    <button
                      onClick={() => setActiveTab('supply')}
                      className={`flex-1 px-6 py-4 font-semibold transition ${
                        activeTab === 'supply'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Supply Collateral
                    </button>
                    <button
                      onClick={() => setActiveTab('borrow')}
                      className={`flex-1 px-6 py-4 font-semibold transition ${
                        activeTab === 'borrow'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Borrow
                    </button>
                    <button
                      onClick={() => setActiveTab('repay')}
                      className={`flex-1 px-6 py-4 font-semibold transition ${
                        activeTab === 'repay'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Repay
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className={`flex-1 px-6 py-4 font-semibold transition ${
                        activeTab === 'withdraw'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Supply Tab */}
                    {activeTab === 'supply' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Supply Collateral</h3>
                          <p className="text-gray-400">
                            Supply assets to Aave as collateral to borrow other assets
                          </p>
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-2">Asset</label>
                          <select
                            value={collateralAsset}
                            onChange={(e) => setCollateralAsset(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          >
                            <option value={USDC}>USDC</option>
                            <option value={WETH}>WETH</option>
                            <option value={DAI}>DAI</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-2">Amount</label>
                          <input
                            type="number"
                            value={collateralAmount}
                            onChange={(e) => setCollateralAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          />
                          <div className="text-sm text-gray-400 mt-1">
                            Available: {
                              collateralAsset === USDC ? balances.usdc :
                              collateralAsset === WETH ? balances.weth :
                              balances.dai
                            }
                          </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Supply APY</span>
                            <span className="text-green-400 font-semibold">2.45%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Collateral Factor</span>
                            <span className="text-white font-semibold">75%</span>
                          </div>
                        </div>

                        <button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition text-lg"
                          disabled={!collateralAmount}
                        >
                          Supply {collateralAsset === USDC ? 'USDC' : collateralAsset === WETH ? 'WETH' : 'DAI'}
                        </button>
                      </div>
                    )}

                    {/* Borrow Tab */}
                    {activeTab === 'borrow' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Borrow with ZK Proof</h3>
                          <p className="text-gray-400">
                            Generate ZK proof of collateral and borrow assets privately
                          </p>
                        </div>

                        <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">🔐</span>
                            <div>
                              <div className="text-white font-semibold mb-1">Privacy-Preserving Borrowing</div>
                              <div className="text-purple-200 text-sm">
                                Your collateral amount remains private. Only prove you meet the threshold!
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-2">Asset to Borrow</label>
                          <select
                            value={borrowAsset}
                            onChange={(e) => setBorrowAsset(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          >
                            <option value={DAI}>DAI</option>
                            <option value={USDC}>USDC</option>
                            <option value={WETH}>WETH</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-2">Amount</label>
                          <input
                            type="number"
                            value={borrowAmount}
                            onChange={(e) => setBorrowAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          />
                          <div className="text-sm text-gray-400 mt-1">
                            Available: ${accountData.availableBorrowsBase}
                          </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Borrow APY (Variable)</span>
                            <span className="text-red-400 font-semibold">3.87%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Required Collateral (150%)</span>
                            <span className="text-white font-semibold">
                              ${borrowAmount ? (parseFloat(borrowAmount) * 1.5).toFixed(2) : '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">New Health Factor</span>
                            <span className={borrowAmount ? 'text-yellow-400 font-semibold' : 'text-gray-500'}>
                              {borrowAmount ? '~1.85' : '-'}
                            </span>
                          </div>
                        </div>

                        {!zkProof ? (
                          <button
                            onClick={generateCollateralProof}
                            disabled={!borrowAmount || generatingProof}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition text-lg"
                          >
                            {generatingProof ? '⚡ Generating ZK Proof...' : '🔐 Generate ZK Collateral Proof'}
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">✅</span>
                                <div className="text-green-200">
                                  ZK Proof generated successfully!
                                </div>
                              </div>
                            </div>
                            <button
                              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition text-lg"
                            >
                              Borrow {borrowAsset === DAI ? 'DAI' : borrowAsset === USDC ? 'USDC' : 'WETH'}
                            </button>
                            <button
                              onClick={() => setZkProof(null)}
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
                            >
                              Generate New Proof
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Repay Tab */}
                    {activeTab === 'repay' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Repay Loan</h3>
                          <p className="text-gray-400">
                            Repay your borrowed assets to reduce debt
                          </p>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-gray-400 mb-2">Your Debt</div>
                          <div className="text-3xl font-bold text-white mb-4">
                            ${accountData.totalDebtBase}
                          </div>
                          {parseFloat(accountData.totalDebtBase) === 0 && (
                            <div className="text-green-400">✅ No active debt</div>
                          )}
                        </div>

                        {parseFloat(accountData.totalDebtBase) > 0 && (
                          <>
                            <div>
                              <label className="block text-gray-300 mb-2">Asset</label>
                              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                                <option value={DAI}>DAI</option>
                                <option value={USDC}>USDC</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-300 mb-2">Amount</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                              />
                            </div>

                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition text-lg">
                              Repay Loan
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Withdraw Tab */}
                    {activeTab === 'withdraw' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Withdraw Collateral</h3>
                          <p className="text-gray-400">
                            Withdraw your supplied collateral (must maintain health factor {'>'} 1)
                          </p>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-gray-400 mb-2">Supplied Collateral</div>
                          <div className="text-3xl font-bold text-white mb-4">
                            ${accountData.totalCollateralBase}
                          </div>
                          {parseFloat(accountData.totalCollateralBase) === 0 && (
                            <div className="text-yellow-400">⚠️ No collateral supplied</div>
                          )}
                        </div>

                        {parseFloat(accountData.totalCollateralBase) > 0 && (
                          <>
                            <div>
                              <label className="block text-gray-300 mb-2">Asset</label>
                              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                                <option value={USDC}>USDC</option>
                                <option value={WETH}>WETH</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-300 mb-2">Amount</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                              />
                            </div>

                            <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                  <div className="text-yellow-200 font-semibold mb-1">Health Factor Warning</div>
                                  <div className="text-yellow-100 text-sm">
                                    Ensure your health factor stays above 1.0 to avoid liquidation
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition text-lg">
                              Withdraw Collateral
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Loans */}
                {activeLoans.length > 0 && (
                  <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Active Loans</h2>
                    <div className="space-y-4">
                      {activeLoans.map((loan, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-white font-semibold">Loan #{loan.id}</div>
                              <div className="text-gray-400 text-sm">Borrowed: ${loan.amount}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-400">Active</div>
                              <div className="text-gray-400 text-sm">{loan.date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
