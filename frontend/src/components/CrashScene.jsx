import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

export default function CrashScene({ accident, compact = false }) {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.scene-copy > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' });
      gsap.fromTo('.scene-meta span', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, delay: 0.25, ease: 'power2.out' });
    }, sceneRef);

    return () => context.revert();
  }, [accident.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sceneRef.current;
    if (!canvas || !container) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071011, 0.035);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(6.8, 4.6, 8.8);
    camera.lookAt(0, -0.2, 0);

    const ambient = new THREE.AmbientLight(0xd8f4e8, 0.72);
    const keyLight = new THREE.DirectionalLight(0xffd6a0, 2.8);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    const fillLight = new THREE.PointLight(0x74f2c6, 2.4, 16);
    fillLight.position.set(-4, 2.6, 3);
    scene.add(ambient, keyLight, fillLight);

    const root = new THREE.Group();
    scene.add(root);
    buildScene(root, accident);

    gsap.fromTo(
      root.rotation,
      { x: -0.18, y: -0.5, z: 0.05 },
      { x: 0, y: 0, z: 0, duration: 1.35, ease: 'expo.out' },
    );
    gsap.fromTo(root.scale, { x: 0.72, y: 0.72, z: 0.72 }, { x: 1, y: 1, z: 1, duration: 1.15, ease: 'power3.out' });

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      root.rotation.y = Math.sin(elapsed * 0.22) * 0.08;
      root.position.y = Math.sin(elapsed * 0.55) * 0.035;
      scene.traverse((object) => {
        if (object.userData.spin) object.rotation[object.userData.spin.axis] += object.userData.spin.speed;
        if (object.userData.pulse) object.material.opacity = object.userData.pulse.base + Math.sin(elapsed * object.userData.pulse.speed) * object.userData.pulse.range;
        if (object.userData.float) object.position.y = object.userData.float.base + Math.sin(elapsed * object.userData.float.speed + object.userData.float.offset) * object.userData.float.range;
        if (object.userData.drift) object.position.x = object.userData.drift.base + Math.sin(elapsed * object.userData.drift.speed + object.userData.drift.offset) * object.userData.drift.range;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      disposeObject(root);
      renderer.dispose();
    };
  }, [accident.id]);

  return (
    <div ref={sceneRef} className={`scene-shell ${compact ? 'scene-shell-compact' : ''}`}>
      <canvas ref={canvasRef} className="three-scene" />
      <div className="scene-copy">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-radar">Reconstructed Site</p>
        <h2 className="mt-1 text-xl font-bold text-paper md:text-2xl">3D 事故现场重建</h2>
        <p className="mt-2 max-w-xl text-xs leading-6 text-white/50">{accident.description}</p>
      </div>
      <div className="scene-meta">
        <span>{accident.location}</span>
        <span>{accident.flight_phase}</span>
        <span>{accident.aircraft}</span>
      </div>
    </div>
  );
}

function buildScene(root, accident) {
  addGrid(root);
  addBeacons(root);

  if (accident.title.includes('无人机')) {
    buildDroneScene(root);
  } else if (accident.title.includes('特内里费')) {
    buildTenerifeScene(root);
  } else if (accident.title.includes('法航')) {
    buildStallScene(root);
  } else if (accident.title.includes('涡轮')) {
    buildTurbineScene(root);
  } else {
    buildAlaskaScene(root);
  }
}

function buildAlaskaScene(root) {
  const jet = createJet({ body: 0xd9d2bd, tail: 0xffb454 });
  jet.position.set(0.8, 0.52, 0.2);
  jet.rotation.set(-0.1, -0.52, 0.14);
  jet.scale.setScalar(0.82);
  jet.userData.float = { base: jet.position.y, range: 0.08, speed: 1.1, offset: 0.2 };
  jet.userData.drift = { base: jet.position.x, range: 0.08, speed: 0.7, offset: 0.4 };
  root.add(jet);
  root.add(createBlackBox(new THREE.Vector3(-1.2, 0.18, 1.25)));
  root.add(createDebrisField(0x74f2c6));
}

