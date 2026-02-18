import React, { useRef } from 'react';
import anime from 'animejs';
import { motion } from 'framer-motion';

const ParticleButton = ({ onClick, children, className, ...props }) => {
    const buttonRef = useRef(null);

    const createParticles = (e) => {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            document.body.appendChild(particle);

            const color = window.getComputedStyle(buttonRef.current).backgroundColor;
            particle.style.backgroundColor = color;
            particle.style.position = 'absolute';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = `${rect.left + x}px`;
            particle.style.top = `${rect.top + y}px`;
            particle.style.zIndex = 1000;

            anime({
                targets: particle,
                translateX: () => anime.random(-100, 100),
                translateY: () => anime.random(-100, 100),
                scale: [1, 0],
                opacity: [1, 0],
                easing: 'easeOutExpo',
                duration: anime.random(800, 1200),
                complete: () => particle.remove()
            });
        }
    };

    const handleClick = (e) => {
        createParticles(e);
        if (onClick) onClick(e);
    };

    return (
        <motion.button
            ref={buttonRef}
            onClick={handleClick}
            className={`relative overflow-hidden ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default ParticleButton;
