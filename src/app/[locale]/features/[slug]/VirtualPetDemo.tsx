'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PawPrint, Heart, Play, Apple } from 'lucide-react';
import { storage } from '@/lib/storage';

/* ── Types ── */

interface PetState {
  hunger: number;
  happiness: number;
  intimacy: number;
  level: number;
}

interface VirtualPetDemoProps {
  locale: string;
}

const DEFAULT_PET: PetState = {
  hunger: 50,
  happiness: 50,
  intimacy: 0,
  level: 1,
};

const STORAGE_KEY = 'pet';

/* ── Helper: clamp 0-100 ── */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ── Component ── */

export const VirtualPetDemo: FC<VirtualPetDemoProps> = () => {
  const prefersReduced = useReducedMotion();
  const [pet, setPet] = useState<PetState>(DEFAULT_PET);
  const [mounted, setMounted] = useState<boolean>(false);

  /* Hydration-safe */
  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as PetState | null;
    if (stored) {
      setPet(stored);
    }
  }, []);

  /* Persist on every change */
  const updatePet = useCallback((updated: PetState) => {
    setPet(updated);
    storage.set(STORAGE_KEY, updated);
  }, []);

  const handleFeed = useCallback(() => {
    updatePet({
      ...pet,
      hunger: clamp(pet.hunger + 20, 0, 100),
    });
  }, [pet, updatePet]);

  const handlePlay = useCallback(() => {
    updatePet({
      ...pet,
      happiness: clamp(pet.happiness + 15, 0, 100),
    });
  }, [pet, updatePet]);

  const handleCuddle = useCallback(() => {
    const newIntimacy = clamp(pet.intimacy + 10, 0, 100);
    updatePet({
      ...pet,
      intimacy: newIntimacy,
      level: Math.floor(newIntimacy / 20) + 1,
    });
  }, [pet, updatePet]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Your Pet
      </h3>

      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-6 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm text-center">
        {/* Pet avatar with breathing animation */}
        <motion.div
          animate={
            prefersReduced
              ? {}
              : {
                  scale: [1, 1.05, 1],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl shadow-blue-500/30 flex items-center justify-center"
        >
          <PawPrint className="h-10 w-10 text-white" />
        </motion.div>

        <p className="mt-3 font-semibold text-lg text-zinc-800 dark:text-zinc-100">Luna</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Level {pet.level} · Virtual Companion</p>

        {/* Stats bars */}
        <div className="mt-5 space-y-3">
          {/* Hunger */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Hunger</span>
              <span>{pet.hunger}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/40 dark:bg-purple-950/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
                initial={prefersReduced ? {} : { width: 0 }}
                animate={prefersReduced ? {} : { width: `${pet.hunger}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Happiness</span>
              <span>{pet.happiness}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/40 dark:bg-purple-950/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500"
                initial={prefersReduced ? {} : { width: 0 }}
                animate={prefersReduced ? {} : { width: `${pet.happiness}%` }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Intimacy */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Intimacy</span>
              <span>{pet.intimacy}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/40 dark:bg-purple-950/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={prefersReduced ? {} : { width: 0 }}
                animate={prefersReduced ? {} : { width: `${pet.intimacy}%` }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <motion.button
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={handleFeed}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-500/25 flex items-center justify-center hover:shadow-pink-500/40 transition-shadow"
            aria-label="Feed"
          >
            <Apple className="w-7 h-7 text-white" />
          </motion.button>

          <motion.button
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={handlePlay}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-500/25 flex items-center justify-center hover:shadow-purple-500/40 transition-shadow"
            aria-label="Play"
          >
            <Play className="w-7 h-7 text-white" />
          </motion.button>

          <motion.button
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={handleCuddle}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25 flex items-center justify-center hover:shadow-amber-500/40 transition-shadow"
            aria-label="Cuddle"
          >
            <Heart className="w-7 h-7 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};