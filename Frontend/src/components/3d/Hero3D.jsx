import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const AnimatedShape = ({ color, position, speed, distort }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={0.8}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </Float>
  );
};

const ParticleBackground = () => {
  const count = 500;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.4} />
    </points>
  );
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="#06b6d4" intensity={1} />
        
        <AnimatedShape position={[-3, 1, 0]} color="#8b5cf6" speed={1.5} distort={0.5} />
        <AnimatedShape position={[3, -1, 0]} color="#3b82f6" speed={1.2} distort={0.4} />
        <AnimatedShape position={[0, 2, -2]} color="#06b6d4" speed={1} distort={0.3} />
        
        <ParticleBackground />
      </Canvas>
    </div>
  );
};
