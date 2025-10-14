import { useEffect, useRef } from 'react';
import './GlobalMap.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Threat {
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
}

interface Transaction {
  fromLat: number;
  fromLong: number;
  toLat: number;
  toLong: number;
  amount: number;
  cryptocurrency: string;
}

export default function GlobalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);

  // Fetch real-time threat data
  const { data: threats } = useQuery<Threat[]>({
    queryKey: ['threats', 'live'],
    queryFn: async () => {
      const { data } = await api.get('/threats/live');
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch real-time transaction data
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'live'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/live');
      return data;
    },
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 200;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 120;
    controls.maxDistance = 300;

    // Create Earth Globe
    const globeGeometry = new THREE.SphereGeometry(100, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('/textures/earth-dark.jpg'),
      bumpMap: new THREE.TextureLoader().load('/textures/earth-bump.jpg'),
      bumpScale: 0.5,
      specularMap: new THREE.TextureLoader().load('/textures/earth-specular.jpg'),
      specular: new THREE.Color(0x666666),
      shininess: 0.5,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    let animationFrame: number;

    // Animation loop
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      if (globe) {
        globe.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative rounded-lg overflow-hidden"
      style={{ minHeight: '500px' }}
    >
      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 space-y-2 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-sm font-mono">
          <span className="text-red-400">CRITICAL THREATS:</span>{' '}
          <span className="text-white">
            {threats?.filter((t) => t.severity === 'critical').length || 0}
          </span>
        </div>
        <div className="text-sm font-mono">
          <span className="text-green-400">ACTIVE TRANSACTIONS:</span>{' '}
          <span className="text-white">{transactions?.length || 0}</span>
        </div>
        <div className="text-sm font-mono">
          <span className="text-cyan-400">NETWORK STATUS:</span>{' '}
          <span className="text-white">QUANTUM SECURE</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-xs font-mono space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white">Critical Threat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-white">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white">Low Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-white">Active Transaction</span>
          </div>
        </div>
      </div>

      {/* Security Scanner Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute left-0 w-1 h-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 scanner-line"
        />
      </div>
    </div>
  );
}