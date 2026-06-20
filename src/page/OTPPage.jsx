import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const [batterySupported, setBatterySupported] = useState(true);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const terminalEndRef = useRef(null);
  const hasInitialized = useRef(false);

  // CLI spinner characters
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // Typing effect for terminal lines
  const [currentLineText, setCurrentLineText] = useState('');
  const fullLines = [
    'Build-auth v1.0.0',
    '',
    'Initializing authentication system...',
    'Loading security modules... [OK]',
    'Checking network status... [OK]',
    '',
    '════════════════════════════════════════════════',
    '         SECURE ACCESS AUTHENTICATION',
    '════════════════════════════════════════════════',
    '',
    'This Build Data is protected.',
    'Please enter your 6-digit access code to continue.',
    ''
  ];

  // Get REAL battery information
  useEffect(() => {
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          
          setBatteryLevel(Math.floor(battery.level * 100));
          setIsCharging(battery.charging);
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.floor(battery.level * 100));
          });
          
          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        } catch (error) {
          console.log('Battery API not supported');
          setBatterySupported(false);
          setBatteryLevel(null);
        }
      } else {
        console.log('Battery API not available');
        setBatterySupported(false);
        setBatteryLevel(null);
      }
    };

    getBatteryInfo();
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let charIndex = 0;
    let lineIndex = 0;

    const typeNextChar = () => {
      if (lineIndex >= fullLines.length) {
        setShowInput(true);
        return;
      }

      const currentLine = fullLines[lineIndex];
      
      if (charIndex < currentLine.length) {
        setCurrentLineText(currentLine.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeNextChar, 20);
      } else {
        setTerminalLines(prev => [...prev, currentLine]);
        setCurrentLineText('');
        charIndex = 0;
        lineIndex++;
        setTimeout(typeNextChar, 100);
      }
    };

    typeNextChar();
  }, []);

  // Animate spinner
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerIndex(prev => (prev + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Simulate system stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 20);
      setMemUsage(Math.floor(Math.random() * 20) + 40);
      setNetworkActivity(Math.floor(Math.random() * 100));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines, showInput, error, loading]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleSubmit();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
  const otpValue = otp.join('');
  if (otpValue.length !== 6) {
    setError('Error: OTP must be 6 digits');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-passcode`, {
      passcode: otpValue
    });
    
    if (response.data.success) {
      // ✅ Store authentication in sessionStorage (expires when browser closes)
      sessionStorage.setItem('portfolioAuthenticated', 'true');
      sessionStorage.setItem('authTime', Date.now().toString());

      setTerminalLines(prev => [...prev, '', '✓ Authentication successful!', 'Redirecting...']);
      
      const returnTo = location.state?.returnTo || '/home';
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } else {
      setError('Authentication failed: Invalid passcode');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  } catch (err) {
    console.error('OTP verification error:', err);
    setError('Error: ' + (err.response?.data?.message || 'Invalid passcode'));
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } finally {
    setLoading(false);
  }
};


  // Generate progress bar
  const generateProgressBar = (percentage, width = 20) => {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  };

  // Generate network activity visualization
  const generateNetworkBars = () => {
    const level = Math.floor((networkActivity / 100) * 5);
    const bars = ['▁', '▂', '▃', '▅', '▇'];
    return bars.slice(0, level + 1).join('');
  };

  // Generate battery icon based on level
  const getBatteryIcon = () => {
    if (!batteryLevel) return '?????';
    if (batteryLevel >= 80) return '█████';
    if (batteryLevel >= 60) return '████░';
    if (batteryLevel >= 40) return '███░░';
    if (batteryLevel >= 20) return '██░░░';
    return '█░░░░';
  };

  // Get battery color based on level
  const getBatteryColor = () => {
    if (!batteryLevel) return 'text-cli-green-dim';
    if (batteryLevel >= 50) return 'text-cli-green-bright';
    if (batteryLevel >= 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto pb-48 sm:pb-40">
        <div className="max-w-4xl mx-auto">
          
          <div className="space-y-1 text-sm sm:text-base leading-relaxed">
            {terminalLines.map((line, index) => (
              <div key={index}>
                {line}
              </div>
            ))}
            
            {/* Show current typing line */}
            {currentLineText && (
              <div className="flex items-center">
                <span>{currentLineText}</span>
                <span className="animate-cursor-blink ml-1">█</span>
              </div>
            )}

            {showInput && (
              <div className="mt-6 space-y-4">
                
                <div className="flex items-center gap-2">
                  <span className="text-cli-green-bright">user@build:~$</span>
                  <span>enter_code</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-cli-green-dim">&gt;</span>
                  <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 bg-cli-bg border border-cli-green text-cli-green text-xl sm:text-2xl md:text-3xl font-bold text-center outline-none focus:border-cli-green-bright focus:bg-cli-bg caret-cli-green transition-all duration-200"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <span className="text-cli-green animate-cursor-blink text-xl sm:text-2xl">█</span>
                </div>

                {error && (
                  <div className="text-red-500 ml-4 flex items-center gap-2">
                    <span className="animate-pulse">✗</span>
                    <span>{error}</span>
                  </div>
                )}

                {loading && (
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-cli-green-bright text-lg">{spinnerFrames[spinnerIndex]}</span>
                    <span>Verifying credentials</span>
                    <span className="animate-cursor-blink">...</span>
                  </div>
                )}

                {!loading && !error && (
                  <div className="mt-6 space-y-1 text-cli-green-dim text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span>→</span>
                      <span>Press ENTER to submit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>→</span>
                      <span>Press CTRL+C to cancel</span>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-cli-bg border border-cli-green text-cli-green px-6 py-2 hover:bg-cli-green hover:text-cli-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? 'PROCESSING...' : '[ENTER] SUBMIT'}
                    </span>
                    <span className="absolute inset-0 bg-cli-green transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200"></span>
                  </button>
                </div>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      {/* Animated CLI Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-cli-bg border-t-2 border-cli-green p-3 sm:p-4 text-xs sm:text-sm">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* System Stats - Row 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* CPU Usage */}
            <div className="flex items-center gap-2">
              <span className="text-cli-green-dim">CPU:</span>
              <span className="text-cli-green font-bold">{generateProgressBar(cpuUsage, 10)}</span>
              <span className="text-cli-green-bright">{cpuUsage}%</span>
            </div>
            
            {/* Memory Usage */}
            <div className="flex items-center gap-2">
              <span className="text-cli-green-dim">MEM:</span>
              <span className="text-cli-green font-bold">{generateProgressBar(memUsage, 10)}</span>
              <span className="text-cli-green-bright">{memUsage}%</span>
            </div>

            {/* REAL Battery with charging indicator */}
            <div className="flex items-center gap-2">
              <span className="text-cli-green-dim">BAT:</span>
              {batteryLevel !== null ? (
                <>
                  <span className={`font-bold ${getBatteryColor()}`}>
                    [{getBatteryIcon()}]
                  </span>
                  <span className={getBatteryColor()}>{batteryLevel}%</span>
                  {isCharging && (
                    <span className="text-yellow-400 animate-pulse">⚡</span>
                  )}
                </>
              ) : (
                <span className="text-cli-green-dim">N/A</span>
              )}
            </div>
          </div>

          {/* System Stats - Row 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* Network Activity */}
            <div className="flex items-center gap-2">
              <span className="text-cli-green-dim">NET:</span>
              <span className="text-cli-green-bright text-lg">{generateNetworkBars()}</span>
              <span className="text-cli-green-bright">{networkActivity} KB/s</span>
            </div>

            {/* Disk Usage */}
            <div className="flex items-center gap-2">
              <span className="text-cli-green-dim">DISK:</span>
              <span className="text-cli-green font-bold">{generateProgressBar(65, 10)}</span>
              <span className="text-cli-green-bright">65%</span>
            </div>
          </div>

          {/* Status Line with Spinner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-cli-green-dim border-t border-cli-green-dim/30 pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-cli-green-bright animate-pulse text-lg">{spinnerFrames[spinnerIndex]}</span>
                <span className="text-cli-green-bright">MONITORING</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                <span className="text-cli-green-bright animate-cursor-blink">●</span>
                <span>SECURE</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span>Uptime: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Build-auth</span>
              <span className="animate-cursor-blink">_</span>
            </div>
          </div>

          {/* Process Info Line */}
          <div className="text-cli-green-dim text-[10px] sm:text-xs border-t border-cli-green-dim/30 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span>PID: 1337 | USER: root | PROCESS: auth.service</span>
              <span className="flex items-center gap-2">
                <span>[{spinnerFrames[spinnerIndex]}] Running</span>
                <span className="hidden sm:inline">| Kernel: 6.1.0</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
