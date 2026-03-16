
import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const Player: React.FC = () => {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const [isJumping, setIsJumping] = useState(false);

  useFrame((state, delta) => {
    const { forward, backward, left, right, jump, run } = getKeys();

    const speed = run ? 10 : 5;
    const acceleration = 50;

    // Movement direction based on camera rotation
    direction.current.z = Number(forward) - Number(backward);
    direction.current.x = Number(right) - Number(left);
    direction.current.normalize();

    // Smoother movement
    if (forward || backward) velocity.current.z -= direction.current.z * acceleration * delta;
    if (left || right) velocity.current.x -= direction.current.x * acceleration * delta;

    // Friction
    velocity.current.z -= velocity.current.z * 10 * delta;
    velocity.current.x -= velocity.current.x * 10 * delta;

    // Jumping logic (simple mock)
    if (jump && !isJumping) {
      velocity.current.y = 15;
      setIsJumping(true);
    }

    if (isJumping) {
      velocity.current.y -= 30 * delta; // gravity
      if (camera.position.y <= 2) {
        camera.position.y = 2;
        velocity.current.y = 0;
        setIsJumping(false);
      }
    }

    camera.translateX(-velocity.current.x * delta * speed);
    camera.translateZ(-velocity.current.z * delta * speed);
    camera.position.y += velocity.current.y * delta;

    // Lock floor
    if (camera.position.y < 2) camera.position.y = 2;
  });

  return null;
};

export default Player;
