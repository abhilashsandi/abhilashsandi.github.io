import React, { useEffect, useRef, useState } from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';

import './Landing.css';
import { headerData } from '../../data/headerData';
import { angleForPointer, frameForAngle, isInsideDeadZone, lerpAngle } from './landingAnimation';
import useCharacterFrames, { CENTER_FRAME, FRAME_COUNT } from './useCharacterFrames';

const TRACKING = { smoothing: 0.26, deadZoneRatio: 0.12 };
const supportsTracking = () => typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

function Landing() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const pointerRef = useRef(null);
  const angleRef = useRef(-Math.PI / 2);
  const [trackingEnabled, setTrackingEnabled] = useState(supportsTracking);
  const { frames, center, ready } = useCharacterFrames(trackingEnabled);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const update = () => setTrackingEnabled(pointerQuery.matches && motionQuery.matches);
    pointerQuery.addListener(update);
    motionQuery.addListener(update);
    return () => {
      pointerQuery.removeListener(update);
      motionQuery.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (!trackingEnabled || !ready || !heroRef.current || !canvasRef.current) return undefined;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
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
      const pointer = pointerRef.current || faceCenter;
      const radius = Math.min(rect.width, rect.height) * TRACKING.deadZoneRatio;
      let image = center;
      if (!isInsideDeadZone(pointer, faceCenter, radius)) {
        angleRef.current = lerpAngle(angleRef.current, angleForPointer(pointer, faceCenter), TRACKING.smoothing);
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
  }, [center, frames, ready, trackingEnabled]);

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
      <div className={`cursor-hero__character${ready ? ' is-ready' : ''}`}>
        <img src={CENTER_FRAME} alt='Abhilash Sandi' />
        <canvas ref={canvasRef} aria-label='Animated portrait of Abhilash Sandi following the pointer' />
      </div>
      {trackingEnabled && <div className='cursor-hero__cursor' aria-hidden='true' ref={cursorRef} />}
      <p className='cursor-hero__hint' aria-hidden='true'>Move your cursor</p>
    </section>
  );
}

export default Landing;
