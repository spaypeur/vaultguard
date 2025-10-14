import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useAuthStore } from '../stores/authStore';

interface VaultDoor3DProps {
  onUnlock?: () => void;
}

export default function VaultDoor3D({ onUnlock }: VaultDoor3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vaultGroupRef = useRef<THREE.Group | null>(null);
  const isAnimating = useRef(false);
  const { login } = useAuthStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff00, 1, 100);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Create vault door group
    const vaultGroup = new THREE.Group();
    vaultGroupRef.current = vaultGroup;

    // Create main vault door
    const doorGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32, 1, false, 0, Math.PI);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
      envMap: new THREE.CubeTextureLoader().load([
        '/textures/envmap/px.png',
        '/textures/envmap/nx.png',
        '/textures/envmap/py.png',
        '/textures/envmap/ny.png',
        '/textures/envmap/pz.png',
        '/textures/envmap/nz.png',
      ]),
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.rotation.x = Math.PI / 2;
    vaultGroup.add(door);

    // Add vault details (handles, locks, etc.)
    const handleGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 100);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.z = 0.3;
    vaultGroup.add(handle);

    // Add vault to scene
    scene.add(vaultGroup);

    // Animation function
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Handle unlock animation
  const handleUnlock = async (code: string) => {
    if (isAnimating.current || !vaultGroupRef.current) return;
    isAnimating.current = true;

    try {
      // Verify credentials
      await login(code);

      // Successful unlock animation
      gsap.to(vaultGroupRef.current.rotation, {
        y: Math.PI,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          isAnimating.current = false;
          onUnlock?.();
        },
      });

      // Add particle effects
      createUnlockParticles();

    } catch (error) {
      // Failed unlock animation
      gsap.to(vaultGroupRef.current.position, {
        x: -0.2,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          isAnimating.current = false;
        },
      });
    }
  };

  // Create particle effects for successful unlock
  const createUnlockParticles = () => {
    if (!sceneRef.current) return;

    const particlesCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = (Math.random() - 0.5) * 5;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 0.05,
      transparent: true,
    });

    const particles = new THREE.Points(geometry, material);
    sceneRef.current.add(particles);

    // Animate particles
    gsap.to(material, {
      opacity: 0,
      duration: 2,
      ease: 'power2.out',
      onComplete: () => {
        sceneRef.current?.remove(particles);
      },
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] relative"
      style={{ 
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-green-400 font-mono text-sm">
          QUANTUM ENCRYPTION ACTIVE
        </div>
        <div className="absolute top-4 right-4 text-cyan-400 font-mono text-sm">
          BIOMETRIC SCAN READY
        </div>
      </div>
    </div>
  );
}