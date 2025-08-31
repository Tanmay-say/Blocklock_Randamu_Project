import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, Trophy, Zap, Volume2, VolumeX, Users, Clock, Coins, Lock, Gift, Crown, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ethers } from 'ethers';
import { slotMachineService, type CurrentRound, type PlayerStats, type PlayerSession, type NFTMetadata, type GameResult } from '@/services/slotMachineService';
import { CasinoStatus } from '@/components/CasinoStatus';

const Casino = () => {
  const { isConnected, account, provider } = useWallet();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentResult, setCurrentResult] = useState<string[]>([]);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [reelStates, setReelStates] = useState<number[]>([0, 0, 0]);
  const [currentRound, setCurrentRound] = useState<CurrentRound | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ totalGames: 0, totalWins: 0, totalWinnings: 0, limitedEditionWins: 0, hasLimitedEdition: false });
  const [playerSession, setPlayerSession] = useState<PlayerSession>({ playsRemaining: 0, totalWins: 0, sessionId: 0, isActive: false });
  const [stakeAmount, setStakeAmount] = useState('0.005');
  const [winChance, setWinChance] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isStaking, setIsStaking] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [wonNFT, setWonNFT] = useState<NFTMetadata | null>(null);
  const [showLimitedEdition, setShowLimitedEdition] = useState(false);
  const [isGeneratingNFT, setIsGeneratingNFT] = useState(false);
  const [contractInitialized, setContractInitialized] = useState(false);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState('');

  const symbols = ['🍀', '💎', '🎰'];

  const limitedEditionNFTs = [
    { id: 1, name: "Cosmic Phoenix", rarity: "Legendary", image: "🦅", locked: true },
    { id: 2, name: "Quantum Dragon", rarity: "Mythic", image: "🐉", locked: true },
    { id: 3, name: "Ethereal Unicorn", rarity: "Divine", image: "🦄", locked: true }
  ];

  useEffect(() => {
    if (isConnected && account && provider) {
      initializeContract();
    }
  }, [isConnected, account, provider]);

  // Force refresh when component mounts to ensure sync with contract
  useEffect(() => {
    if (contractInitialized && account) {
      console.log('🔄 Force refreshing all data on component mount...');
      Promise.all([
        loadContractData(),
        loadUserBalance(),
        loadPlayerStats(),
        loadPlayerSession()
      ]).then(() => {
        console.log('✅ Initial data refresh completed');
      }).catch(error => {
        console.error('❌ Initial data refresh failed:', error);
      });
    }
  }, [contractInitialized, account]);

  // Auto-refresh data every 30 seconds to keep in sync
  useEffect(() => {
    if (!contractInitialized || !account) return;

    const interval = setInterval(async () => {
      console.log('🔄 Auto-refreshing contract data...');
      await Promise.all([
        loadPlayerSession(),
        loadPlayerStats()
      ]);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [contractInitialized, account]);

  const initializeContract = async () => {
    try {
      console.log('🚀 Initializing SlotMachine contract...');
      const contractAddress = import.meta.env.VITE_SLOT_MACHINE_ADDRESS || '0x9568cd176Eb3B5912e1e5c70bdc768C6e744D42b';
      console.log('📍 Contract address:', contractAddress);
      console.log('🔧 Environment variables loaded:', !!import.meta.env.VITE_SLOT_MACHINE_ADDRESS);
      console.log('🔗 Provider available:', !!provider);
      console.log('👤 Account:', account);
      
      const network = await provider.getNetwork();
      console.log('Provider network:', network);
      setCurrentNetwork(network.name);
      
      // Check if we're on supported networks (Base Sepolia: 84532, or localhost: 1337/31337)
      const supportedChainIds = [84532n, 1337n, 31337n];
      if (!supportedChainIds.includes(network.chainId)) {
        setWrongNetwork(true);
        toast({
          title: "Wrong Network",
          description: `Please switch to Base Sepolia testnet. Currently on: ${network.name} (${network.chainId})`,
          variant: "destructive"
        });
        return;
      } else {
        setWrongNetwork(false);
      }
      
      await slotMachineService.initialize(provider);
      setContractInitialized(true);
      
      // Set up event listeners
      setupEventListeners();
      
      // Load initial data
      await loadContractData();
      await loadUserBalance();
      await loadPlayerStats();
      await loadPlayerSession();
      
      toast({
        title: "Contract Connected",
        description: "SlotMachine contract initialized successfully on Base Sepolia",
      });
    } catch (error: any) {
      console.error('Failed to initialize contract:', error);
      setContractInitialized(false);
      
      // Check if it's a network issue
      if (error.message?.includes('network')) {
        toast({
          title: "Network Error",
          description: "Please switch to Base Sepolia testnet in MetaMask",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Contract Error", 
          description: `Failed to connect: ${error.message || error}`,
          variant: "destructive"
        });
      }
    }
  };

  const setupEventListeners = () => {
    // Listen for game results
    slotMachineService.onGameResult((result: GameResult) => {
      console.log('🎮 GameResult event received:', result);
      setLastGameResult(result);
      
      if (result.player === account) {
        console.log('🎯 Game result for current player:', result);
        if (result.won && result.nftTokenId > 0) {
          console.log('🎉 Player won NFT! TokenId:', result.nftTokenId);
          // Load NFT metadata and show win dialog
          loadNFTMetadata(result.nftTokenId);
        } else if (result.won) {
          console.log('🎯 Player won but no NFT');
          toast({
            title: "🎉 You Won!",
            description: "Great job! Keep playing for a chance to win rare NFTs!",
          });
        } else {
          console.log('😔 Player lost this round');
        }
      }
    });

    // Listen for NFT minting
    slotMachineService.onNFTMinted((player: string, tokenId: number, name: string, isLimitedEdition: boolean) => {
      console.log('🔥 NFTMinted event received:', { player, tokenId, name, isLimitedEdition });
      if (player === account) {
        console.log('🎨 NFT minted for current player!');
        toast({
          title: "🎉 NFT Minted! 🎉",
          description: `${name} has been minted to your wallet!`,
        });
        
        // If it's a limited edition, show special message
        if (isLimitedEdition) {
          toast({
            title: "🏆 LIMITED EDITION NFT!",
            description: `Congratulations! You've earned a rare ${name}!`,
          });
        }
      }
    });

    // Listen for game plays (real-time session updates)
    slotMachineService.onGamePlayed((player: string, sessionId: number, playsRemaining: number) => {
      if (player === account) {
        console.log(`🎮 Game played! Plays remaining: ${playsRemaining}`);
        setPlayerSession(prev => ({
          ...prev,
          playsRemaining: playsRemaining
        }));
      }
    });

    // Listen for limited edition claims
    slotMachineService.onLimitedEditionClaimed((player: string, tokenId: number) => {
      if (player === account) {
        toast({
          title: "🏆 Limited Edition NFT Claimed! 🏆",
          description: "Your exclusive Limited Edition NFT has been claimed!",
        });
        setShowLimitedEdition(false);
      }
    });
  };

  const loadContractData = async () => {
    try {
      const round = await slotMachineService.getCurrentRound();
      setCurrentRound(round);
      
      const stakeAmountWei = await slotMachineService.getStakeAmount();
      setStakeAmount(ethers.formatEther(stakeAmountWei));
      
      const maxPlayersNum = await slotMachineService.getMaxPlayersPerRound();
      setMaxPlayers(maxPlayersNum);
      
      const winPercentageNum = await slotMachineService.getWinPercentage();
      setWinChance(winPercentageNum);
      
    } catch (error) {
      console.error('Failed to load contract data:', error);
    }
  };

  const loadUserBalance = async () => {
    try {
      if (provider && account) {
        const balance = await provider.getBalance(account);
        const balanceInEth = ethers.formatEther(balance);
        setUserBalance(parseFloat(balanceInEth).toFixed(4));
      }
    } catch (error) {
      console.error('Failed to load user balance:', error);
    }
  };

  const loadPlayerStats = async () => {
    try {
      if (account) {
        const stats = await slotMachineService.getPlayerStats(account);
        setPlayerStats(stats);
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
  };

  const loadNFTMetadata = async (tokenId: number) => {
    try {
      setIsGeneratingNFT(true);
      const metadata = await slotMachineService.getNFTMetadata(tokenId);
      setWonNFT(metadata);
      setShowWinDialog(true);
    } catch (error) {
      console.error('Failed to load NFT metadata:', error);
    } finally {
      setIsGeneratingNFT(false);
    }
  };

  // Sound effects
  useEffect(() => {
    if (isSpinning && isSoundOn) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 2);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);
      
      return () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Already disconnected
        }
      };
    }
  }, [isSpinning, isSoundOn]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      slotMachineService.removeAllListeners();
    };
  }, []);

  const stakeForPlays = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to play",
        variant: "destructive"
      });
      return;
    }

    if (!contractInitialized) {
      toast({
        title: "Contract Not Ready",
        description: "Please wait for contract initialization",
        variant: "destructive"
      });
      return;
    }

    if (!currentRound?.isActive) {
      toast({
        title: "Round Not Active",
        description: "Please wait for the next round to start",
        variant: "destructive"
      });
      return;
    }

    if (currentRound?.playerCount >= maxPlayers) {
      toast({
        title: "Round Full",
        description: `This round has reached maximum players (${maxPlayers}). Wait for next round.`,
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(userBalance) < parseFloat(stakeAmount)) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${stakeAmount} ETH to play`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    setIsSpinning(true);
    
    try {
      toast({
        title: "Processing Transaction",
        description: `Staking ${stakeAmount} ETH via MetaMask...`,
      });

      // Call the smart contract function
      const tx = await slotMachineService.stakeForPlays();
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for blockchain confirmation...",
      });

      // Start spinning animation
      const spinDuration = 3000;
      const spinInterval = 100;
      let spinCount = 0;

      const spinTimer = setInterval(() => {
        spinCount++;
        setReelStates(prev => prev.map(() => Math.floor(Math.random() * symbols.length)));
        
        if (spinCount * spinInterval >= spinDuration) {
          clearInterval(spinTimer);
          setIsSpinning(false);
        }
      }, spinInterval);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "✅ Staking Successful!",
        description: "You now have 10 plays! Click PLAY GAME to start playing.",
      });
      
      // Refresh data immediately
      await Promise.all([
        loadContractData(),
        loadUserBalance(),
        loadPlayerStats(),
        loadPlayerSession()
      ]);
      
      // Add an extra refresh after a short delay to ensure blockchain state is updated
      setTimeout(async () => {
        console.log('🔄 Performing secondary data refresh...');
        await Promise.all([
          loadPlayerSession(),
          loadPlayerStats()
        ]);
        
        toast({
          title: "Session Updated",
          description: "Your playing session is now active!",
        });
      }, 2000);
      
    } catch (error: any) {
      setIsSpinning(false);
      console.error('Stake and play failed:', error);
      
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to stake and play. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const claimLimitedEditionNFT = async () => {
    if (!contractInitialized) {
      toast({
        title: "Contract Not Ready",
        description: "Please wait for contract initialization",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Using Blocklock Technology...",
        description: "Claiming your Limited Edition NFT with Blocklock distribution",
      });
      
      const tx = await slotMachineService.claimLimitedEditionNFT();
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for Blocklock confirmation...",
      });
      
      await tx.wait();
      
      toast({
        title: "🏆 Limited Edition NFT Claimed! 🏆",
        description: "Your exclusive Limited Edition NFT has been distributed via Blocklock!",
      });
      
      // Refresh player stats
      await loadPlayerStats();
      
    } catch (error: any) {
      console.error('Failed to claim limited edition NFT:', error);
      
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim Limited Edition NFT. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadPlayerSession = async () => {
    if (!account) return;
    
    try {
      console.log('🔍 Loading player session for:', account);
      const session = await slotMachineService.getPlayerSession(account);
      console.log('✅ Player session loaded:', session);
      
      // Always update session state
      setPlayerSession(session);
      
      if (session.isActive && session.playsRemaining > 0) {
        console.log(`🎮 User has ${session.playsRemaining} plays remaining`);
      } else {
        console.log('💰 User needs to stake first');
        // Make sure session is marked as inactive if no plays
        setPlayerSession(prev => ({
          ...prev,
          isActive: false,
          playsRemaining: 0
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load player session:', error);
    }
  };

  const playGame = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to play",
        variant: "destructive"
      });
      return;
    }

    if (!contractInitialized) {
      toast({
        title: "Contract Not Ready",
        description: "Please wait for contract initialization",
        variant: "destructive"
      });
      return;
    }

    if (!playerSession.isActive || playerSession.playsRemaining <= 0) {
      toast({
        title: "No Plays Remaining",
        description: "Please stake first to get 10 plays",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    
    try {
      toast({
        title: "Playing Game",
        description: "Processing your game via MetaMask...",
      });

      // Call the smart contract function
      const tx = await slotMachineService.playGame();
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for blockchain confirmation...",
      });

      // Start spinning animation
      const spinDuration = 3000;
      const spinInterval = 100;
      let spinCount = 0;

      const spinTimer = setInterval(() => {
        spinCount++;
        setReelStates(prev => prev.map(() => Math.floor(Math.random() * symbols.length)));
        
        if (spinCount * spinInterval >= spinDuration) {
          clearInterval(spinTimer);
          setIsSpinning(false);
        }
      }, spinInterval);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Immediately update session state before waiting for contract call
      const newPlaysRemaining = Math.max(0, playerSession.playsRemaining - 1);
      setPlayerSession(prev => ({
        ...prev,
        playsRemaining: newPlaysRemaining
      }));
      
      toast({
        title: "✅ Game Played!",
        description: `Plays remaining: ${newPlaysRemaining}`,
      });
      
      // Generate final result for display
      const result = symbols.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setCurrentResult(result);
      
      // Refresh data from contract (this might be slower)
      setTimeout(async () => {
        await Promise.all([
          loadContractData(),
          loadUserBalance(),
          loadPlayerStats(),
          loadPlayerSession()
        ]);
      }, 1000);
      
    } catch (error: any) {
      setIsSpinning(false);
      console.error('Play game failed:', error);
      
      // Check if session has ended
      if (error.message.includes('NoActiveSession') || error.message.includes('NoPlaysRemaining')) {
        // Force refresh session data
        await loadPlayerSession();
        
        toast({
          title: "Session Ended",
          description: "Your session has ended. Please stake again to get more plays.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Game Failed",
          description: error.message || "Failed to play game. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const resetGame = () => {
    setCurrentResult([]);
    setLastGameResult(null);
    
    toast({
      title: "Display Reset",
      description: "Local display has been reset. Blockchain stats remain unchanged.",
    });
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    toast({
      title: isSoundOn ? "Sound Disabled" : "Sound Enabled",
      description: isSoundOn ? "Sound effects are now off" : "Sound effects are now on",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <span className="text-4xl">🎰</span>
            NFT Casino - Lucky Spinner
            <span className="text-4xl">🎰</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stake exactly {stakeAmount} ETH for a {winChance}% chance to win a rare soul-bound NFT! 
            Powered by VRF randomness and Blocklock technology.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Network Warning Banner */}
          {isConnected && wrongNetwork && (
            <div className="mb-6 p-6 bg-destructive/20 rounded-lg border-2 border-destructive text-center">
              <h3 className="text-xl font-bold text-destructive mb-3">⚠️ Wrong Network Detected!</h3>
              <p className="text-destructive mb-4">
                You're on {currentNetwork}. The casino requires Base Sepolia testnet.
              </p>
              <Button 
                onClick={async () => {
                  try {
                    await window.ethereum?.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: '0x14a34' }], // 84532 in hex
                    });
                    window.location.reload();
                  } catch (error: any) {
                    if (error.code === 4902) {
                      await window.ethereum?.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                          chainId: '0x14a34',
                          chainName: 'Base Sepolia',
                          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                          rpcUrls: ['https://sepolia.base.org'],
                          blockExplorerUrls: ['https://sepolia.basescan.org'],
                        }],
                      });
                      window.location.reload();
                    }
                  }
                }}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold px-8 py-3"
              >
                🔄 Switch to Base Sepolia Testnet
              </Button>
            </div>
          )}

          {/* Status Component */}
          <CasinoStatus
            isConnected={isConnected}
            currentNetwork={currentNetwork}
            wrongNetwork={wrongNetwork}
            contractInitialized={contractInitialized}
            userBalance={userBalance}
            contractAddress={import.meta.env.VITE_SLOT_MACHINE_ADDRESS || '0x9568cd176Eb3B5912e1e5c70bdc768C6e744D42b'}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Slot Machine */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl text-white font-bold">Premium Slot Machine</CardTitle>
                  <p className="text-muted-foreground">Powered by VRF for true randomness</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Round Info */}
                  {currentRound && (
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 border border-primary/30">
                      <div className="grid grid-cols-4 gap-4 text-center">
                                                 <div>
                           <p className="text-sm text-muted-foreground">Round #{currentRound.roundId}</p>
                           <p className="text-lg font-bold text-primary">{currentRound.playerCount}/{maxPlayers}</p>
                         </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className={`text-lg font-bold ${currentRound.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {currentRound.isActive ? 'Active' : 'Ended'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stake Amount</p>
                          <p className="text-lg font-bold text-secondary">{stakeAmount} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your Balance</p>
                          <p className="text-lg font-bold text-yellow-400">{userBalance} ETH</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slot Machine Display */}
                  <div className="bg-gradient-to-b from-muted/50 to-card/50 rounded-2xl p-12 border-2 border-primary/20 shadow-2xl">
                    <div className="bg-black/40 rounded-xl p-8 border border-primary/30">
                      <div className="flex justify-center items-center space-x-6 mb-8">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 bg-gradient-to-b from-white/20 to-white/5 rounded-xl border-2 border-primary/50 shadow-lg overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
                            <div className="relative w-full h-full flex items-center justify-center text-4xl">
                              {isSpinning ? (
                                <span className="animate-spin text-primary">
                                  {symbols[reelStates[index]] || '🎰'}
                                </span>
                              ) : currentResult[index] ? (
                                <span className="text-4xl animate-pulse">
                                  {currentResult[index]}
                                </span>
                              ) : (
                                <span className="text-4xl text-muted-foreground">?</span>
                              )}
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse"></div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center mb-6">
                        <div className="w-72 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
                      </div>

                      {/* Game Buttons */}
                      <div className="text-center space-y-4">


                        {/* Show session info if player has active session */}
                        {playerSession.isActive && playerSession.playsRemaining > 0 && (
                          <div className="mb-4 p-3 bg-primary/20 rounded-lg border border-primary/30">
                            <p className="text-white font-medium">
                              🎮 Active Session: {playerSession.playsRemaining} plays remaining
                            </p>
                          </div>
                        )}

                        <div className="flex justify-center">
                          {/* Show ONLY the appropriate button based on session state */}
                          {playerSession.isActive && playerSession.playsRemaining > 0 ? (
                            /* PLAY GAME Button - Show when user has active session */
                            <Button
                              onClick={playGame}
                              disabled={isSpinning || !isConnected || !contractInitialized || wrongNetwork}
                              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 text-lg font-bold disabled:opacity-50 shadow-xl transform hover:scale-105 transition-all duration-200"
                              size="lg"
                            >
                              {isSpinning ? (
                                <>
                                  <div className="animate-spin mr-3 text-2xl">🎰</div>
                                  Spinning...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-3 w-6 h-6" />
                                  PLAY GAME
                                </>
                              )}
                            </Button>
                          ) : (
                            /* STAKE Button - Show when user needs to stake */
                            <Button
                              onClick={stakeForPlays}
                              disabled={isSpinning || isStaking || !currentRound?.isActive || currentRound?.playerCount >= maxPlayers || !isConnected || !contractInitialized || wrongNetwork}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-bold disabled:opacity-50 shadow-xl transform hover:scale-105 transition-all duration-200"
                              size="lg"
                            >
                              {isSpinning ? (
                                <>
                                  <div className="animate-spin mr-3 text-2xl">🎰</div>
                                  Spinning...
                                </>
                              ) : isStaking ? (
                                <>
                                  <Wallet className="mr-3 w-6 h-6" />
                                  Processing Transaction...
                                </>
                              ) : !isConnected ? (
                                <>
                                  <Zap className="mr-3 w-6 h-6" />
                                  Connect Wallet First
                                </>
                              ) : wrongNetwork ? (
                                <>
                                  <Clock className="mr-3 w-6 h-6" />
                                  Switch to Base Sepolia
                                </>
                              ) : !contractInitialized ? (
                                <>
                                  <Clock className="mr-3 w-6 h-6" />
                                  Initializing Contract...
                                </>
                              ) : !currentRound?.isActive ? (
                                <>
                                  <Clock className="mr-3 w-6 h-6" />
                                  Round Ended
                                </>
                              ) : currentRound?.playerCount >= maxPlayers ? (
                                <>
                                  <Users className="mr-3 w-6 h-6" />
                                  Round Full
                                </>
                              ) : (
                                <>
                                  <Coins className="mr-3 w-6 h-6" />
                                  STAKE FOR 10 PLAYS
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="mt-8 text-center">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-muted-foreground">Win Chance</p>
                          <p className="text-lg font-bold text-green-400">{winChance}%</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-muted-foreground">Max Players</p>
                          <p className="text-lg font-bold text-blue-400">{maxPlayers}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-muted-foreground">Stake Amount</p>
                          <p className="text-lg font-bold text-purple-400">{stakeAmount} ETH</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sound Control */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button
                    onClick={toggleSound}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    {isSoundOn ? (
                      <>
                        <Volume2 className="w-5 h-5 mr-2 text-primary" />
                        Sound On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-5 h-5 mr-2 text-muted-foreground" />
                        Sound Off
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* User Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-primary" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-primary/20 to-transparent rounded-lg border border-primary/30">
                      <p className="text-2xl font-bold text-primary">{playerStats.totalWinnings.toFixed(4)}</p>
                      <p className="text-sm text-muted-foreground">Total Winnings</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-secondary/20 to-transparent rounded-lg border border-secondary/30">
                      <p className="text-2xl font-bold text-secondary">{playerStats.totalGames}</p>
                      <p className="text-sm text-muted-foreground">Games Played</p>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-lg border border-yellow-400/30">
                    <p className="text-lg font-bold text-yellow-400">🏆 Wins: {playerStats.limitedEditionWins}/3</p>
                    <p className="text-sm text-muted-foreground">Limited Edition Progress</p>
                  </div>
                  
                  {/* Session Info */}
                  {playerSession.isActive && (
                    <div className="text-center p-3 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg border border-blue-400/30">
                      <p className="text-lg font-bold text-blue-400">🎮 Session: {playerSession.playsRemaining} plays left</p>
                      <p className="text-sm text-muted-foreground">Current Session Wins: {playerSession.totalWins}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        await Promise.all([
                          loadContractData(),
                          loadUserBalance(),
                          loadPlayerStats(),
                          loadPlayerSession()
                        ]);
                        toast({
                          title: "Data Refreshed",
                          description: "All contract data has been refreshed",
                        });
                      }}
                      variant="outline"
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                    
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="w-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Display
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* How to Play */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">How to Play</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Connect your MetaMask wallet</p>
                  <p>• Stake {stakeAmount} ETH ONCE to get 10 plays</p>
                  <p>• Use PLAY GAME button to play each game (free after staking)</p>
                  <p>• Each round has max {maxPlayers} players</p>
                  <p>• {winChance}% chance to win a rare NFT per game</p>
                  <p>• Winners determined by VRF randomness</p>
                  <p>• Win 3 times for Limited Edition NFT (Blocklock-powered)</p>
                  <p>• NFTs are soul-bound (non-transferable)</p>
                </CardContent>
              </Card>

              {/* Symbol Values */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Symbol Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {symbols.map((symbol, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-lg">{symbol}</span>
                        <span className="font-medium text-primary">Rare NFT</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Limited Edition NFTs Section */}
          <div className="mt-12">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Limited Edition NFTs (Blocklock Technology)
                  <Crown className="w-6 h-6 text-yellow-400" />
                </CardTitle>
                <p className="text-muted-foreground">Win 3 times to unlock these exclusive NFTs via Blocklock</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {limitedEditionNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                        playerStats.totalWins >= 3 
                          ? 'border-yellow-400 bg-gradient-to-b from-yellow-400/20 to-transparent' 
                          : 'border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      {playerStats.totalWins < 3 && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                          <Lock className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-6xl mb-4">{nft.image}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{nft.rarity}</p>
                        
                        {playerStats.totalWins >= 3 ? (
                          <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <Gift className="w-5 h-5" />
                            <span className="text-sm font-medium">Unlocked via Blocklock!</span>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            {3 - playerStats.totalWins} more wins needed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {playerStats.totalWins >= 3 && !playerStats.hasLimitedEdition && (
                  <div className="text-center mt-6">
                    <Button 
                      onClick={claimLimitedEditionNFT}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Claim Limited Edition NFT (Blocklock)
                    </Button>
                  </div>
                )}
                
                {playerStats.hasLimitedEdition && (
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">Limited Edition NFT Already Claimed!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Network Warning */}
          {isConnected && wrongNetwork && (
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-destructive/20 rounded-lg border border-destructive">
                <Clock className="w-5 h-5 text-destructive" />
                <span className="text-destructive text-lg">
                  Wrong Network: {currentNetwork}. Please switch to Base Sepolia testnet.
                </span>
              </div>
            </div>
          )}

          {/* Connection Prompt */}
          {!isConnected && (
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-muted rounded-lg border border-border">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground text-lg">Connect your MetaMask wallet to start playing</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      {/* Win Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-green-400">
              🎉 CONGRATULATIONS! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {isGeneratingNFT ? (
              <div className="space-y-4">
                <div className="text-4xl animate-spin">🎨</div>
                <p className="text-white">Loading your rare NFT generated with VRF randomness...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-primary h-2.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : wonNFT ? (
              <>
                <div className="text-6xl mb-4">
                  {wonNFT.imageURI ? (
                    <img src={wonNFT.imageURI} alt={wonNFT.name} className="w-24 h-24 mx-auto rounded-lg" />
                  ) : (
                    <div className="text-6xl">🎨</div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{wonNFT.name}</h3>
                <p className="text-muted-foreground">{wonNFT.description}</p>
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-3 border border-primary/30">
                  <p className="text-sm text-muted-foreground">Generated by VRF</p>
                  <p className="text-lg font-bold text-primary">Rare NFT</p>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>VRF Seed: {wonNFT.vrfSeed}</p>
                  <p>Soul-Bound: {wonNFT.isSoulBound ? 'Yes' : 'No'}</p>
                  <p>Owner: {wonNFT.owner}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 border border-green-400/30">
                  <p className="text-sm text-green-700 dark:text-green-400 text-center">
                    ✅ NFT already minted to your wallet!
                  </p>
                </div>
                <Button 
                  onClick={() => setShowWinDialog(false)}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Close
                </Button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Limited Edition Dialog */}
      <Dialog open={showLimitedEdition} onOpenChange={setShowLimitedEdition}>
        <DialogContent className="bg-card border-yellow-400/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-yellow-400">
              🏆 LIMITED EDITION UNLOCKED! 🏆
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6">
            <p className="text-white text-lg">
              You've won 3 times! Choose your Limited Edition NFT distributed via Blocklock:
            </p>
            <div className="grid grid-cols-3 gap-4">
              {limitedEditionNFTs.map((nft) => (
                <div key={nft.id} className="p-4 border border-yellow-400/30 rounded-lg bg-gradient-to-b from-yellow-400/20 to-transparent">
                  <div className="text-4xl mb-2">{nft.image}</div>
                  <h4 className="font-bold text-white">{nft.name}</h4>
                  <p className="text-sm text-yellow-400">{nft.rarity}</p>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              <p>🔒 Powered by Blocklock Technology</p>
              <p>Limited Edition NFTs are distributed fairly and securely</p>
            </div>
            <Button 
              onClick={claimLimitedEditionNFT}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Limited Edition NFT (Blocklock)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Casino;
