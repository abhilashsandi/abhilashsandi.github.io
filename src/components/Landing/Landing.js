import React, { useEffect, useRef, useState } from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';

import './Landing.css';
import { headerData } from '../../data/headerData';
import {
  angleForPointer,
  frameForAngle,
  isInsideDeadZone,
  lerpAngle,
  shouldShowCanvas,
} from './landingAnimation';
import { angleForMotion, isMotionNeutral, motionVector } from './mobileMotion';
import useCharacterFrames, { CENTER_FRAME, FRAME_COUNT } from './useCharacterFrames';

const TRACKING = { smoothing: 0.26, deadZoneRatio: 0.12 };
const MOTION = { maxTilt: 24, deadZone: 0.12 };
const motionLabel = {
  idle: 'Enable motion',
  requesting: 'Requesting motion…',
  listening: 'Move your phone',
  active: 'Motion enabled',
  denied: 'Motion denied',
  unavailable: 'Motion unavailable',
};
const inputCapabilities = () => {
  if (typeof window === 'undefined') return { pointerTracking: false, motionCandidate: false };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    pointerTracking: window.matchMedia('(pointer: fine)').matches && !reducedMotion,
    motionCandidate: window.matchMedia('(pointer: coarse)').matches && !reducedMotion,
  };
};

function Landing() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const pointerRef = useRef(null);
  const motionBaselineRef = useRef(null);
  const motionRef = useRef(null);
  const angleRef = useRef(-Math.PI / 2);
  const [capabilities, setCapabilities] = useState(inputCapabilities);
  const [motionState, setMotionState] = useState('idle');
  const [canvasSupported, setCanvasSupported] = useState(true);
  const loadFrames = capabilities.pointerTracking || motionState === 'listening' || motionState === 'active';
  const { frames, center, ready } = useCharacterFrames(loadFrames);
  const showCanvas = shouldShowCanvas(
    capabilities.pointerTracking || motionState === 'active',
    ready,
    canvasSupported
  );

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCapabilities(inputCapabilities());
    pointerQuery.addListener(update);
    coarseQuery.addListener(update);
    motionQuery.addListener(update);
    return () => {
      pointerQuery.removeListener(update);
      coarseQuery.removeListener(update);
      motionQuery.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (motionState !== 'listening' && motionState !== 'active') return undefined;
    const onOrientation = ({ beta, gamma }) => {
      if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return;
      if (!motionBaselineRef.current) {
        motionBaselineRef.current = { beta, gamma };
        motionRef.current = { x: 0, y: 0 };
        setMotionState('active');
        return;
      }
      motionRef.current = motionVector({ beta, gamma }, motionBaselineRef.current, MOTION.maxTilt);
    };
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [motionState]);

  const enableMotion = async () => {
    setMotionState('requesting');
    motionBaselineRef.current = null;
    motionRef.current = null;
    const OrientationEvent = window.DeviceOrientationEvent;
    if (!OrientationEvent) {
      setMotionState('unavailable');
      return;
    }
    try {
      if (typeof OrientationEvent.requestPermission === 'function') {
        const permission = await OrientationEvent.requestPermission();
        if (permission !== 'granted') {
          setMotionState('denied');
          return;
        }
      }
      setMotionState('listening');
    } catch (error) {
      setMotionState('unavailable');
    }
  };

  useEffect(() => {
    if (!showCanvas || !heroRef.current || !canvasRef.current) return undefined;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      setCanvasSupported(false);
      return undefined;
    }
    let animationFrame;
    const draw = (image) => {
      if (canvas.width !== image.naturalWidth) canvas.width = image.naturalWidth;
      if (canvas.height !== image.naturalHeight) canvas.height = image.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      context.drawImage(image, 0, 0);
    };
    const onPointerMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };
    const render = () => {
      const rect = hero.getBoundingClientRect();
      const faceCenter = { x: rect.left + rect.width * 0.59, y: rect.top + rect.height * 0.42 };
      let image = center;
      if (capabilities.pointerTracking) {
        const pointer = pointerRef.current || faceCenter;
        const radius = Math.min(rect.width, rect.height) * TRACKING.deadZoneRatio;
        if (!isInsideDeadZone(pointer, faceCenter, radius)) {
          angleRef.current = lerpAngle(angleRef.current, angleForPointer(pointer, faceCenter), TRACKING.smoothing);
          image = frames[frameForAngle(angleRef.current, FRAME_COUNT)];
        }
      } else if (motionRef.current && !isMotionNeutral(motionRef.current, MOTION.deadZone)) {
        angleRef.current = lerpAngle(
          angleRef.current,
          angleForMotion(motionRef.current),
          TRACKING.smoothing
        );
        image = frames[frameForAngle(angleRef.current, FRAME_COUNT)];
      }
      if (image) draw(image);
      animationFrame = window.requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    draw(center);
    animationFrame = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [capabilities.pointerTracking, center, frames, showCanvas]);

  return (
    <section className='cursor-hero' aria-labelledby='hero-title' ref={heroRef}>
      <nav className='cursor-hero__nav' aria-label='Primary navigation'>
        <NavLink to='/#projects' smooth>Work</NavLink>
        <NavLink to='/#about' smooth>About</NavLink>
        <NavLink to='/#contacts' smooth>Contact</NavLink>
      </nav>
      <div className='cursor-hero__copy'>
        <p className='cursor-hero__eyebrow'>Hi, I'm</p>
        <h1 id='hero-title'>{headerData.name}</h1>
        <p className='cursor-hero__bio'>{headerData.desciption}</p>
        <div className='cursor-hero__actions'>
          <a href={headerData.resumePdf} download='Abhilash_Sandi_Resume'>Resume <span aria-hidden='true'>→</span></a>
          <NavLink to='/#contacts' smooth>Let's Talk</NavLink>
        </div>
      </div>
      <div className={`cursor-hero__character${showCanvas ? ' is-ready' : ''}`}>
        <img src={CENTER_FRAME} alt='Abhilash Sandi' aria-hidden={showCanvas} />
        <canvas
          ref={canvasRef}
          aria-label='Animated portrait of Abhilash Sandi following the pointer'
          aria-hidden={!showCanvas}
        />
        {capabilities.motionCandidate && (
          <button
            className='cursor-hero__motion'
            type='button'
            onClick={enableMotion}
            disabled={motionState !== 'idle'}
            aria-live='polite'
          >
            {motionLabel[motionState]}
          </button>
        )}
      </div>
      {showCanvas && <div className='cursor-hero__cursor' aria-hidden='true' ref={cursorRef} />}
      {showCanvas && <p className='cursor-hero__hint' aria-hidden='true'>Move your cursor</p>}
    </section>
  );
}

export default Landing;
