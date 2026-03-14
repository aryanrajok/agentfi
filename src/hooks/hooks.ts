import { useState, useEffect, useRef, useCallback } from 'react';
import { JsonRpcProvider } from 'ethers';

// ─── Network-aware RPC ───
const BNB_TESTNET_RPC = import.meta.env.VITE_BNB_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const BNB_MAINNET_RPC = import.meta.env.VITE_BNB_MAINNET_RPC || 'https://bsc-dataseed.binance.org/';

/**
 * Typewriter effect hook
 */
export function useTypewriter(
  lines: string[],
  opts: { speed?: number; pauseMs?: number } = {},
) {
  const { speed = 40, pauseMs = 2000 } = opts;
  const [text, setText] = useState('');
  const lineIdx = useRef(0);
  const charIdx = useRef(0);
  const isPausing = useRef(false);

  useEffect(() => {
    const tick = () => {
      const line = lines[lineIdx.current];
      if (!line) return;

      if (isPausing.current) return;

      const idx = charIdx.current;
      if (idx < line.length) {
        const ch = line[idx];
        if (ch !== undefined) {
          setText((prev) => prev + ch);
        }
        charIdx.current = idx + 1;
      } else {
        isPausing.current = true;
        setTimeout(() => {
          const nextLine = (lineIdx.current + 1) % lines.length;
          lineIdx.current = nextLine;
          charIdx.current = 0;
          if (nextLine === 0) {
            setText('');
          } else {
            setText((prev) => prev + '\n');
          }
          isPausing.current = false;
        }, pauseMs);
      }
    };

    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [lines, speed, pauseMs]);

  return text;
}

/**
 * Count-up animation hook
 */
export function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, durationMs]);

  return value;
}

/**
 * REAL block number from BNB Chain RPC
 * Fetches the actual latest block number every 3 seconds
 */
export function useBlockNumber() {
  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    let cancelled = false;
    
    const fetchBlock = async () => {
      try {
        const rpc = import.meta.env.VITE_NETWORK === 'mainnet' ? BNB_MAINNET_RPC : BNB_TESTNET_RPC;
        const provider = new JsonRpcProvider(rpc);
        const block = await provider.getBlockNumber();
        if (!cancelled) setBlockNumber(block);
      } catch {
        // Silent fail - block number not critical
      }
    };

    fetchBlock();
    const id = setInterval(fetchBlock, 3000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return blockNumber;
}

/**
 * Copy to clipboard hook
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return { copy, copied };
}