function buildTurbineScene(root) {
  addRunway(root);
  const jet = createJet({ body: 0xd8d5ca, tail: 0xff6b57 });
  jet.position.set(-0.35, 0.44, -0.12);
  jet.rotation.set(0.08, -0.18, -0.05);
  jet.scale.setScalar(0.78);
  root.add(jet);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.05, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0xff6b57, roughness: 0.52, metalness: 0.3 }),
  );
  ring.position.set(-1.55, 0.4, 0.66);
  ring.rotation.set(Math.PI / 2, 0.4, 0.2);
  ring.userData.spin = { axis: 'z', speed: 0.014 };
  jet.userData.float = { base: jet.position.y, range: 0.035, speed: 0.9, offset: 0 };
  root.add(ring);
}

function buildDroneScene(root) {
  addTerrain(root);
  const drone = createDrone();
  drone.position.set(0.45, 0.8, 0);
  drone.rotation.set(0.52, 0.35, -0.35);
  drone.userData.float = { base: drone.position.y, range: 0.16, speed: 1.8, offset: 0.7 };
  drone.userData.drift = { base: drone.position.x, range: 0.16, speed: 1.0, offset: 1.2 };
  root.add(drone);
  root.add(createPathLine(0xffb454));
}

function buildStallScene(root) {
  addOcean(root);
  const jet = createJet({ body: 0xcbd4d2, tail: 0x74f2c6 });
  jet.position.set(0.15, 0.9, 0.25);
  jet.rotation.set(0.58, -0.48, 0.3);
  jet.scale.setScalar(0.82);
  jet.userData.float = { base: jet.position.y, range: 0.14, speed: 1.05, offset: 0.6 };
  jet.userData.drift = { base: jet.position.x, range: 0.1, speed: 0.65, offset: 0.3 };
  root.add(jet);
  root.add(createPathLine(0x74f2c6, true));
}

function buildTenerifeScene(root) {
  addRunway(root, true);
  const klm = createJet({ body: 0xd8d1bd, tail: 0xffb454 });
  klm.position.set(-1.35, 0.38, -0.22);
  klm.rotation.set(0, -0.1, 0);
  klm.scale.setScalar(0.64);
  const panAm = createJet({ body: 0xd1d9d6, tail: 0x74f2c6 });
  panAm.position.set(1.18, 0.38, 0.26);
  panAm.rotation.set(0, Math.PI * 0.85, 0.04);
  panAm.scale.setScalar(0.62);
  klm.userData.drift = { base: klm.position.x, range: 0.06, speed: 0.55, offset: 0 };
  panAm.userData.drift = { base: panAm.position.x, range: 0.04, speed: 0.5, offset: 1.5 };
  root.add(klm, panAm);
  addFogPlanes(root);
}

function createJet({ body, tail }) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: body, roughness: 0.48, metalness: 0.18 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xb8b7aa, roughness: 0.58, metalness: 0.12 });
  const tailMat = new THREE.MeshStandardMaterial({ color: tail, roughness: 0.5, metalness: 0.08 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c2c29, roughness: 0.55 });

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 2.9, 12, 28), bodyMat);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), bodyMat);
  nose.position.x = 1.48;
  nose.scale.set(1.1, 0.86, 0.86);
  group.add(nose);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.42), wingMat);
  wing.position.set(-0.08, -0.02, 0);
  wing.rotation.y = -0.08;
  wing.castShadow = true;
  group.add(wing);

  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.22), wingMat);
  leftWing.position.set(-0.22, -0.02, 0.55);
  leftWing.rotation.y = -0.5;
  group.add(leftWing);
  const rightWing = leftWing.clone();
  rightWing.position.z = -0.55;
  rightWing.rotation.y = 0.5;
  group.add(rightWing);

  const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.58, 3), tailMat);
  tailFin.position.set(-1.34, 0.38, 0);
  tailFin.rotation.set(0, 0, Math.PI / 2);
  group.add(tailFin);

  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.045, 0.22), wingMat);
  tailWing.position.set(-1.26, 0.08, 0);
  group.add(tailWing);

  for (let i = 0; i < 9; i += 1) {
    const windowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), darkMat);
    windowMesh.position.set(0.78 - i * 0.18, 0.18, 0.195);
    group.add(windowMesh);
  }

  return group;
}

function createDrone() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: 0.5, metalness: 0.15 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xffb454, roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.48), mat);
  group.add(body);

  const armA = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.055, 0.055), mat);
  const armB = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 1.45), mat);
  group.add(armA, armB);

  [[0.82, 0.72], [0.82, -0.72], [-0.82, 0.72], [-0.82, -0.72]].forEach(([x, z]) => {
    const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 10, 32), accent);
    rotor.position.set(x, 0.05, z);
    rotor.rotation.x = Math.PI / 2;
    rotor.userData.spin = { axis: 'z', speed: 0.08 };
    group.add(rotor);
  });
  return group;
}

function createBlackBox(position) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.18, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xff7b2f, roughness: 0.42, metalness: 0.15, emissive: 0x3a1206 }),
  );
  box.position.copy(position);
  box.rotation.set(0.12, -0.45, 0.08);
  return box;
}

function addGrid(root) {
  const grid = new THREE.GridHelper(8, 18, 0x2f7b68, 0x174238);
  grid.position.y = -0.02;
  grid.material.opacity = 0.22;
  grid.material.transparent = true;
  root.add(grid);
}

function addRunway(root, foggy = false) {
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.035, 1.18),
    new THREE.MeshStandardMaterial({ color: foggy ? 0x202621 : 0x252a25, roughness: 0.8 }),
  );
  runway.position.y = 0.01;
  runway.receiveShadow = true;
  root.add(runway);
  for (let i = -3; i <= 3; i += 1) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.035), new THREE.MeshBasicMaterial({ color: 0xd8d0b8 }));
    mark.position.set(i, 0.05, 0);
    root.add(mark);
  }
}

function addTerrain(root) {
  const terrain = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 1),
    new THREE.MeshStandardMaterial({ color: 0x243b2c, roughness: 0.86, flatShading: true }),
  );
  terrain.position.set(-0.25, -1.45, 0.15);
  terrain.scale.set(1.6, 0.38, 1.1);
  root.add(terrain);
}

function addOcean(root) {
  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x0b2a2c, roughness: 0.72, metalness: 0.12, transparent: true, opacity: 0.72 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -0.04;
  root.add(ocean);
}

function addFogPlanes(root) {
  const fogMat = new THREE.MeshBasicMaterial({ color: 0xd8d8c8, transparent: true, opacity: 0.18, depthWrite: false });
  for (let i = 0; i < 5; i += 1) {
    const fog = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.62), fogMat.clone());
    fog.position.set(-2.8 + i * 1.35, 0.7 + (i % 2) * 0.18, -0.9 + i * 0.28);
    fog.rotation.set(-0.2, -0.45, 0.04);
    fog.userData.pulse = { base: 0.13, range: 0.06, speed: 0.8 + i * 0.08 };
    root.add(fog);
  }
}

function addBeacons(root) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x74f2c6, transparent: true, opacity: 0.65 });
  [[-2.2, 0.12, 1.8], [2.1, 0.12, -1.5], [0.4, 0.12, 2.4]].forEach((position, index) => {
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), mat.clone());
    beacon.position.set(...position);
    beacon.userData.pulse = { base: 0.36, range: 0.28, speed: 1.1 + index * 0.18 };
    root.add(beacon);
  });
}

function createDebrisField(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.75, transparent: true, opacity: 0.78 });
  for (let i = 0; i < 10; i += 1) {
    const shard = new THREE.Mesh(new THREE.BoxGeometry(0.12 + i * 0.01, 0.035, 0.04), mat);
    shard.position.set(-2.5 + Math.random() * 1.5, 0.08, -0.8 + Math.random() * 1.5);
    shard.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(shard);
  }
  return group;
}

function createPathLine(color, vertical = false) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 });
  for (let i = 0; i < 5; i += 1) {
    const segment = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.03), mat);
    segment.position.set(-2 + i * 0.75, 0.55 + (vertical ? i * 0.22 : Math.sin(i) * 0.18), -1.5 + i * 0.55);
    segment.rotation.y = -0.65;
    segment.rotation.z = vertical ? -0.55 : 0.2;
    group.add(segment);
  }
  return group;
}

function disposeObject(object) {
  object.traverse((item) => {
    if (item.geometry) item.geometry.dispose();
    if (item.material) {
      if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
      else item.material.dispose();
    }
  });
}
